"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDate = getDate;

function getDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours(),
      minutes = d.getMinutes(),
      seconds = d.getSeconds();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day; // let fecha = `${f.toISOString().slice(0, 10)} ${f.toISOString().slice(11, f.toString().length)}`
  // let fecha = f.toLocaleDateString('cl-CL').toISO

  return "".concat([year, month, day].join('-'), " ").concat([hour, minutes].join(':'));
}