require "active_support/all"
require 'nokogiri'
require 'open-uri'
require 'json'

module Helpers
  extend ActiveSupport::NumberHelper
end

# Render a Google Scholar citation count for one article.
#
# Lookup order:
#   1. In-memory cache (one build).
#   2. Disk cache at _data/scholar_cache.json (populated by
#      bin/refresh_scholar_cache.rb).
#   3. Live Scholar scrape (existing fallback).
#   4. The string "N/A" if the scrape fails.
#
# Why the disk cache: Google Scholar aggressively rate-limits scrapers
# from cloud IPs (and increasingly from any IP). Without a cache, builds
# on GitHub Actions run into the rate limit early, every subsequent
# fetch raises, and every badge falls back to "N/A". The disk cache
# decouples the build from Scholar — it never has to hit the network as
# long as the cache contains the article. The refresh script (run
# manually or on a schedule) keeps the cache reasonably fresh.
module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    Citations = {}

    DISK_CACHE_PATH = File.join(Dir.pwd, '_data', 'scholar_cache.json')

    @@disk_cache = nil

    def self.disk_cache
      return @@disk_cache unless @@disk_cache.nil?
      if File.exist?(DISK_CACHE_PATH)
        begin
          @@disk_cache = JSON.parse(File.read(DISK_CACHE_PATH))
        rescue => e
          puts "google-scholar-citations: failed to parse #{DISK_CACHE_PATH}: #{e.class} - #{e.message}"
          @@disk_cache = {}
        end
      else
        @@disk_cache = {}
      end
      @@disk_cache
    end

    def initialize(tag_name, params, tokens)
      super
      splitted = params.split(" ").map(&:strip)
      @scholar_id = splitted[0]
      @article_id = splitted[1]

      if @scholar_id.nil? || @scholar_id.empty?
        puts "Invalid scholar_id provided"
      end

      if @article_id.nil? || @article_id.empty?
        puts "Invalid article_id provided"
      end
    end

    def render(context)
      article_id = context[@article_id.strip].to_s
      scholar_id = context[@scholar_id.strip].to_s

      # In-memory cache for this build
      return Citations[article_id] if Citations.key?(article_id)

      # Disk cache (populated by bin/refresh_scholar_cache.rb)
      cache = self.class.disk_cache
      if cache.key?(article_id)
        entry = cache[article_id]
        value = entry.is_a?(Hash) ? entry['count'] : entry
        formatted = format_citation_count(value)
        Citations[article_id] = formatted
        return formatted
      end

      # Cache miss — try the live scrape (legacy behaviour)
      formatted = scrape_live(scholar_id, article_id)
      Citations[article_id] = formatted
      formatted
    end

    private

    def format_citation_count(value)
      return value if value.nil? || value == "N/A"
      n = value.to_s.tr(",", "").to_i
      return value.to_s if n == 0 && value.to_s !~ /^0+$/
      Helpers.number_to_human(n,
                              format:    '%n%u',
                              precision: 2,
                              units:     { thousand: 'K', million: 'M', billion: 'B' })
    end

    def scrape_live(scholar_id, article_id)
      article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
      begin
        sleep(rand(1.5..3.5))
        doc = Nokogiri::HTML(URI.open(article_url, "User-Agent" => "Ruby/#{RUBY_VERSION}"))

        citation_count = 0
        desc = doc.css('meta[name="description"]').first
        og_desc = doc.css('meta[property="og:description"]').first

        text =
          if desc && !desc.content.to_s.empty? then desc.content
          elsif og_desc && !og_desc.content.to_s.empty? then og_desc.content
          else ""
          end

        m = text.match(/Cited by (\d+[,\d]*)/)
        citation_count = m[1].sub(",", "").to_i if m

        format_citation_count(citation_count)
      rescue => e
        puts "google-scholar-citations: error fetching #{article_id} from #{article_url}: #{e.class} - #{e.message}"
        "N/A"
      end
    end
  end
end

Liquid::Template.register_tag('google_scholar_citations', Jekyll::GoogleScholarCitationsTag)
