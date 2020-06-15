"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = addCodeGI;

var _NewCode = require("../NewCode");

function addCodeGI(data, lastgi, year) {
  var code = {
    codigo: lastgi.codigo
  };
  var nextCode = "";
  var result = data.map(function (obj) {
    nextCode = "ASIS-GI-".concat(year, "-").concat((0, _NewCode.calculate)(code));
    obj.codigo = nextCode;
    code.codigo = nextCode;
    return obj;
  });
  return result;
}