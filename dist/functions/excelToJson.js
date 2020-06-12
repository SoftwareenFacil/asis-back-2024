"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getJsonFromExcel;

var _xlsx = _interopRequireDefault(require("xlsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getJsonFromExcel(file) {
  var wb = _xlsx["default"].readFile(file);

  return wb.SheetNames;
}