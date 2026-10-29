# Mal's links

The link in Mal's TikTok bio: **links.askmal.live**. One page (`index.html`) in the Ask Mal LIVE arcade look:
Season Ticket (free Discord, via ticket.askmal.live/plans), RotoBot with code MAL, Ask Mal LIVE, YouTube and X, dressed
for the season.

- **Always on.** It's on GitHub Pages (free), separate from Ask Mal LIVE, so it never sleeps and editing it never
  restarts askmal.live or clears the line. (Render's free plan is out of custom domains: askmal.live and
  ticket.askmal.live use both.)
- **LIVE banner.** The page asks `https://askmal.live/api/status` every 20 s and shows "Mal is LIVE now" while the line
  is open and the stream overlay is running.
- **Taps** go to Ask Mal's `/api/t` → PostHog: `$pageview` (page `links`) and `link_tap` with `to` = which link.

## Looks

The page picks its look from the date, Eastern time (the small script in `<head>`); nobody has to switch anything.
Each look is a pixel scene behind the page plus touches on the cards, in `looks/<name>.js` on the shared `looks/kit.js`,
with its colors in `index.html` under `html.<name>`. Preview any look with `?look=fall` (or winter, spring, summer,
halloween).

| Look | When | What moves |
|---|---|---|
| Fall | Sep 22 to Dec 20 | Harvest sunset: leaves fall, gust across and settle on the cards; geese; a MAL blimp; sun rays |
| Winter | Dec 21 to Mar 19 | Snowy night: northern lights; snow on the name and cards; icicles drip; chimney smoke; shooting stars |
| Spring | Mar 20 to Jun 20 | Fresh morning: a shower then a rainbow; a turning windmill; butterflies; blossoms on the cards |
| Summer | Jun 21 to Sep 21 | Synthwave beach: striped sun; a dolphin leaps; fireworks; the biplane dogfight; the RotoBot card's neon buzzes |
| Halloween | Oct 24 until the first weekday morning after Oct 31 | Haunted hill: bats, lightning, a ghost, a witch, drips |

Holidays take over from 7 days before the day until 6 AM on the next weekday after it (`HOLIDAYS` in the `<head>`
script); a holiday look needs its own `looks/<name>.js` and colors. Days turn over at 6 AM Eastern.

## Change a link

Edit `index.html`, check it locally (`python -m http.server 8808`), then commit and push to `main`. GitHub Pages
publishes it in about a minute; phones that opened it in the last 10 minutes may show the old copy until then.

## First-time setup

1. GitHub → this repo → Settings → Pages: deploy from branch `main`, folder `/`. Custom domain `links.askmal.live`
   (the `CNAME` file holds it).
2. GoDaddy → askmal.live → DNS → add a **CNAME**: name `links`, value `nrosamalave.github.io`.
3. Once GitHub shows the domain check passed, tick **Enforce HTTPS**, then open https://links.askmal.live.
