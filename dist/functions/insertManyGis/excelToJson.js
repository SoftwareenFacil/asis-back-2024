"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getJsonFromExcel;

var _xlsx = _interopRequireDefault(require("xlsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getJsonFromExcel(file, name) {
  var wb = _xlsx["default"].readFile(file);

  var ws = wb.Sheets[name];

  var data = _xlsx["default"].utils.sheet_to_json(ws);

  return data;
}