"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDate = getDate;

function getDate(fecha) {
  var d = fecha,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours(),
      minutes = d.getMinutes();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hour.length < 2) hour = '0' + hour;
  if (minutes < 10) minutes = '0' + minutes; // let fecha = `${f.toISOString().slice(0, 10)} ${f.toISOString().slice(11, f.toString().length)}`
  // let fecha = f.toLocaleDateString('cl-CL').toISO

  return "".concat([day, month, year].join('-'), " ").concat([hour, minutes].join(':'));
}