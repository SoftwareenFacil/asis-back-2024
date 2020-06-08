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
            _context2.next = 13;
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

          case 13:
            result = _context2.sent;
            //-- sacamos el codigo de apgos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace('PAG', 'COB'); //--

            console.log('valores', result.value);

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context2.next = 23;
              break;
            }

            _context2.next = 20;
            return db.collection('pagos').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 20:
            result = _context2.sent;
            _context2.next = 27;
            break;

          case 23:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context2.next = 27;
              break;
            }

            _context2.next = 26;
            return db.collection('pagos').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 26:
            result = _context2.sent;

          case 27:
            _context2.next = 29;
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

          case 29:
            result = _context2.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context2.next = 34;
              break;
            }

            _context2.next = 33;
            return db.collection('cobranza').updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 33:
            result = _context2.sent;

          case 34:
            res.json(result);

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;