"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateCatPersona;

function verificateCatPersona(data) {
  var result = data.filter(function (e) {
    return e.categoria_empresa === 'No Aplica';
  });
  return result;
}