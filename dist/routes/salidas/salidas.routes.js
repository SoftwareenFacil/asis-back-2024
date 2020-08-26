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

var _multer = _interopRequireDefault(require("../../libs/multer"));

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
}()); //SELECT ONE

router.get("/:id", /*#__PURE__*/function () {
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
            return db.collection("salidas").findOne({
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
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countSalidas, result;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context3.prev = 5;
            _context3.next = 8;
            return db.collection("salidas").find().count();

          case 8:
            countSalidas = _context3.sent;
            _context3.next = 11;
            return db.collection("salidas").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context3.sent;
            res.json({
              total_items: countSalidas,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSalidas / nPerPage + 1),
              salidas: result
            });
            _context3.next = 18;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            res.status(501).json(_context3.t0);

          case 18:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[5, 15]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //BUSCAR POR CATEGORIA GENERAL Y SUBCATEGORIA 1

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rexExpresionFiltro, result, countSalidas;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context4.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context4.sent;
            rexExpresionFiltro = new RegExp(filtro, "i");
            _context4.prev = 6;

            if (!(identificador === 1)) {
              _context4.next = 16;
              break;
            }

            _context4.next = 10;
            return db.collection("salidas").find({
              categoria_general: rexExpresionFiltro
            }).count();

          case 10:
            countSalidas = _context4.sent;
            _context4.next = 13;
            return db.collection("salidas").find({
              categoria_general: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 13:
            result = _context4.sent;
            _context4.next = 22;
            break;

          case 16:
            _context4.next = 18;
            return db.collection("salidas").find({
              subcategoria_uno: rexExpresionFiltro
            }).count();

          case 18:
            countSalidas = _context4.sent;
            _context4.next = 21;
            return db.collection("salidas").find({
              subcategoria_uno: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 21:
            result = _context4.sent;

          case 22:
            res.json({
              total_items: countSalidas,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSalidas / nPerPage + 1),
              salidas: result
            });
            _context4.next = 28;
            break;

          case 25:
            _context4.prev = 25;
            _context4.t0 = _context4["catch"](6);
            res.status(501).json({
              mgs: "ha ocurrido un error ".concat(_context4.t0)
            });

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[6, 25]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //INSERT SALIDA

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, datos, newSalida, items, result, objInsert;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            datos = JSON.parse(req.body.data);
            newSalida = {};
            _context5.next = 7;
            return db.collection("salidas").find({}).toArray();

          case 7:
            items = _context5.sent;
            result = "";

            if (items.length > 0) {
              newSalida.codigo = "ASIS-GTS-SAL-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newSalida.codigo = "ASIS-GTS-SAL-".concat(YEAR, "-00001");
            }

            if (req.file) {
              newSalida.archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            } else {
              newSalida.archivo = {};
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
            _context5.prev = 27;
            _context5.next = 30;
            return db.collection("salidas").insertOne(newSalida);

          case 30:
            result = _context5.sent;

            if (!result) {
              _context5.next = 47;
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
            _context5.next = 35;
            return db.collection("prexistencia").insertOne(objInsert);

          case 35:
            result = _context5.sent;
            _context5.next = 38;
            return db.collection("prexistencia").find({}).toArray();

          case 38:
            result = _context5.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context5.next = 43;
            return db.collection("existencia").deleteMany({});

          case 43:
            _context5.next = 45;
            return db.collection("existencia").insertMany(result);

          case 45:
            result = _context5.sent;
            res.json(result);

          case 47:
            _context5.next = 52;
            break;

          case 49:
            _context5.prev = 49;
            _context5.t0 = _context5["catch"](27);
            res.json(_context5.t0);

          case 52:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[27, 49]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //EDIT

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, datos, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            datos = JSON.parse(req.body.data);

            if (req.file) {
              datos.archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context6.prev = 6;
            _context6.next = 9;
            return db.collection("salidas").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha: datos.fecha,
                tipo_salida: datos.tipo_salida,
                nro_documento: datos.nro_documento,
                usuario: datos.usuario,
                categoria_general: datos.categoria_general,
                subcategoria_uno: datos.subcategoria_uno,
                subcategoria_dos: datos.subcategoria_dos,
                subcategoria_tres: datos.subcategoria_tres,
                codigo_categoria_tres: datos.codigo_categoria_tres,
                descripcion: datos.descripcion,
                motivo_salida: datos.motivo_salida,
                cantidad: datos.cantidad,
                costo_unitario: datos.costo_unitario,
                costo_total: datos.costo_total,
                precio_venta_unitario: datos.precio_venta_unitario,
                ingreso_total: datos.ingreso_total,
                archivo_adjunto: datos.archivo
              }
            }, {
              returnOriginal: false
            });

          case 9:
            result = _context6.sent;
            _context6.next = 12;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: [{
                  fecha: result.value.fecha,
                  tipo_salida: result.value.tipo_salida,
                  nro_documento: result.value.nro_documento,
                  usuario: result.value.usuario,
                  categoria_general: result.value.categoria_general,
                  subcategoria_uno: result.value.subcategoria_uno,
                  subcategoria_dos: result.value.subcategoria_dos,
                  subcategoria_tres: result.value.subcategoria_tres,
                  codigo_categoria_tres: result.value.codigo_categoria_tres,
                  descripcion: result.value.descripcion,
                  motivo_salida: result.value.motivo_salida,
                  cantidad: result.value.cantidad,
                  costo_unitario: result.value.costo_unitario,
                  costo_total: result.value.costo_total,
                  precio_venta_unitario: result.value.precio_venta_unitario,
                  ingreso_total: result.value.ingreso_total
                }]
              }
            });

          case 12:
            result = _context6.sent;
            _context6.next = 15;
            return db.collection("prexistencia").find({}).toArray();

          case 15:
            result = _context6.sent;
            console.log("resultado", result);
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context6.next = 21;
            return db.collection("existencia").deleteMany({});

          case 21:
            _context6.next = 23;
            return db.collection("existencia").insertMany(result);

          case 23:
            result = _context6.sent;
            res.status(201).json(result);
            _context6.next = 30;
            break;

          case 27:
            _context6.prev = 27;
            _context6.t0 = _context6["catch"](6);
            res.status(400).json({
              msg: "ha ocurrido un error ",
              error: _context6.t0
            });

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[6, 27]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //DELETE

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            _context7.prev = 4;
            _context7.next = 7;
            return db.collection("salidas").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            result = _context7.sent;
            _context7.next = 10;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 10:
            result = _context7.sent;
            _context7.next = 13;
            return db.collection("prexistencia").find({}).toArray();

          case 13:
            result = _context7.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context7.next = 18;
            return db.collection("existencia").deleteMany({});

          case 18:
            _context7.next = 20;
            return db.collection("existencia").insertMany(result);

          case 20:
            result = _context7.sent;
            res.status(201).json(result);
            _context7.next = 27;
            break;

          case 24:
            _context7.prev = 24;
            _context7.t0 = _context7["catch"](4);
            res.status(400).json({
              msg: "ha ocurrido un error ",
              error: _context7.t0
            });

          case 27:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[4, 24]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;