"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = eliminateDuplicated;

function eliminateDuplicated(arr, prop) {
  // let nuevoArray = [];
  // let lookup  = {};
  // for (let i in arr) {
  //     lookup[arr[i][prop]] = arr[i];
  // }
  // for (i in lookup) {
  //     nuevoArray.push(lookup[i]);
  // }
  var result = Array.from(new Set(arr.map(function (e) {
    return e.Rut;
  }))).map(function (Rut) {
    return arr.find(function (s) {
      return s.Rut === Rut;
    });
  });
  return result;
}