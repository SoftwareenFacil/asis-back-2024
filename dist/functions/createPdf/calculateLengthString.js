"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calculatePhases;

function calculatePhases(cadena, maxLength) {
  var cantCharacters = cadena.length;
  var cantPhases = Math.round(cantCharacters / maxLength, 0);
  var finalCadena = [];
  var cont = 0;

  for (var i = 0; i < cantPhases; i++) {
    finalCadena.push(cadena.substr(cont, maxLength));
    cont += maxLength;
  }

  return finalCadena;
}