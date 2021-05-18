"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = validateDiasCredito;

function validateDiasCredito(data) {
  var result = data.map(function (obj) {
    if (isNaN(obj.dias_credito)) {
      obj.dias_credito = 0;
      return obj;
    } else {
      return obj;
    }
  });
  return result;
}