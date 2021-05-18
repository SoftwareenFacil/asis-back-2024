"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFechaVencExam = getFechaVencExam;

var _moment = _interopRequireDefault(require("moment"));

var _var = require("../constant/var");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getFechaVencExam(fecha, vigencia) {
  var d = new Date(fecha);
  var v = parseInt(vigencia) || 6;
  var nuevomes = d.getMonth() + v;
  d.setMonth(nuevomes);
  d.setDate(d.getDate() + 1);
  return (0, _moment["default"])(d).format(_var.FORMAT_DATE);
}