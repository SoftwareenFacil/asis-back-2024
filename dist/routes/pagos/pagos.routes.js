"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _fechaVencExamen = require("../../functions/fechaVencExamen");

var _getDateNow = require("../../functions/getDateNow");

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
            return db.collection('pagos').find({}).toArray();

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
}()); //INGRESAR PAGO

router.post('/nuevo/:id', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, id, obj, result, codigoPAG, codigoCOB;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            id = req.params.id;
            obj = {};
            obj.fecha_pago = req.body.fecha_pago;
            obj.hora_pago = req.body.hora_pago;
            obj.sucursal = req.body.sucursal, obj.tipo_pago = req.body.tipo_pago, obj.monto = req.body.monto, obj.descuento = req.body.descuento;
            obj.total = req.body.total;
            obj.observaciones = req.body.observaciones;
            obj.institucion_bancaria = req.body.institucion_bancaria;
            obj.archivo_adjunto = req.body.archivo_adjunto;
            _context2.next = 14;
            return db.collection('pagos').findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $inc: {
                valor_cancelado: obj.total
              },
              $push: {
                pagos: obj
              }
            }, {
              returnOriginal: false
            });

          case 14:
            result = _context2.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace('PAG', 'COB'); //--

            console.log('valores', result.value);

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context2.next = 24;
              break;
            }

            _context2.next = 21;
            return db.collection('pagos').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 21:
            result = _context2.sent;
            _context2.next = 28;
            break;

          case 24:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context2.next = 28;
              break;
            }

            _context2.next = 27;
            return db.collection('pagos').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 27:
            result = _context2.sent;

          case 28:
            _context2.next = 30;
            return db.collection('cobranza').findOneAndUpdate({
              codigo: codigoCOB
            }, {
              $inc: {
                valor_deuda: -obj.total,
                valor_cancelado: obj.total
              }
            }, {
              returnOriginal: false
            });

          case 30:
            result = _context2.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context2.next = 35;
              break;
            }

            _context2.next = 34;
            return db.collection('cobranza').updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 34:
            result = _context2.sent;

          case 35:
            res.json(result);

          case 36:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //INGRESO MASIVO DE PAGOS

router.post('/nuevo/many/:id', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, id, pagos, obj, array, valorAcumulado, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            id = req.params.id;
            pagos = req.body;
            obj = {};
            array = [];
            valorAcumulado = 0;
            pagos.forEach(function (element) {
              obj.fecha_pago = element.fecha_pago;
              obj.hora_pago = element.hora_pago;
              obj.sucursal = element.sucursal, obj.tipo_pago = element.tipo_pago, obj.monto = element.monto, obj.descuento = element.descuento;
              obj.total = element.total;
              obj.observaciones = element.observaciones;
              obj.institucion_bancaria = element.institucion_bancaria;
              valorAcumulado = valorAcumulado + element.total;
              array.push(obj);
              obj = {};
            });
            _context3.next = 11;
            return db.collection('pagos').findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $inc: {
                valor_cancelado: obj.total
              },
              $set: {
                pagos: array
              }
            }, {
              returnOriginal: false
            });

          case 11:
            result = _context3.sent;
            res.json(result);

          case 13:
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