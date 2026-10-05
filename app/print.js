// ---------- Print / save as PDF ----------
// Whatever gets printed or saved as a PDF (the browser's own Ctrl+P works on any page) carries the
// same quiet masthead: app, track, page, who it's for, and the date. The report sheets already open
// with their own title block, so they skip it rather than say everything twice. The browser's
// page-margin boxes (running head, page numbers) read the same text through two custom properties.
//
// app.js tells this module what the current page is by passing a function that returns
// { pageTitle, trackName, owner, hasOwnHeader }.

let currentInfo = () => ({ pageTitle: '', trackName: '', owner: '', hasOwnHeader: false });

export function syncPrintHeader(info = currentInfo()) {
  const header = document.getElementById('print-header'); if (!header) return;
  const date = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  const set = (key, text) => { const el = header.querySelector(`[data-print="${key}"]`); if (el) el.textContent = text; };
  set('page', info.pageTitle); set('track', info.trackName); set('owner', info.owner ? `Prepared for ${info.owner}` : ''); set('date', date);
  header.classList.toggle('is-off', !!info.hasOwnHeader);
  const css = text => JSON.stringify(text.replace(/[\u0000-\u001f]/g, ' '));
  document.documentElement.style.setProperty('--print-running-head', css(`Cert Study · ${info.trackName} · ${info.pageTitle}`));
  document.documentElement.style.setProperty('--print-running-foot', css(info.owner ? `${info.owner} · ${date}` : date));
}

// "Save as PDF" proposes the page title as the file name, so give it a descriptive one for the
// length of the print and put the normal tab title back afterwards.
export function initPrint(infoProvider) {
  currentInfo = infoProvider;
  let titleBeforePrint = null;
  let detailsOpenedForPrint = [];
  window.addEventListener('beforeprint', () => {
    const info = currentInfo();
    syncPrintHeader(info);
    titleBeforePrint = document.title;
    document.title = `${info.pageTitle} — ${info.trackName} — Cert Study`;
    // A collapsed <details> prints as just its summary line, which would silently drop the lists
    // inside it — open every one for the print, then put them back as they were.
    detailsOpenedForPrint = [...document.querySelectorAll('details:not([open])')];
    detailsOpenedForPrint.forEach(el => { el.open = true; });
  });
  window.addEventListener('afterprint', () => {
    if (titleBeforePrint != null) { document.title = titleBeforePrint; titleBeforePrint = null; }
    detailsOpenedForPrint.forEach(el => { el.open = false; });
    detailsOpenedForPrint = [];
  });
}
