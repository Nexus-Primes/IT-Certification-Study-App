# Releasing a new version

Every release is one number: `APP_VERSION` in `app/app.js` (for example `v241`). The Windows
installer version is derived from it (`241.0.0`), and the Git tag is the same number (`v241`).
Publishing is always a deliberate click: CI only ever creates a **draft** release, and the in-app
updater cannot see drafts.

## Steps

1. **Make the change.** Edit the app as usual. Never edit `data/*.js` by hand (see `tools/content/README.md`).
2. **Bump the version in lockstep** (the static tests fail if any of these drift):
   - `APP_VERSION` in `app/app.js`: `'v241'`
   - `CACHE` in `service-worker.js`: `'cert-study-v241'`
   - the `?v=` number on every `index.html` tag for a file you changed (and on its `import` line in `app.js`), including `app.js` itself
   - a new entry at the **top** of `app/changelog.js` with `version: 'v241'` (this feeds the in-app "What's new" panel and the GitHub release text)
   - any new file under `app/` or `data/` added to `ASSETS` in `service-worker.js`
3. **Sync the installer version:** `npm run sync-version` (writes `package.json` / `package-lock.json`). `npm run check-version` verifies it.
4. **Test.**
   - `python tests/run.py` (about 16 minutes, drives headless Edge; needs `pip install pymupdf` for the PDF checks)
   - `npm run test:desktop` (backend, Python/Node parity, updater, legacy-data import)
   - `node desktop/tests/e2e/smoke.js` and `node desktop/tests/e2e/update-feed.js` (the real app and the real updater against a local fake feed)
5. **Commit, tag, push:**
   ```
   git add -A
   git commit -m "v241: <what changed>"
   git tag v241
   git push origin master --tags
   ```
6. **Wait for the `Release` workflow.** It runs the full suite, builds `Cert-Study-Setup-241.0.0.exe`, its `.blockmap` and `latest.yml`, and attaches them to a **draft** release.
7. **Check the draft** on GitHub: three files attached, notes read well, the installer size is about the same as last time.
8. **Publish the draft.** That is the moment installed copies can see it. They will offer it in Settings, About and updates (and a quiet toast), and only download when the user clicks.

## If something goes wrong

- Do not delete a published release that people may have already downloaded. Publish a newer version instead (the updater never downgrades).
- To pull a bad release before many people have it, mark it as a draft again; installed copies then stop seeing it.
- User data is never inside the program folder, so uninstalling or reinstalling an older build does not touch it. Keep any data migration backwards compatible, since someone can reinstall an older build.

## Notes

- The installer is **not code-signed**. Windows SmartScreen shows "unknown publisher" the first time; users choose More info, then Run anyway. Automatic updates still work unsigned.
- The updater reads `latest.yml` and the installer from the public GitHub release, with no token.
- Local fake-feed rehearsal: set `CERT_STUDY_DATA_DIR` (a throwaway folder) and `CERT_STUDY_UPDATE_FEED` (a URL serving `latest.yml`). The feed override is ignored unless a test data folder is also set.
