"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getFinalExistencia;

function getFinalExistencia(result) {
  result.forEach(function (objeto) {
    if (objeto.entradas > 0) {
      objeto.costo_unitario_promedio = Math.round(objeto.costo_total / objeto.entradas, 0);
    } else {
      objeto.costo_unitario_promedio = objeto.costo_total;
    }

    if (objeto.entradas >= objeto.salidas) {
      objeto.existencia = objeto.entradas - objeto.salidas;
    } else {
      objeto.existencia = 0;
    }

    if (objeto.existencia === 0) {
      objeto.estado = 'Sin Stock';
    } else if (objeto.existencia === 1) {
      objeto.estado = 'Adquirir Stock';
    } else {
      objeto.estado = 'Stock al Día';
    }
  });
  return result;
}