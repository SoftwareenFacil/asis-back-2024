"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = calculateExistencia;

function calculateExistencia(result) {
  var resultado = result;
  var tipo = '';
  var array = [];
  var obj = {};
  resultado.forEach(function (objGeneral) {
    tipo = objGeneral.tipo;
    objGeneral.datos.forEach(function (objParticular) {
      if (array.length === 0) {
        obj.categoria_general = objParticular.categoria_general, obj.subcategoria_uno = objParticular.subcategoria_uno, obj.subcategoria_dos = objParticular.subcategoria_dos, obj.subcategoria_tres = objParticular.subcategoria_tres, obj.codigo_categoria_tres = objParticular.codigo_categoria_tres, obj.entradas = 0, obj.salidas = 0, tipo === 'entrada' ? obj.entradas = objParticular.cantidad : obj.salidas = objParticular.cantidad;
        obj.existencia = 0, obj.cantMaxima = objParticular.cant_maxima_categoria_tres;
        obj.costo_total = objParticular.costo_total, obj.costo_unitario_promedio = 0, obj.estado = '';
        array.push(obj);
      } else {
        if (array.some(function (code) {
          return code.codigo_categoria_tres === objParticular.codigo_categoria_tres;
        })) {
          array.forEach(function (element, index) {
            if (element.codigo_categoria_tres === objParticular.codigo_categoria_tres) {
              if (tipo === 'entrada') {
                array[index].entradas = array[index].entradas + objParticular.cantidad;
                array[index].costo_total = array[index].costo_total + objParticular.costo_total;
              } else {
                array[index].salidas = array[index].salidas + objParticular.cantidad;
              }
            }
          });
        } else {
          obj.categoria_general = objParticular.categoria_general, obj.subcategoria_uno = objParticular.subcategoria_uno, obj.subcategoria_dos = objParticular.subcategoria_dos, obj.subcategoria_tres = objParticular.subcategoria_tres, obj.codigo_categoria_tres = objParticular.codigo_categoria_tres, obj.entradas = 0, obj.salidas = 0, tipo === 'entrada' ? obj.entradas = objParticular.cantidad : obj.salidas = objParticular.cantidad;
          obj.existencia = 0, obj.cantMaxima = objParticular.cant_maxima_categoria_tres;
          obj.costo_total = objParticular.costo_total, obj.costo_unitario_promedio = 0, obj.estado = '';
          array.push(obj);
        }
      }

      obj = {};
    });
  });
  return array;
}