# Mal's links

The link in Mal's TikTok bio: **links.askmal.live**. One page (`index.html`) in the Ask Mal LIVE arcade look:
Season Ticket (free Discord, via ticket.askmal.live/plans), RotoBot with code MAL, Ask Mal LIVE, YouTube and X, with
fireworks and a biplane dogfight in the sky.

- **Always on.** It's on GitHub Pages (free), separate from Ask Mal LIVE, so it never sleeps and editing it never
  restarts askmal.live or clears the line. (Render's free plan is out of custom domains: askmal.live and
  ticket.askmal.live use both.)
- **LIVE banner.** The page asks `https://askmal.live/api/status` every 20 s and shows "Mal is LIVE now" while the line
  is open and the stream overlay is running.
- **Taps** go to Ask Mal's `/api/t` → PostHog: `$pageview` (page `links`) and `link_tap` with `to` = which link.
- **Halloween look** (`html.spooky`): a haunted hill under a full moon, blood-red name, bats, lightning, a ghost, a
  witch, a spider. It's on until 6 AM ET Monday Nov 2, 2026, then the normal look returns by itself (the date is in the
  small script in `<head>`). Preview either look with `?spooky=1` / `?spooky=0`.

## Change a link

Edit `index.html`, check it locally (`python -m http.server 8808`), then commit and push to `main`. GitHub Pages
publishes it in about a minute; phones that opened it in the last 10 minutes may show the old copy until then.

## First-time setup

1. GitHub → this repo → Settings → Pages: deploy from branch `main`, folder `/`. Custom domain `links.askmal.live`
   (the `CNAME` file holds it).
2. GoDaddy → askmal.live → DNS → add a **CNAME**: name `links`, value `nrosamalave.github.io`.
3. Once GitHub shows the domain check passed, tick **Enforce HTTPS**, then open https://links.askmal.live.
