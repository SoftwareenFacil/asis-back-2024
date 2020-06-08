"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _calculateExistencia = _interopRequireDefault(require("../../functions/calculateExistencia"));

var _getFinalToExistencia = _interopRequireDefault(require("../../functions/getFinalToExistencia"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

// SELECT
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
            return db.collection("gastos").find({}).toArray();

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
}()); //INSERT GASTO

router.post("/", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, newGasto, items, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            newGasto = {};
            _context2.next = 6;
            return db.collection("gastos").find({}).toArray();

          case 6:
            items = _context2.sent;

            if (items.length > 0) {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-00001");
            }

            newGasto.fecha = req.body.fecha;
            newGasto.fecha_registro = req.body.fecha_registro;
            newGasto.categoria_general = req.body.categoria_general;
            newGasto.subcategoria_uno = req.body.subcategoria_uno;
            newGasto.subcategoria_dos = req.body.subcategoria_dos;
            newGasto.descripcion_gasto = req.body.descripcion_gasto;
            newGasto.rut_proveedor = req.body.rut_proveedor;
            newGasto.razon_social_proveedor = req.body.razon_social_proveedor;
            newGasto.requiere_servicio = req.body.requiere_servicio;
            newGasto.id_servicio = req.body.id_servicio;
            newGasto.servicio = req.body.servicio;
            newGasto.tipo_registro = req.body.tipo_registro;
            newGasto.tipo_documento = req.body.tipo_documento;
            newGasto.nro_documento = req.body.nro_documento;
            newGasto.medio_pago = req.body.medio_pago;
            newGasto.institucion_bancaria = req.body.institucion_bancaria;
            newGasto.inventario = req.body.inventario;
            newGasto.cantidad_factor = req.body.cantidad_factor;
            newGasto.precio_unitario = req.body.precio_unitario;
            newGasto.monto_neto = req.body.monto_neto;
            newGasto.impuesto = req.body.impuesto;
            newGasto.monto_exento = req.body.monto_exento;
            newGasto.monto_total = req.body.monto_total;
            newGasto.observaciones = req.body.observaciones;
            newGasto.archivo_adjunto = req.body.archivo_adjunto;
            newGasto.entradas = [];
            _context2.next = 36;
            return db.collection("gastos").insertOne(newGasto);

          case 36:
            result = _context2.sent;
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
}()); //INSERT ENTRADA AND EDIT PREXISTENCIA

router.post("/entrada/:id", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, db, result, resultExistencia, objInsert;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            _context3.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context3.sent;
            result = '';
            resultExistencia = '';
            _context3.prev = 6;
            _context3.next = 9;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                entradas: req.body.entradas
              }
            });

          case 9:
            result = _context3.sent;
            _context3.next = 12;
            return db.collection("prexistencia").find({
              id: id
            }).toArray();

          case 12:
            result = _context3.sent;

            if (!(result.length > 0)) {
              _context3.next = 25;
              break;
            }

            if (!(req.body.entradas.length > 0)) {
              _context3.next = 20;
              break;
            }

            _context3.next = 17;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: req.body.entradas
              }
            });

          case 17:
            result = _context3.sent;
            _context3.next = 23;
            break;

          case 20:
            _context3.next = 22;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 22:
            result = _context3.sent;

          case 23:
            _context3.next = 30;
            break;

          case 25:
            if (!(req.body.entradas.length > 0)) {
              _context3.next = 30;
              break;
            }

            objInsert = {
              id: id,
              tipo: "entrada",
              datos: req.body.entradas
            };
            _context3.next = 29;
            return db.collection("prexistencia").insertOne(objInsert);

          case 29:
            result = _context3.sent;

          case 30:
            _context3.next = 32;
            return db.collection("prexistencia").find({}).toArray();

          case 32:
            result = _context3.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context3.next = 37;
            return db.collection('existencia').deleteMany({});

          case 37:
            _context3.next = 39;
            return db.collection('existencia').insertMany(result);

          case 39:
            result = _context3.sent;
            res.json(result);
            _context3.next = 46;
            break;

          case 43:
            _context3.prev = 43;
            _context3.t0 = _context3["catch"](6);
            res.json(_context3.t0);

          case 46:
            ;

          case 47:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[6, 43]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;