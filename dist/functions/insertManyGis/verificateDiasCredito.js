"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = validateDiasCredito;

function validateDiasCredito(data) {
  var result = data.map(function (obj) {
    if (isNaN(obj.DiasCredito)) {
      obj.DiasCredito = 0;
      return obj;
    } else {
      return obj;
    }
  });
  return result;
}