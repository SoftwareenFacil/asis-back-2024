"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCatEmpresa;

function verificateCatEmpresa(data) {
  var result = data.filter(function (e) {
    return e.CategoriaEmpresa === 'Microempresa';
  });
  return result;
}