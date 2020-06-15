"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCatCliente;

function verificateCatCliente(data) {
  var result = data.filter(function (e) {
    return e.CategoriaCliente === 'Frecuente' || e.CategoriaCliente === 'Habitual' || e.CategoriaCliente === 'Ocasional';
  });
  return result;
}