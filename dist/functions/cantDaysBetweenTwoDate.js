"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calculateCantDiasBetweenTwoDates;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _moment["default"])().format();

function calculateCantDiasBetweenTwoDates(fechainicio, fechafin) {
  var FechaStart = (0, _moment["default"])(fechainicio);
  var FechaEnd = (0, _moment["default"])(fechafin);
  return FechaEnd.diff(FechaStart, 'days');
  ;
}

;