# Mal's links

The link in Mal's TikTok bio: **links.askmal.live**. One page (`site/index.html`) in the Ask Mal LIVE arcade look:
Season Ticket (free Discord), RotoBot with code MAL, Ask Mal LIVE, YouTube and X, with shooting stars and a biplane
dogfight in the sky.

- **Always on.** It's a Render static site (free), separate from Ask Mal LIVE, so it never sleeps and editing it never
  restarts askmal.live or clears the line.
- **LIVE banner.** The page asks `https://askmal.live/api/status` every 20 s and shows "Mal is LIVE now" while the line
  is open and the stream overlay is running.
- **Taps** go to Ask Mal's `/api/t` → PostHog: `$pageview` (page `links`) and `link_tap` with `to` = which link.

## Change a link

Edit `site/index.html`, check it locally (`python -m http.server 8808 --directory site`), then commit and push to
`main`. Render publishes it in about a minute.

## First-time setup

1. Render → New → Blueprint → this repo → Apply (creates the free static site `mal-links` with links.askmal.live).
2. GoDaddy → askmal.live → DNS → add a **CNAME**: name `links`, value the site's `….onrender.com` address (shown at
   the top of the site's page in Render, usually `mal-links.onrender.com`).
3. Wait for Render to show the domain as verified (a few minutes), then open https://links.askmal.live.
