"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

var _calculateDesgloseEmpleados = _interopRequireDefault(require("../../functions/calculateDesgloseEmpleados"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)(); //database connection

//SHOW AUSENCIAS POR EMPLEADO
router.post("/show/:id", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var id, pageNumber, nPerPage, skip_page, db, countAusencias, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = req.params.id;
            pageNumber = req.body.pageNumber;
            nPerPage = 10;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context.next = 6;
            return (0, _database.connect)();

          case 6:
            db = _context.sent;
            _context.prev = 7;
            _context.next = 10;
            return db.collection("empleados_ausencias").find().count();

          case 10:
            countAusencias = _context.sent;
            _context.next = 13;
            return db.collection("empleados_ausencias").find({
              id_empleado: id
            }).skip(skip_page).limit(nPerPage).toArray();

          case 13:
            result = _context.sent;
            res.json({
              total_items: countAusencias,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countAusencias / nPerPage + 1),
              ausencias: result
            });
            _context.next = 20;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](7);
            res.status(501).json(_context.t0);

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[7, 17]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); //SHOW AUSENCIAS POR EMPLEADO, AÑO Y MES

router.post("/show/:id/:mes/:anio", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var _req$params, id, mes, anio, db, result;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _req$params = req.params, id = _req$params.id, mes = _req$params.mes, anio = _req$params.anio;
            _context2.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context2.sent;
            _context2.next = 6;
            return db.collection("empleados_ausencias").find({
              id_empleado: id,
              mes_ausencia: mes,
              anio_ausencia: anio
            }).toArray();

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
}()); //INSERT AUSENCIA BY EMPLEADO

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, data, r, empleado, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            data = JSON.parse(req.body.data);
            r = null;

            if (req.file) {
              data.archivo_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            } else {
              data.archivo_adjunto = {};
            }

            _context3.next = 8;
            return db.collection("empleados_ausencias").insertOne(data);

          case 8:
            _context3.next = 10;
            return db.collection("empleados").findOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            });

          case 10:
            empleado = _context3.sent;

            if (!empleado) {
              _context3.next = 18;
              break;
            }

            _context3.next = 14;
            return db.collection("empleados").updateOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            }, {
              $set: {
                detalle_empleado: (0, _calculateDesgloseEmpleados["default"])(empleado.detalle_empleado, data.abrev_ausencia, data.cantidad_dias, empleado.dias_vacaciones, "inc")
              }
            });

          case 14:
            result = _context3.sent;
            res.json(result);
            _context3.next = 19;
            break;

          case 18:
            res.status(500).json({
              msg: "No se ha encontrado el empleado"
            });

          case 19:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //UPDATE AUSENCIA

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var id, db, data, r, resultEdit, empleado, obj, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            data = JSON.parse(req.body.data);
            r = null;

            if (req.file) {
              data.archivo_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            ;
            _context4.next = 10;
            return db.collection("empleados_ausencias").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: data
            });

          case 10:
            resultEdit = _context4.sent;

            if (!resultEdit.value) {
              _context4.next = 24;
              break;
            }

            _context4.next = 14;
            return db.collection("empleados").findOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            });

          case 14:
            empleado = _context4.sent;

            if (!empleado) {
              _context4.next = 23;
              break;
            }

            //primero se resta el antiguo
            obj = (0, _calculateDesgloseEmpleados["default"])(empleado.detalle_empleado, resultEdit.value.abrev_ausencia, resultEdit.value.cantidad_dias, empleado.dias_vacaciones, "dec"); //luego se suma el nuevo dato

            _context4.next = 19;
            return db.collection("empleados").updateOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            }, {
              $set: {
                detalle_empleado: (0, _calculateDesgloseEmpleados["default"])(obj, data.abrev_ausencia, data.cantidad_dias, empleado.dias_vacaciones, "inc")
              }
            });

          case 19:
            result = _context4.sent;
            res.json(result);
            _context4.next = 24;
            break;

          case 23:
            res.status(500).json({
              msg: "No se ha encontrado el empleado"
            });

          case 24:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //DELETE AUSENCIA

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, data, r, empleado, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            data = JSON.parse(req.query.data);
            r = null;
            _context5.next = 8;
            return db.collection("empleados_ausencias").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 8:
            _context5.next = 10;
            return db.collection("empleados").findOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            });

          case 10:
            empleado = _context5.sent;

            if (!empleado) {
              _context5.next = 18;
              break;
            }

            _context5.next = 14;
            return db.collection("empleados").updateOne({
              _id: (0, _mongodb.ObjectID)(data.id_empleado)
            }, {
              $set: {
                detalle_empleado: (0, _calculateDesgloseEmpleados["default"])(empleado.detalle_empleado, data.abrev_ausencia, data.cantidad_dias, empleado.dias_vacaciones, "dec")
              }
            });

          case 14:
            result = _context5.sent;
            res.json(result);
            _context5.next = 19;
            break;

          case 18:
            res.status(500).json({
              msg: "No se ha encontrado el empleado"
            });

          case 19:
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