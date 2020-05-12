"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CalculateFechaVenc = CalculateFechaVenc;

function CalculateFechaVenc(fecha, meses) {
  var f = fecha;
  var fechaActual = new Date(f);
  fechaActual = fechaActual.setMonth(fechaActual.getMonth() + meses);
  return fechaActual;
}