/**
 * signexus.tech form backend: Google Apps Script bound to a Google Sheet.
 * Every submission gets a row in the "Waitlist" sheet and an email to TO.
 * Setup steps are in README.md at the root of the repo.
 *
 * @OnlyCurrentDoc  Limits Sheets access to the one spreadsheet this script is attached to.
 */
const TO = 'info@signexus.tech';
const SHEET = 'Waitlist';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true });  // honeypot: real visitors never fill it

  const email = clip_(p.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'email' });

  // Ignore repeat submissions from the same address for 10 minutes.
  const cache = CacheService.getScriptCache();
  const key = 'seen:' + email.toLowerCase();
  if (cache.get(key)) return json_({ ok: true });
  cache.put(key, '1', 600);

  const kind = p.kind === 'message' ? 'message' : 'waitlist';
  const name = clip_(p.name, 120), company = clip_(p.company, 160), message = clip_(p.message, 4000);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET);
    if (!sh) {
      sh = ss.insertSheet(SHEET);
      sh.appendRow(['Time', 'Type', 'Email', 'Name', 'Company', 'Message']);
      sh.setFrozenRows(1);
    }
    // A leading apostrophe stops a value like "=HYPERLINK(...)" being run as a formula.
    sh.appendRow([new Date(), kind, email, name, company, message].map(safe_));
  } finally {
    lock.releaseLock();
  }

  const subject = (kind === 'message' ? 'Website message from ' : 'Waitlist signup: ') + (name || email);
  const body = [
    'Type:    ' + kind,
    'Email:   ' + email,
    'Name:    ' + (name || '-'),
    'Company: ' + (company || '-'),
    '',
    message || '(no message)',
  ].join('\n');
  MailApp.sendEmail({ to: TO, replyTo: email, subject: subject, body: body, name: 'signexus.tech' });

  return json_({ ok: true });
}

function doGet() {
  return ContentService.createTextOutput('ok');
}

function clip_(v, n) {
  return String(v || '').trim().slice(0, n);
}

function safe_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
