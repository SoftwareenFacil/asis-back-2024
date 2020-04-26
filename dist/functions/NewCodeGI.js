"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculate = calculate;

function calculate(item) {
  var lastCode = item.codigo;
  var nro = 0;
  var newNumber = '';
  var newCode = '';
  nro = Number(lastCode.substring(8, lastCode.length));
  nro = nro + 1;

  if (nro >= 1 && nro <= 9) {
    newNumber = "0000".concat(nro);
  } else if (nro > 9 && nro <= 99) {
    newNumber = "000".concat(nro);
  } else if (nro > 99 && nro <= 999) {
    newNumber = "00".concat(nro);
  } else if (nro > 999 && nro <= 9999) {
    newNumber = "0".concat(nro);
  } else {
    newNumber = nro;
  }

  newCode = "ASIS-GI-".concat(newNumber);
  return newCode;
}