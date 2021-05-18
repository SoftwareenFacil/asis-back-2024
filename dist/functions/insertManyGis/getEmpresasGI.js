"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getEmpresasGI;

function getEmpresasGI(data) {
  var result = [{
    newdata: []
  }, {
    renegados: []
  }];
  result[0].newdata = data.filter(function (e) {
    if (e.categoria === 'Empresa/Organizacion') {
      return true;
    } else {
      result[1].renegados.push(e);
      return false;
    }
  });
  return result;
}