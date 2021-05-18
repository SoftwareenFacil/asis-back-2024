"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = eliminateDuplicated;

function eliminateDuplicated(arr, prop) {
  var result = Array.from(new Set(arr.map(function (e) {
    return e.rut;
  }))).map(function (rut) {
    return arr.find(function (s) {
      return s.rut === rut;
    });
  });
  return result;
}