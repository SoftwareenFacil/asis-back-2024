"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateGrupoInteres;

function verificateGrupoInteres(data) {
  var result = data.filter(function (e) {
    return e.GrupoInteres === 'Clientes' || e.GrupoInteres === 'Empleados' || e.GrupoInteres === 'Colaboradores';
  });
  return result;
}