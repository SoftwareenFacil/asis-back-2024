"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireWildcard(require("express"));

var _calculateDaysVacation = _interopRequireDefault(require("../../functions/calculateDaysVacation"));

var _calculateDesgloseEmpleados = _interopRequireDefault(require("../../functions/calculateDesgloseEmpleados"));

var _text_messages = require("../../constant/text_messages");

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
            return db.collection("gi").find({
              activo_inactivo: true,
              grupo_interes: 'Empleados'
            }).toArray();

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
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countEmpleados, result;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context2.prev = 5;
            _context2.next = 8;
            return db.collection("gi").find({
              grupo_interes: 'Empleados',
              activo_inactivo: true
            }).count();

          case 8:
            countEmpleados = _context2.sent;
            _context2.next = 11;
            return db.collection("gi").find({
              grupo_interes: 'Empleados',
              activo_inactivo: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context2.sent;
            return _context2.abrupt("return", res.status(200).json({
              // auth: AUTHORIZED,
              total_items: countEmpleados,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEmpleados / nPerPage + 1),
              empleados: result
            }));

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](5);
            console.log(_context2.t0);
            return _context2.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              empleados: null,
              err: String(_context2.t0)
            }));

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[5, 15]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //BUSCAR POR NOMBRE O RUT

router.post("/buscar", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, rutFiltrado, rexExpresionFiltro, result, countEmpleados, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // let rutFiltrado;
            // if (identificador === 1 && filtro.includes("k")) {
            //   rutFiltrado = filtro;
            //   rutFiltrado.replace("k", "K");
            // } else {
            //   rutFiltrado = filtro;
            // }

            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context3.prev = 8;
            _context3.next = 11;
            return db.collection("gi").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "grupo_interes", 'Empleados'), _defineProperty(_db$collection$find, "activo_inactivo", true), _db$collection$find)).count();

          case 11:
            countEmpleados = _context3.sent;
            _context3.next = 14;
            return db.collection("gi").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "grupo_interes", 'Empleados'), _defineProperty(_db$collection$find2, "activo_inactivo", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              total_items: countEmpleados,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEmpleados / nPerPage + 1),
              empleados: result
            }));

          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](8);
            console.log(_context3.t0);
            return _context3.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              empleados: null,
              err: String(_context3.t0)
            }));

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[8, 18]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT BY ID

router.get("/:id", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            _context4.next = 6;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context4.sent;
            return _context4.abrupt("return", res.json(result));

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //EDITAR EMPLEADO

router.put("/:id", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, data, diasVacaciones, empleado, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            data = req.body;
            diasVacaciones = 0; // if (req.file) {
            //   data.archivo_adjunto = {
            //     name: req.file.originalname,
            //     size: req.file.size,
            //     path: req.file.path,
            //     type: req.file.mimetype,
            //   };
            // }

            if (data.fecha_inicio_contrato) {
              if (data.fecha_fin_contrato != null && data.fecha_fin_contrato != "" && data.fecha_fin_contrato != undefined) {
                diasVacaciones = (0, _calculateDaysVacation["default"])(data.fecha_inicio_contrato, data.fecha_fin_contrato);
              } else {
                diasVacaciones = (0, _calculateDaysVacation["default"])(data.fecha_inicio_contrato, new Date());
              }
            }

            _context5.next = 9;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 9:
            empleado = _context5.sent;

            if (!empleado) {
              _context5.next = 17;
              break;
            }

            _context5.next = 13;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: _objectSpread({}, empleado, {
                // cargo: data.cargo,
                tipo_contrato: data.tipo_contrato,
                estado_contrato: data.estado_contrato,
                fecha_inicio_contrato: data.fecha_inicio_contrato,
                fecha_fin_contrato: data.fecha_fin_contrato,
                sueldo_bruto: data.sueldo_bruto,
                afp: data.afp,
                isapre: data.isapre,
                seguridad_laboral: data.seguridad_laboral,
                dias_vacaciones: diasVacaciones,
                comentarios: data.comentarios,
                detalle_empleado: (0, _calculateDesgloseEmpleados["default"])(empleado.detalle_empleado, "none", 0, diasVacaciones, "none", diasVacaciones)
              })
            });

          case 13:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Empleado editado correctamente',
              res: result
            }));

          case 17:
            console.log(error);
            return _context5.abrupt("return", res.status(500).json({
              err: String(error),
              msg: _text_messages.ERROR,
              res: null
            }));

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
}()); //test para pasar los empleados desde gi a la coleccion empleados

router.get("/traspaso/test", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var db, newArray, result, r;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context6.sent;
            newArray = [];
            _context6.next = 6;
            return db.collection("gi").find({
              grupo_interes: "Empleados"
            }).toArray();

          case 6:
            result = _context6.sent;

            if (!result) {
              _context6.next = 16;
              break;
            }

            console.log(result.length);
            result.forEach(function (element) {
              var obj = {};
              obj.nombre = element.razon_social;
              obj.rut = element.rut;
              obj.categoria = element.categoria;
              obj.cargo = element.cargo;
              obj.tipo_contrato = "";
              obj.estado_contrato = "";
              obj.fecha_inicio_contrato = "";
              obj.fecha_fin_contrato = "";
              obj.sueldo_bruto = 0;
              obj.afp = "";
              obj.isapre = "";
              obj.seguridad_laboral = "";
              obj.dias_vacaciones = 0;
              obj.comentarios = "";
              obj.activo_inactivo = true;
              obj.detalle_empleado = {
                dias_acumulados: 0,
                dias_recuperados: 0,
                dias_total_ausencias: 0,
                dias_pendientes: 0,
                enfermedad_cant: 0,
                maternidad_cant: 0,
                mediodia_cant: 0,
                tramites_cant: 0,
                vacaciones_cant: 0,
                recuperados_cant: 0,
                mediodia_recuperados_cant: 0
              };
              newArray.push(obj);
              obj = {};
            });
            _context6.next = 12;
            return db.collection("empleados").insertMany(newArray);

          case 12:
            r = _context6.sent;
            return _context6.abrupt("return", res.json(r));

          case 16:
            return _context6.abrupt("return", res.json({
              cant: result.length,
              data: result
            }));

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //DELETE EMPLEADOS

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
            console.log(id);
            _context7.prev = 5;
            _context7.next = 8;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                activo_inactivo: false
              }
            });

          case 8:
            result = _context7.sent;
            return _context7.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Empleado eliminado correctamente',
              res: result
            }));

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7["catch"](5);
            return _context7.abrupt("return", res.status(500).json({
              err: String(_context7.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 15:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[5, 12]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;