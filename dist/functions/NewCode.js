"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculate = calculate;

function calculate(item) {
  var lastCode = item.codigo;
  var nro = 0;
  var newNumber = '';
  nro = Number(lastCode.substring(lastCode.length - 5, lastCode.length));
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

  return newNumber;
}