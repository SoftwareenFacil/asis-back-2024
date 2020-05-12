"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _getFechaVenc = require("../../functions/getFechaVenc");

var _database = require("../../database");

var _mongodb = require("mongodb");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)(); //database connection

//SELECT
router.get('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context.sent;
            _context.next = 5;
            return db.collection('evaluaciones').find({}).toArray();

          case 5:
            result = _context.sent;
            res.json(result);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); //PASAR A EN EVALUACION

router.post('/evaluar/:id', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            id = req.params.id;
            _context2.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context2.sent;
            _context2.next = 6;
            return db.collection('evaluaciones').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "En Evaluacion",
                estado_archivo: "Cargado",
                observaciones: req.body.observaciones,
                archivo_examen: req.body.archivo_examen,
                fecha_carga_examen: req.body.fecha_carga_examen,
                hora_carga_examen: req.body.hora_carga_examen
              }
            });

          case 6:
            result = _context2.sent;
            res.json(result);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //PASAR A EVALUADO

router.post('/evaluado/:id', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, db, estadoEvaluacion, result, codAsis, fechaVenci, resultinsert;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            _context3.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context3.sent;
            estadoEvaluacion = '';

            if (req.body.estado_archivo == "Aprobado" || req.body.estado_archivo == "Aprobado con Obs") {
              estadoEvaluacion = 'Evaluado';
            } else {
              estadoEvaluacion = 'Ingresado';
            } // console.log(result)


            _context3.next = 8;
            return db.collection('evaluaciones').findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estadoEvaluacion,
                estado_archivo: req.body.estado_archivo,
                observaciones: req.body.observaciones
              }
            }, {
              sort: {
                codigo: 1
              },
              returnNewDocument: true
            });

          case 8:
            result = _context3.sent;

            if (!(result.ok == 1 && (req.body.estado_archivo == "Aprobado" || req.body.estado_archivo == "Aprobado con Obs"))) {
              _context3.next = 18;
              break;
            }

            codAsis = result.value.codigo;
            codAsis = codAsis.replace('EVA', 'RES');
            fechaVenci = (0, _getFechaVenc.CalculateFechaVenc)(req.body.fecha_resultado_examen, req.body.vigencia_examen.replace(/\D/g, '')); // console.log('result', result.value)

            _context3.next = 15;
            return db.collection('resultados').insertOne({
              codigo: codAsis,
              nombre_servicio: result.value.nombre_servicio,
              id_GI_personalAsignado: result.value.id_GI_personalAsignado,
              rut_cp: result.value.rut_cp,
              razon_social_cp: result.value.razon_social_cp,
              rut_cs: result.value.rut_cs,
              razon_social_cs: result.value.razon_social_cs,
              lugar_servicio: result.value.lugar_servicio,
              sucursal: result.value.sucursal,
              condicionantes: req.body.condicionantes,
              vigencia_examen: req.body.vigencia_examen,
              observaciones: req.body.observaciones,
              archivo_respuesta_examen: req.body.archivo_resultado,
              fecha_resultado: req.body.fecha_resultado_examen,
              hora_resultado: req.body.hora_resultado_examen,
              estado: req.body.estado_archivo
            });

          case 15:
            resultinsert = _context3.sent;
            console.log('result resultado', resultinsert);
            result = resultinsert;

          case 18:
            console.log('result', result);
            res.json(result);

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;