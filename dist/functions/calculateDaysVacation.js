"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calculateVacationByDay;

var _cantDaysBetweenTwoDate = _interopRequireDefault(require("./cantDaysBetweenTwoDate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function calculateVacationByDay(fechainicio, fechafin) {
  var pivote = 15 / 365;
  var cantDias = (0, _cantDaysBetweenTwoDate["default"])(fechainicio, fechafin);
  return Math.round(pivote * cantDias, 0);
}