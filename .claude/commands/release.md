---
description: Prepare and tag a new Cert Study release (stops before publishing)
---

Prepare a new Cert Study release by following `RELEASING.md` exactly. The change to ship: $ARGUMENTS

1. Make the change. Read `CLAUDE.md` first for the rules the tests enforce.
2. Bump the version everywhere together: `APP_VERSION` in `app/app.js`, `CACHE` in `service-worker.js`, the `?v=` numbers for changed files in `index.html` and the matching `import` lines, a new top entry in `app/changelog.js`, new files in the service worker `ASSETS`. Then run `npm run sync-version`.
3. Run `python tests/run.py` (about 16 minutes, in the background, and do not edit the project meanwhile), `npm run test:desktop`, `node desktop/tests/e2e/smoke.js` and `node desktop/tests/e2e/update-feed.js`. Report any failure plainly; do not continue past one.
4. Show the owner the diff summary and ask for approval to commit, tag (`v<number>`) and push.
5. After the push, wait for the `Release` workflow and check the **draft** release has the installer, its `.blockmap` and `latest.yml`, and sensible notes.
6. Tell the owner the draft is ready. **Never publish the draft yourself** unless the owner explicitly says to in this conversation.
