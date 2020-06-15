"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCredito;

function verificateCredito(data) {
  var result = data.filter(function (e) {
    return e.Credito === 'Si' || e.Credito === 'No';
  });
  return result;
}