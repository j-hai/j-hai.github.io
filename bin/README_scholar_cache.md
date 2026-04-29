# Scholar citation cache

Google Scholar aggressively rate-limits scrapers, which made the
`google_scholar_citations` Liquid tag fall back to `"N/A"` on every
build. The fix:

* **`_plugins/google-scholar-citations.rb`** now reads from
  `_data/scholar_cache.json` first, only scrapes Scholar live on a
  cache miss, and only emits `"N/A"` if both lookups fail.
* **`_data/scholar_cache.json`** is the on-disk cache. JSON keyed by
  Google Scholar `article_id` → `{ count, fetched_at }`.
* **`bin/refresh_scholar_cache.rb`** is the manual refresh tool.

## Refresh the cache

```sh
ruby bin/refresh_scholar_cache.rb              # all entries; 5–10 s
                                               # sleep between fetches
ruby bin/refresh_scholar_cache.rb --max=20     # stop after 20 fetches
                                               # (helpful when Scholar
                                               # is blocking)
ruby bin/refresh_scholar_cache.rb --force      # re-fetch even cached
ruby bin/refresh_scholar_cache.rb \
       --only=WF5omc3nYNoC,86PQX7AUzd4C        # specific articles
```

## When to run

* Manually whenever you want updated numbers (recommended monthly).
* The script preserves existing cache values on Scholar errors and
  writes after each successful fetch, so an interrupted run keeps
  the progress made so far. Re-run it later for the rest.
* If you want this fully automated, add a scheduled GitHub Actions
  workflow that runs this script and commits the resulting JSON
  diff. (Not added by default because cron-driven scrapers tend to
  trigger Scholar's bot defenses harder than residential IPs.)

## What the build does at deploy time

The deploy workflow (`.github/workflows/deploy.yml`) does **not**
hit Scholar for any cached article. It reads the JSON, formats the
counts (e.g., `6963` → `7.0K`), and stamps them into the page. Even
if Scholar is fully blocking, the published site shows real numbers.
