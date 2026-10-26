// Laude - upiti u tabelu ispod. Zalijepi cijeli fajl u Apps Script i objavi novu verziju.
// Execute as: Me. Who has access: Anyone. Vremenska zona: Europe/Sarajevo.
const SHEET_ID = '1Z0eNgyfexfErOtZjyDIPmD_JATGapRYEbEExLT7pYcg'

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents
    if (!raw) return out({ ok: false, error: 'prazan zahtjev' })
    const data = JSON.parse(raw)
    if (data.company) return out({ ok: true })
    const row = [
      Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Sarajevo', 'dd.MM.yyyy. HH:mm'),
      clip(data.venue, 120),
      clip(data.type, 40),
      clip(data.name, 80),
      clip(data.contact, 120),
      clip(data.qty, 6),
      clip(data.msg, 2000),
    ]
    if (!row[1] || !row[3] || !row[4]) return out({ ok: false, error: 'nedostaju podaci' })
    const lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try { sheet_().appendRow(row) } finally { lock.releaseLock() }
    try { notify_(row) } catch (err) {}
    return out({ ok: true })
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) })
  }
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  let sheet = ss.getSheetByName('Upiti')
  if (!sheet) sheet = ss.insertSheet('Upiti')
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Datum', 'Lokal', 'Vrsta', 'Ime', 'Kontakt', 'Broj stalaka', 'Poruka'])
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function notify_(row) {
  const to = Session.getEffectiveUser().getEmail()
  if (!to) return
  MailApp.sendEmail(
    to,
    'Laude upit - ' + row[1],
    ['Novi upit s stranice.', '', 'Lokal: ' + row[1] + ' (' + row[2] + ')', 'Ime: ' + row[3], 'Kontakt: ' + row[4], 'Broj stalaka: ' + (row[5] || '-'), row[6] ? 'Poruka: ' + row[6] : ''].filter(Boolean).join('\n')
  )
}

function clip(v, n) {
  return String(v || '').trim().slice(0, n)
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
