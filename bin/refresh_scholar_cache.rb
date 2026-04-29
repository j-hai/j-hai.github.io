#!/usr/bin/env ruby
# =============================================================================
# Refresh _data/scholar_cache.json with current Google Scholar citation counts.
# =============================================================================
#
# Usage:
#
#   ruby bin/refresh_scholar_cache.rb
#   ruby bin/refresh_scholar_cache.rb --scholar-id=USER_ID
#   ruby bin/refresh_scholar_cache.rb --only=ARTICLE_ID1,ARTICLE_ID2
#
# Why this exists:
#   The Jekyll build never scrapes Google Scholar from CI any more. It
#   reads citation counts from _data/scholar_cache.json. This script is
#   how that cache is kept current — run it locally (residential IP,
#   far less likely to be rate-limited than GitHub Actions runners) or
#   on a scheduled workflow that commits the result.
#
# Resilience:
#   * Existing cache values are preserved on Scholar errors. A partial
#     run does not destroy data.
#   * Cache is written after each successful fetch, so an interrupted
#     run still saves the progress made so far.
#   * Sleeps 5–10 s between requests to be polite. Even with that you
#     may get rate-limited mid-run on a large bibliography; just
#     re-run later — already-cached entries will be skipped unless
#     `--force` is given.
#
# Args:
#   --scholar-id=ID    override the user ID (default: from
#                      _data/socials.yml's scholar_userid)
#   --only=A,B,C       refresh only these article_ids
#   --force            re-fetch even already-cached entries
#   --max=N            stop after the N-th request (useful when
#                      Scholar is blocking; lets you make N requests
#                      now, run again later for the rest)
# =============================================================================

require 'nokogiri'
require 'open-uri'
require 'json'
require 'yaml'
require 'time'
require 'fileutils'

# ---- locate paths ---------------------------------------------------------
ROOT = File.expand_path('..', __dir__)
SOCIALS_PATH = File.join(ROOT, '_data', 'socials.yml')
CACHE_PATH   = File.join(ROOT, '_data', 'scholar_cache.json')
BIB_GLOB     = File.join(ROOT, '_bibliography', '*.bib')

# ---- args -----------------------------------------------------------------
opt_scholar_id = nil
opt_only       = nil
opt_force      = false
opt_max        = nil
ARGV.each do |a|
  if a.start_with?('--scholar-id=')
    opt_scholar_id = a.sub('--scholar-id=', '')
  elsif a.start_with?('--only=')
    opt_only = a.sub('--only=', '').split(',').map(&:strip)
  elsif a == '--force'
    opt_force = true
  elsif a.start_with?('--max=')
    opt_max = a.sub('--max=', '').to_i
  else
    abort "Unknown arg: #{a}"
  end
end

# ---- read scholar_userid from socials.yml ---------------------------------
scholar_id = opt_scholar_id
if scholar_id.nil?
  abort "missing #{SOCIALS_PATH}" unless File.exist?(SOCIALS_PATH)
  socials = YAML.load_file(SOCIALS_PATH)
  scholar_id = socials['scholar_userid']
end
abort "no scholar_userid in #{SOCIALS_PATH} (and --scholar-id not given)" if scholar_id.to_s.empty?

# ---- collect google_scholar_id values from .bib files --------------------
bib_files = Dir[BIB_GLOB]
abort "no .bib files found in _bibliography/" if bib_files.empty?

ids = []
bib_files.each do |path|
  content = File.read(path)
  # Tolerant of {value} and "value" forms.
  content.scan(/google_scholar_id\s*=\s*[\{"]([^\}"]+)[\}"]/).each { |m| ids << m[0].strip }
end
ids = ids.uniq

if opt_only
  ids = ids & opt_only
end

puts "Scholar ID:  #{scholar_id}"
puts "Bib files:   #{bib_files.length} (#{bib_files.map { |p| File.basename(p) }.join(', ')})"
puts "Articles:    #{ids.length} candidate google_scholar_id values"
puts ""

# ---- load existing cache --------------------------------------------------
cache =
  if File.exist?(CACHE_PATH)
    begin
      JSON.parse(File.read(CACHE_PATH))
    rescue => e
      warn "warning: could not parse #{CACHE_PATH}: #{e.message}; starting from {}"
      {}
    end
  else
    {}
  end

# ---- fetch -----------------------------------------------------------------
fetched = 0
skipped = 0
errors  = 0

ids.each_with_index do |article_id, i|
  if !opt_force && cache.key?(article_id)
    skipped += 1
    next
  end

  if opt_max && fetched >= opt_max
    puts "[stop] hit --max=#{opt_max}; stopping early"
    break
  end

  url = "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"

  begin
    sleep(5 + rand(5))   # be polite — 5–10 s
    html = URI.open(url,
                    'User-Agent' => 'Mozilla/5.0 (compatible; al-folio refresh_scholar_cache.rb)',
                    read_timeout: 30).read
    doc = Nokogiri::HTML(html)

    text =
      doc.css('meta[name="description"]').first&.[]('content') ||
      doc.css('meta[property="og:description"]').first&.[]('content') || ''

    m = text.match(/Cited by (\d+[,\d]*)/)
    if m
      count = m[1].tr(',', '').to_i
      cache[article_id] = { 'count' => count.to_s, 'fetched_at' => Time.now.utc.iso8601 }
      fetched += 1
      puts "  [#{i + 1}/#{ids.length}] #{article_id}: #{count}"
    else
      cache[article_id] ||= { 'count' => '0', 'fetched_at' => Time.now.utc.iso8601 }
      fetched += 1
      puts "  [#{i + 1}/#{ids.length}] #{article_id}: no 'Cited by' (0)"
    end
  rescue => e
    errors += 1
    warn "  [#{i + 1}/#{ids.length}] #{article_id}: ERROR #{e.class}: #{e.message}"
    # leave any existing cache value alone
  end

  # Persist after each iteration so interrupted runs keep partial progress.
  File.write(CACHE_PATH, JSON.pretty_generate(cache.sort.to_h))
end

puts ""
puts "Done. Cache at #{CACHE_PATH}"
puts "  fetched: #{fetched}"
puts "  skipped: #{skipped} (already cached; pass --force to re-fetch)"
puts "  errors:  #{errors}"
