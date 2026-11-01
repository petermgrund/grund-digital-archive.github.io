This is the landing site for the permanent codes of the Grund Digital Archive.
GitHub Pages serves it at `https://codes.petermgrund.com`, and
`https://w3id.org/gda/<code>` redirects there.

## The domain

Three things keep `codes.petermgrund.com` working:

1. **DNS.** At the DNS provider for `petermgrund.com`, a `CNAME` record for
   `codes` points at `petermgrund.github.io`. If the zone is on Cloudflare,
   keep that record "DNS only" (grey cloud) so GitHub can issue the
   certificate.
2. **GitHub Pages.** In the repository's Settings > Pages, "Custom domain" is
   set to `codes.petermgrund.com`, and "Enforce HTTPS" is turned on once the
   certificate has been issued. The workflow in
   `.github/workflows/jekyll-gh-pages.yml` deploys the site on every push to
   `main`. With that kind of deployment GitHub reads the domain from the Pages
   settings, not from the `CNAME` file in this repository. The file is kept so
   the domain is recorded here, and so it takes effect if the site is ever
   switched to publishing from a branch.
3. **w3id.org.** The redirect for `https://w3id.org/gda/<code>` must send
   visitors to `https://codes.petermgrund.com/<code>`. It is changed with a
   pull request to the `perma-id/w3id.org` repository.

## The list of codes

`codes.txt` lists the codes of all objects in the archive, one per line. `#`
starts a comment, and spaces, hyphens and letter case are ignored. A
well-formed code that is not in the list gets a page saying there is no object
with that code. While the list is empty, or if it cannot be loaded, every
well-formed code is shown without that check, so the site keeps working until
the list is filled in. The list is public, like the rest of this site, and
GitHub Pages can serve the previous version for up to ten minutes after a
change.

## Settings at the top of the script in `404.html`

- `ASK_URL`: where "contact the keeper" leads to
- `FAMILY_ARCHIVE`: the family's own archive, which needs a sign-in
- `CODE_LIST`: the list of issued codes; set to `""` to show every
  well-formed code without checking it

## Working on the site

- `python3 tools/serve.py` serves the site at `http://localhost:8000` the way
  GitHub Pages does, so `http://localhost:8000/XFETYZ` behaves like
  `https://codes.petermgrund.com/XFETYZ`.
- `node tests/classify.test.mjs` checks how `404.html` reads a code from the
  address.
- `node tests/codelist.test.mjs` checks how `404.html` reads the list of codes
  and that every code in `codes.txt` is well formed.
