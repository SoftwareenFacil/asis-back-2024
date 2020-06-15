"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateOrdenCompra;

function verificateOrdenCompra(data) {
  var result = data.filter(function (e) {
    return e.OrdenCompra === 'Si' || e.OrdenCompra === 'No';
  });
  return result;
}