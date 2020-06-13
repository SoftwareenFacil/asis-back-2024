"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = eliminateDuplicated;

function eliminateDuplicated(arr, prop) {
  var nuevoArray = [];
  var lookup = {};

  for (var i in arr) {
    lookup[arr[i][prop]] = arr[i];
  }

  for (i in lookup) {
    nuevoArray.push(lookup[i]);
  }

  return nuevoArray;
}