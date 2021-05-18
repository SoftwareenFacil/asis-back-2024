"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCatCliente;

function verificateCatCliente(data) {
  var result = data.filter(function (e) {
    return e.categoria_cliente === 'Frecuente' || e.categoria_cliente === 'Habitual' || e.categoria_cliente === 'Ocasional';
  });
  return result;
}