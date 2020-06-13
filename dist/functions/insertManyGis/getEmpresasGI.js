"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getEmpresasGI;

function getEmpresasGI(data) {
  var empresas = data.filter(function (gi) {
    return gi.TipoCliente === 'Empresa/Organizacion';
  });
  return empresas;
}