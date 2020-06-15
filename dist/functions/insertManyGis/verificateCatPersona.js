"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCatPersona;

function verificateCatPersona(data) {
  var result = data.filter(function (e) {
    return e.CategoriaEmpresa === 'No Aplica';
  });
  return result;
}