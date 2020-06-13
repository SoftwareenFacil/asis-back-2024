"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getPersonasGI;

function getPersonasGI(data) {
  var personas = data.filter(function (gi) {
    return gi.TipoCliente === 'Persona Natural';
  });
  return personas;
}