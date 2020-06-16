"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = verificateTipoCliente;

function verificateTipoCliente(data) {
  var result = [{
    newdata: []
  }, {
    renegados: []
  }];
  result[0].newdata = data.filter(function (e) {
    if (e.TipoCliente === 'Persona Natural' || e.TipoCliente === 'Empresa/Organizacion') {
      return true;
    } else {
      result[1].renegados.push(e);
      return false;
    }
  });
  return result;
}