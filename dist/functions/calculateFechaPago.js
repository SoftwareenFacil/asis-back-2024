"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFechaPago = getFechaPago;

function getFechaPago(fecha, dias) {
  var date = new Date(fecha);
  var nuevodia = date.getDate() + dias;
  date.setDate(nuevodia);
  date.setDate(date.getDate() + 1);
  var d = date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours(),
      minutes = d.getMinutes();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hour.length < 2) hour = '0' + hour;
  if (minutes.length < 2) minutes = '0' + minutes;
  return "".concat([year, month, day].join('-'));
}