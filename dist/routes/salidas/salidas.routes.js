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
            return db.collection("salidas").find({}).toArray();

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
}()); //INSERT SALIDA

router.post("/", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, datos, newSalida, items, result, objInsert;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            datos = req.body;
            newSalida = {};
            _context2.next = 7;
            return db.collection("salidas").find({}).toArray();

          case 7:
            items = _context2.sent;
            result = "";

            if (items.length > 0) {
              newSalida.codigo = "ASIS-GTS-SAL-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newSalida.codigo = "ASIS-GTS-SAL-".concat(YEAR, "-00001");
            }

            newSalida.fecha = datos.fecha;
            newSalida.tipo_salida = datos.tipo_salida;
            newSalida.nro_documento = datos.nro_documento;
            newSalida.usuario = datos.usuario;
            newSalida.categoria_general = datos.categoria_general;
            newSalida.subcategoria_uno = datos.subcategoria_uno;
            newSalida.subcategoria_dos = datos.subcategoria_dos;
            newSalida.subcategoria_tres = datos.subcategoria_tres;
            newSalida.codigo_categoria_tres = datos.codigo_categoria_tres;
            newSalida.descripcion = datos.descripcion;
            newSalida.motivo_salida = datos.motivo_salida;
            newSalida.cantidad = datos.cantidad;
            newSalida.costo_unitario = datos.costo_unitario;
            newSalida.costo_total = datos.costo_total;
            newSalida.precio_venta_unitario = datos.precio_venta_unitario;
            newSalida.ingreso_total = datos.ingreso_total;
            _context2.prev = 26;
            _context2.next = 29;
            return db.collection("salidas").insertOne(newSalida);

          case 29:
            result = _context2.sent;

            if (!result) {
              _context2.next = 46;
              break;
            }

            objInsert = {
              id: result.ops[0]._id.toString(),
              tipo: "salida",
              datos: [{
                categoria_general: newSalida.categoria_general,
                subcategoria_uno: newSalida.subcategoria_uno,
                subcategoria_dos: newSalida.subcategoria_dos,
                subcategoria_tres: newSalida.subcategoria_tres,
                codigo_categoria_tres: newSalida.codigo_categoria_tres,
                descripcion: newSalida.descripcion,
                motivo_salida: newSalida.motivo_salida,
                cantidad: newSalida.cantidad,
                costo_unitario: newSalida.costo_unitario,
                costo_total: newSalida.costo_total,
                precio_venta_unitario: newSalida.precio_venta_unitario,
                ingreso_total: newSalida.ingreso_total
              }]
            };
            _context2.next = 34;
            return db.collection("prexistencia").insertOne(objInsert);

          case 34:
            result = _context2.sent;
            _context2.next = 37;
            return db.collection("prexistencia").find({}).toArray();

          case 37:
            result = _context2.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context2.next = 42;
            return db.collection("existencia").deleteMany({});

          case 42:
            _context2.next = 44;
            return db.collection("existencia").insertMany(result);

          case 44:
            result = _context2.sent;
            res.json(result);

          case 46:
            _context2.next = 51;
            break;

          case 48:
            _context2.prev = 48;
            _context2.t0 = _context2["catch"](26);
            res.json(_context2.t0);

          case 51:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[26, 48]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;