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
router.get("/", /*#__PURE__*/function () {
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
            return db.collection("pagos").find({}).toArray();

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

router.post("/nuevo/:id", /*#__PURE__*/function () {
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
            obj.sucursal = req.body.sucursal;
            obj.tipo_pago = req.body.tipo_pago;
            obj.monto = req.body.monto;
            obj.descuento = req.body.descuento;
            obj.total = req.body.total;
            obj.observaciones = req.body.observaciones;
            obj.institucion_bancaria = req.body.institucion_bancaria;
            obj.archivo_adjunto = req.body.archivo_adjunto;
            _context2.next = 17;
            return db.collection("pagos").findOneAndUpdate({
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

          case 17:
            result = _context2.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace("PAG", "COB"); //--

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context2.next = 26;
              break;
            }

            _context2.next = 23;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 23:
            result = _context2.sent;
            _context2.next = 30;
            break;

          case 26:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context2.next = 30;
              break;
            }

            _context2.next = 29;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 29:
            result = _context2.sent;

          case 30:
            _context2.next = 32;
            return db.collection("cobranza").findOneAndUpdate({
              codigo: codigoCOB
            }, {
              $inc: {
                valor_deuda: -obj.total,
                valor_cancelado: obj.total
              }
            }, {
              returnOriginal: false
            });

          case 32:
            result = _context2.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context2.next = 37;
              break;
            }

            _context2.next = 36;
            return db.collection("cobranza").updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 36:
            result = _context2.sent;

          case 37:
            res.json(result);

          case 38:
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

router.post("/many", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, new_array, result, codesCobranza;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            new_array = [];
            req.body[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _context3.prev = 5;
            _context3.next = 8;
            return db.collection("pagos").find({
              _id: {
                $in: new_array
              }
            }).forEach(function (c) {
              db.collection("pagos").updateOne({
                _id: c._id
              }, {
                $push: {
                  pagos: {
                    fecha_pago: req.body[0].fecha_pago,
                    hora_pago: req.body[0].hora_pago,
                    sucursal: req.body[0].sucursal,
                    tipo_pago: req.body[0].tipo_pago,
                    monto: c.valor_servicio - c.valor_cancelado,
                    descuento: req.body[0].descuento,
                    total: c.valor_servicio - c.valor_cancelado,
                    observaciones: req.body[0].observaciones,
                    institucion_bancaria: req.body[0].institucion_bancaria
                  }
                },
                $set: {
                  valor_cancelado: c.valor_servicio,
                  estado: "Pagado"
                }
              });
            });

          case 8:
            result = _context3.sent;
            //pasar los codigos de pago a cobranza
            codesCobranza = req.body[2].codes;
            codesCobranza = codesCobranza.map(function (e) {
              return e = e.replace("PAG", "COB");
            });
            _context3.next = 13;
            return db.collection("cobranza").find({
              codigo: {
                $in: codesCobranza
              }
            }).forEach(function (c) {
              db.collection("cobranza").updateOne({
                codigo: c.codigo
              }, {
                $set: {
                  valor_cancelado: c.valor_servicio,
                  valor_deuda: 0,
                  estado: "Al Dia"
                }
              });
            });

          case 13:
            result = _context3.sent;
            res.json({
              message: "Pagos realizados satisfactoriamente",
              isOK: true
            });
            _context3.next = 20;
            break;

          case 17:
            _context3.prev = 17;
            _context3.t0 = _context3["catch"](5);
            res.json({
              message: "ha ocurrido un error",
              err: _context3.t0,
              isOK: false
            });

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[5, 17]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;