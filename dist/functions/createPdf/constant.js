"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nameFirma = exports.conclusion = exports.motivacionCargo = exports.actPrevencionRiesgosTwo = exports.actPrevencionRiesgosOne = exports.estabilidadEmocional = exports.adecuacionNormas = exports.intelectual = exports.generalInformation = exports.titles = void 0;
var titles = ['Definición de escala', 'Bajo', 'Promedio', 'Alto'];
exports.titles = titles;
var generalInformation = ['Nombre', 'Edad', 'RUT', 'Educación Formal', 'Cargo', 'Maquinarias a Conducir', 'Ciudad de referencia', 'Fecha de Evaluación'];
exports.generalInformation = generalInformation;
var intelectual = [{
  name: 'Razonamiento Abstracto',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Percepción y concentración',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Compresión de Instrucciones',
  bajo: false,
  promedio: true,
  alto: false
}];
exports.intelectual = intelectual;
var adecuacionNormas = [{
  name: 'Acato a la autoridad',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Relación con grupos de pares',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Comportamiento social',
  bajo: false,
  promedio: false,
  alto: true
}];
exports.adecuacionNormas = adecuacionNormas;
var estabilidadEmocional = [{
  name: 'Locus de control / impulsividad',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Manejo de la frustración',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Empatía',
  bajo: true,
  promedio: false,
  alto: false
}, {
  name: 'Grado de ansiedad',
  bajo: true,
  promedio: false,
  alto: false
}];
exports.estabilidadEmocional = estabilidadEmocional;
var actPrevencionRiesgosOne = [{
  name: ['Actitud general hacia la', 'prevención de accidentes de', 'trabajo'],
  bajo: false,
  promedio: true,
  alto: false
}, {
  name: ['Confianza en acciones realizadas'],
  bajo: true,
  promedio: false,
  alto: false
}];
exports.actPrevencionRiesgosOne = actPrevencionRiesgosOne;
var actPrevencionRiesgosTwo = [{
  name: ['Capacidad para modificar el', 'ambiente a favor de la seguridad'],
  bajo: false,
  promedio: false,
  alto: true
}];
exports.actPrevencionRiesgosTwo = actPrevencionRiesgosTwo;
var motivacionCargo = [{
  name: 'Orientación a la tarea',
  bajo: false,
  promedio: false,
  alto: true
}, {
  name: 'Energia vital',
  bajo: false,
  promedio: true,
  alto: false
}];
exports.motivacionCargo = motivacionCargo;
var conclusion = [{
  name: ['No presenta conductas de', 'riegos'],
  verticalSpace: 0
}, {
  name: ['Presenta bajas conductas', 'de riesgos'],
  verticalSpace: 170
}, {
  name: ['Presenta altas conductas', 'de riesgos'],
  verticalSpace: 350
}];
exports.conclusion = conclusion;
var nameFirma = ['KARLA NUÑEZ COLLAO', 'Psicólogo', 'ASIS CONSULTORES'];
exports.nameFirma = nameFirma;