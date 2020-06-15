"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = validateFormatDate;

function validateFormatDate(fecha) {
  var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

  if (fecha.match(RegExPattern) && fecha != '') {
    return true;
  } else {
    return false;
  }
}