"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFechaVencExam = getFechaVencExam;

function getFechaVencExam(fecha, vigencia) {
  var d = new Date(fecha);
  var v = parseInt(vigencia.replace(/\D/g, ""));
  var nuevomes = d.getMonth() + v;
  d.setMonth(nuevomes);
  d.setDate(d.getDate() + 1);
  return d;
}