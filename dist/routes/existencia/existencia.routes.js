"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _database = require("../../database");

var _mongodb = require("mongodb");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
            return db.collection("existencia").find({}).toArray();

          case 5:
            result = _context.sent;
            return _context.abrupt("return", res.json(result));

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
            return db.collection('existencia').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context2.sent;
            return _context2.abrupt("return", res.json(result));

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
    var db, _req$body, pageNumber, nPerPage, skip_page, countExistencia, result;

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
            return db.collection("existencia").find().count();

          case 8:
            countExistencia = _context3.sent;
            _context3.next = 11;
            return db.collection("existencia").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              total_items: countExistencia,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countExistencia / nPerPage + 1),
              existencias: result
            }));

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            return _context3.abrupt("return", res.status(501).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              existencias: null,
              err: String(err)
            }));

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
}()); //BUSCAR

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countExis;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context4.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context4.sent;
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context4.prev = 8;
            _context4.next = 11;
            return db.collection("existencia").find(_defineProperty({}, headFilter, rexExpresionFiltro)).count();

          case 11:
            countExis = _context4.sent;
            _context4.next = 14;
            return db.collection("existencia").find(_defineProperty({}, headFilter, rexExpresionFiltro)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              total_items: countExis,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countExis / nPerPage + 1),
              existencias: result
            }));

          case 18:
            _context4.prev = 18;
            _context4.t0 = _context4["catch"](8);
            return _context4.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              existencias: null,
              err: String(_context4.t0)
            }));

          case 21:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[8, 18]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //CONSULTAR POR ENTRADAS PARA INSERCION DE SALIDAS

router.post("/consultar", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, _req$body3, code, indicador, cant, cupos_disponibles, result;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            _req$body3 = req.body, code = _req$body3.code, indicador = _req$body3.indicador, cant = _req$body3.cant;
            cupos_disponibles = 0;
            _context5.next = 7;
            return db.collection("existencia").findOne({
              codigo_categoria_tres: code
            });

          case 7:
            result = _context5.sent;

            if (!(result == null)) {
              _context5.next = 12;
              break;
            }

            return _context5.abrupt("return", res.json({
              message: "La Subcategoria 3 consultada no existe en la existencia del sistema",
              isOK: false
            }));

          case 12:
            if (indicador === 2) {
              cupos_disponibles = result.existencia + cant;
            } else {
              cupos_disponibles = result.existencia;
            }

            return _context5.abrupt("return", res.json({
              isOK: true,
              cupos_disponibles: cupos_disponibles,
              costo_unitario_promedio: result.costo_unitario_promedio
            }));

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;