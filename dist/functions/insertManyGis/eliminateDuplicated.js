"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = eliminateDuplicated;

function eliminateDuplicated(arr, prop) {
  var result = Array.from(new Set(arr.map(function (e) {
    return e.Rut;
  }))).map(function (Rut) {
    return arr.find(function (s) {
      return s.Rut === Rut;
    });
  });
  return result;
}