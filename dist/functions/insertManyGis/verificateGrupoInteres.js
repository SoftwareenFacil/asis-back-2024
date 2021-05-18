"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateGrupoInteres;

function verificateGrupoInteres(data) {
  var result = data.filter(function (e) {
    return e.grupo_interes === 'Clientes' || e.grupo_interes === 'Empleados' || e.grupo_interes === 'Colaboradores';
  });
  return result;
}