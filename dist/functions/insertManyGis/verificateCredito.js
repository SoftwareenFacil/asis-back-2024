"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCredito;

function verificateCredito(data) {
  var result = data.filter(function (e) {
    return e.credito === 'Si' || e.credito === 'No';
  });
  return result;
}