// ============================================================
// RuTra PnL Tracker — Google Apps Script
// Deploy this as a Web App to connect your Google Sheet
// to your hosted dashboard
// ============================================================

var SHEET_NAME = "Trades";
var COLUMNS = ["id","date","day","instrument","numberOfLots","grossPnl","charges","netPnl","capitalUsed","notes"];

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === "getTrades") return getTrades();
    return jsonResponse({ success: false, error: "Unknown action" });
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === "addTrade")    return addTrade(body.trade);
    if (action === "updateTrade") return updateTrade(body.trade);
    if (action === "deleteTrade") return deleteTrade(body.id);
    return jsonResponse({ success: false, error: "Unknown action" });
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getTrades() {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  var trades = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0] || !row[1]) continue; // skip rows with no id or no date
    trades.push(rowToTrade(row));
  }
  return jsonResponse({ success: true, trades: trades });
}

function addTrade(trade) {
  var sheet = getSheet();
  ensureHeaders(sheet);
  sheet.appendRow(tradeToRow(trade));
  return jsonResponse({ success: true });
}

function updateTrade(trade) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === trade.id) {
      sheet.getRange(i + 1, 1, 1, COLUMNS.length).setValues([tradeToRow(trade)]);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, error: "Trade not found" });
}

function deleteTrade(id) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, error: "Trade not found" });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    ensureHeaders(sheet);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
}

function rowToTrade(row) {
  return {
    id:           String(row[0] || ""),
    date:         String(row[1] || ""),
    day:          String(row[2] || ""),
    instrument:   String(row[3] || ""),
    numberOfLots: Number(row[4] || 0),
    grossPnl:     Number(row[5] || 0),
    charges:      Number(row[6] || 0),
    netPnl:       Number(row[7] || 0),
    capitalUsed:  row[8] !== "" ? Number(row[8]) : null,
    notes:        String(row[9] || ""),
  };
}

function tradeToRow(trade) {
  return [
    trade.id          || "",
    trade.date        || "",
    trade.day         || "",
    trade.instrument  || "",
    trade.numberOfLots || 0,
    trade.grossPnl    || 0,
    trade.charges     || 0,
    trade.netPnl      || 0,
    trade.capitalUsed != null ? trade.capitalUsed : "",
    trade.notes       || "",
  ];
}

function jsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
