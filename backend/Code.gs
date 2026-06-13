/**
 * Boiardo Individual Lab — mini-backend prenotazioni (Google Apps Script)
 *
 * Funzioni:
 *  - GET  ?action=availability        -> { ok, capacity, counts: { "YYYY-MM-DD_1830": n, ... } }
 *  - POST  (body JSON, text/plain)     -> registra la prenotazione (max CAPACITY per slot)
 *  - Supporto JSONP: aggiungi &callback=nomeFunzione per evitare problemi CORS in GET.
 *
 * Deploy: vedi DEPLOY.md. Il foglio "Prenotazioni" viene creato in automatico.
 */

var CAPACITY = 10;                 // posti per slot
var SHEET_NAME = 'Prenotazioni';
var HORIZON_WEEKS = 4;             // quante settimane avanti sono accettate
var SLOT_SUFFIX = '1830';         // martedì/mercoledì 18:30
var SLOT_DOWS = [2, 3];           // 2 = martedì, 3 = mercoledì (Date.getDay)
var SLOT_KEY_RE = /^\d{4}-\d{2}-\d{2}_1830$/;

function doGet(e) {
  return reply({ ok: true, capacity: CAPACITY, counts: getCounts() }, e);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return reply({ ok: false, error: 'server occupato, riprova' }, e);
  }
  try {
    var data = JSON.parse(e.postData.contents);

    // honeypot anti-bot: il campo deve restare vuoto
    if (String(data.website || '').trim() !== '') {
      return reply({ ok: true, remaining: CAPACITY }, e); // finge successo, non registra
    }

    if (!validSlot(data.slotKey)) {
      return reply({ ok: false, error: 'Slot non valido o non più disponibile.' }, e);
    }
    var required = ['atleta', 'genitore', 'telefono', 'annata', 'formula', 'slotKey'];
    for (var i = 0; i < required.length; i++) {
      if (String(data[required[i]] || '').trim() === '') {
        return reply({ ok: false, error: 'Campo mancante: ' + required[i] }, e);
      }
    }
    if (data.consenso !== true) {
      return reply({ ok: false, error: 'Consenso del genitore/tutore mancante.' }, e);
    }

    var sheet = getSheet();
    var count = countForSlot(sheet, data.slotKey);
    if (count >= CAPACITY) {
      return reply({ ok: false, error: 'full', remaining: 0 }, e);
    }

    sheet.appendRow([
      new Date(),
      data.slotKey,
      String(data.dateLabel || ''),
      String(data.dayLabel || ''),
      '18:30-19:30',
      String(data.annata),
      String(data.atleta),
      String(data.genitore),
      "'" + String(data.telefono),     // apostrofo: il foglio lo tiene come testo
      String(data.email || ''),
      String(data.formula),
      String(data.note || '')
    ]);

    return reply({ ok: true, remaining: CAPACITY - (count + 1) }, e);
  } catch (err) {
    return reply({ ok: false, error: String(err) }, e);
  } finally {
    lock.releaseLock();
  }
}

/* ---------- helpers ---------- */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'SlotKey', 'Data', 'Giorno', 'Orario', 'Annata',
      'Atleta', 'Genitore/Tutore', 'Telefono', 'Email', 'Formula', 'Note']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function getCounts() {
  var sh = getSheet();
  var last = sh.getLastRow();
  var counts = {};
  if (last >= 2) {
    var keys = sh.getRange(2, 2, last - 1, 1).getValues(); // colonna B = SlotKey
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i][0];
      if (k) counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts;
}

function countForSlot(sheet, slotKey) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var keys = sheet.getRange(2, 2, last - 1, 1).getValues();
  var n = 0;
  for (var i = 0; i < keys.length; i++) if (keys[i][0] === slotKey) n++;
  return n;
}

function validSlot(key) {
  if (!key || !SLOT_KEY_RE.test(key)) return false;
  var parts = key.slice(0, 10).split('-');
  var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  var date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false; // data inesistente
  if (SLOT_DOWS.indexOf(date.getDay()) === -1) return false; // solo mar/mer
  var now = new Date();
  var t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var minD = new Date(t0); minD.setDate(minD.getDate() - 1);                     // tolleranza fuso
  var maxD = new Date(t0); maxD.setDate(maxD.getDate() + HORIZON_WEEKS * 7 + 1);
  return date >= minD && date <= maxD;
}

function reply(obj, e) {
  var json = JSON.stringify(obj);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
