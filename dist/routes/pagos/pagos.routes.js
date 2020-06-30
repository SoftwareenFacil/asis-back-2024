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

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

router.post("/nuevo/:id", _multer["default"].single('archivo'), /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, id, datos, archivo, obj, result, codigoPAG, codigoCOB;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            id = req.params.id;
            datos = JSON.parse(req.body.data);
            archivo = {};

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            obj = {};
            obj.fecha_pago = datos.fecha_pago;
            obj.hora_pago = datos.hora_pago;
            obj.sucursal = datos.sucursal;
            obj.tipo_pago = datos.tipo_pago;
            obj.monto = datos.monto;
            obj.descuento = datos.descuento;
            obj.total = datos.total;
            obj.observaciones = datos.observaciones;
            obj.institucion_bancaria = datos.institucion_bancaria;
            obj.archivo_adjunto = archivo;
            _context2.next = 20;
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

          case 20:
            result = _context2.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace("PAG", "COB"); //--

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context2.next = 29;
              break;
            }

            _context2.next = 26;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 26:
            result = _context2.sent;
            _context2.next = 33;
            break;

          case 29:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context2.next = 33;
              break;
            }

            _context2.next = 32;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 32:
            result = _context2.sent;

          case 33:
            _context2.next = 35;
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

          case 35:
            result = _context2.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context2.next = 40;
              break;
            }

            _context2.next = 39;
            return db.collection("cobranza").updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 39:
            result = _context2.sent;

          case 40:
            res.json(result);

          case 41:
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

router.post("/many", _multer["default"].single('archivo'), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, datos, archivo, new_array, result, codesCobranza;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            datos = JSON.parse(req.body.data);
            archivo = {};
            new_array = [];
            datos[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context3.prev = 8;
            _context3.next = 11;
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
                    fecha_pago: datos[0].fecha_pago,
                    hora_pago: datos[0].hora_pago,
                    sucursal: datos[0].sucursal,
                    tipo_pago: datos[0].tipo_pago,
                    monto: c.valor_servicio - c.valor_cancelado,
                    descuento: datos[0].descuento,
                    total: c.valor_servicio - c.valor_cancelado,
                    observaciones: datos[0].observaciones,
                    institucion_bancaria: datos[0].institucion_bancaria,
                    archivo_adjunto: archivo
                  }
                },
                $set: {
                  valor_cancelado: c.valor_servicio,
                  estado: "Pagado"
                }
              });
            });

          case 11:
            result = _context3.sent;
            //pasar los codigos de pago a cobranza
            codesCobranza = datos[2].codes;
            codesCobranza = codesCobranza.map(function (e) {
              return e = e.replace("PAG", "COB");
            });
            _context3.next = 16;
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

          case 16:
            result = _context3.sent;
            res.json({
              message: "Pagos realizados satisfactoriamente",
              isOK: true
            });
            _context3.next = 23;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](8);
            res.json({
              message: "ha ocurrido un error",
              err: _context3.t0,
              isOK: false
            });

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[8, 20]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;