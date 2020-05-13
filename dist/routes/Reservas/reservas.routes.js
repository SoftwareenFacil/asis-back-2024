"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _changeToMiniscula = require("../../functions/changeToMiniscula");

var _getDateNow = require("../../functions/getDateNow");

var _database = require("../../database");

var _mongodb = require("mongodb");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

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
            return db.collection('reservas').find({}).toArray();

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
}()); //SELECT ONE 

router.get('/:id', /*#__PURE__*/function () {
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
            return db.collection('reservas').findOne({
              _id: (0, _mongodb.ObjectID)(id)
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
}()); //CONFIRMAR RESERVA

router.post('/confirmar/:id', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, datos, db, obs, result, resulEva, reserva, codAsis;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            datos = req.body;
            _context3.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context3.sent;
            obs = {};
            obs.obs = datos.observacion;
            obs.fecha = (0, _getDateNow.getDate)();
            result = null;
            resulEva = null;
            _context3.prev = 10;
            _context3.next = 13;
            return db.collection('reservas').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_reserva: datos.fecha_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva: datos.hora_reserva,
                hora_reserva_fin: datos.hora_reserva_fin,
                id_GI_personalAsignado: datos.id_GI_personalAsignado,
                sucursal: datos.sucursal,
                estado: "Reservado",
                reqEvaluacion: (0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion)
              },
              $push: {
                observacion: obs
              }
            });

          case 13:
            result = _context3.sent;

            if (!((0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion) == 'si' && result.result.ok == 1)) {
              _context3.next = 23;
              break;
            }

            _context3.next = 17;
            return db.collection('reservas').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 17:
            reserva = _context3.sent;
            codAsis = reserva.codigo;
            codAsis = codAsis.replace('AGE', 'EVA');
            _context3.next = 22;
            return db.collection('evaluaciones').insertOne({
              id_GI_personalAsignado: reserva.id_GI_personalAsignado,
              codigo: codAsis,
              fecha_evaluacion: reserva.fecha_reserva,
              fecha_evaluacion_fin: reserva.fecha_reserva_fin,
              hora_inicio_evaluacion: reserva.hora_reserva,
              hora_termino_evaluacion: reserva.hora_reserva_fin,
              mes: reserva.mes,
              anio: reserva.anio,
              nombre_servicio: reserva.nombre_servicio,
              rut_cp: reserva.rut_cp,
              razon_social_cp: reserva.razon_social_cp,
              rut_cs: reserva.rut_cs,
              razon_social_cs: reserva.razon_social_cs,
              lugar_servicio: reserva.lugar_servicio,
              sucursal: reserva.sucursal,
              observaciones: [],
              estado_archivo: "Sin Documento",
              estado: "Ingresado"
            });

          case 22:
            resulEva = _context3.sent;

          case 23:
            res.json({
              status: 200,
              message: "Reserva Confirmada"
            });
            _context3.next = 30;
            break;

          case 26:
            _context3.prev = 26;
            _context3.t0 = _context3["catch"](10);
            console.log('error', _context3.t0);
            res.json({
              status: 500,
              message: "No se pudo concretar la confirmacion de la reserva",
              error: _context3.t0
            });

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[10, 26]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;