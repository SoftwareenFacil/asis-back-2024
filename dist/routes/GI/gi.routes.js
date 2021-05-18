"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _moment = _interopRequireDefault(require("moment"));

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _excelToJson = _interopRequireDefault(require("../../functions/insertManyGis/excelToJson"));

var _verificateTipoCliente = _interopRequireDefault(require("../../functions/insertManyGis/verificateTipoCliente"));

var _getEmpresasGI = _interopRequireDefault(require("../../functions/insertManyGis/getEmpresasGI"));

var _getPersonasGI = _interopRequireDefault(require("../../functions/insertManyGis/getPersonasGI"));

var _eliminateDuplicated = _interopRequireDefault(require("../../functions/insertManyGis/eliminateDuplicated"));

var _verificateCatEmpresa = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatEmpresa"));

var _verificateCatPersona = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatPersona"));

var _verificateCatCliente = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatCliente"));

var _verificateCredito = _interopRequireDefault(require("../../functions/insertManyGis/verificateCredito"));

var _verificateFechaInicio = _interopRequireDefault(require("../../functions/insertManyGis/verificateFechaInicio"));

var _verificateDiasCredito = _interopRequireDefault(require("../../functions/insertManyGis/verificateDiasCredito"));

var _verificateOrdenCompra = _interopRequireDefault(require("../../functions/insertManyGis/verificateOrdenCompra"));

var _createJsonGiForInsert = _interopRequireDefault(require("../../functions/insertManyGis/createJsonGiForInsert"));

var _addCodeGI = _interopRequireDefault(require("../../functions/insertManyGis/addCodeGI"));

var _companiesInsert = require("../../functions/companiesInsert");

var _text_messages = require("../../constant/text_messages");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _bcrypt = require("../../libs/bcrypt");

var _jwt = require("../../libs/jwt");

var _database = require("../../database");

var _mongodb = require("mongodb");

var _var = require("../../constant/var");

var _naturalPersonsInsert = require("../../functions/naturalPersonsInsert");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
            _context.prev = 3;
            _context.next = 6;
            return db.collection("gi").find({
              activo_inactivo: true
            }).sort({
              codigo: 1
            }).toArray();

          case 6:
            result = _context.sent;
            return _context.abrupt("return", res.status(200).json({
              total_items: 0,
              pagina_actual: 0,
              nro_paginas: 0,
              gis: result
            }));

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: pageNumber,
              nro_paginas: 0,
              gis: []
            }));

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 10]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); // SELECT GI PAGINATED

router.post("/pagination", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var _req$body, pageNumber, nPerPage, skip_page, db, countGIs, result;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context2.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context2.sent;
            _context2.prev = 5;
            _context2.next = 8;
            return db.collection("gi").find({
              activo_inactivo: true
            }).count();

          case 8:
            countGIs = _context2.sent;
            _context2.next = 11;
            return db.collection("gi").find({
              activo_inactivo: true
            }).skip(skip_page).limit(nPerPage).sort({
              codigo: -1
            }).toArray();

          case 11:
            result = _context2.sent;
            console.log({
              total_items: countGIs,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGIs / nPerPage + 1) // gis: result,

            });
            return _context2.abrupt("return", res.json({
              total_items: countGIs,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGIs / nPerPage + 1),
              gis: result
            }));

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](5);
            return _context2.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: pageNumber,
              nro_paginas: 0,
              gis: []
            }));

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[5, 16]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //SELECT ONLY EMPRESAS

router.get("/empresas", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            _context3.prev = 3;
            _context3.next = 6;
            return db.collection("gi").find({
              categoria: "Empresa/Organizacion",
              activo_inactivo: true
            }).toArray();

          case 6:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              err: null,
              res: result
            }));

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](3);
            return _context3.abrupt("return", res.status(400).json({
              err: String(_context3.t0),
              res: []
            }));

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 10]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT ONLY PERSONS

router.get("/personal", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            _context4.prev = 3;
            _context4.next = 6;
            return db.collection("gi").find({
              categoria: "Persona Natural",
              activo_inactivo: true
            }).toArray();

          case 6:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              res: result
            }));

          case 10:
            _context4.prev = 10;
            _context4.t0 = _context4["catch"](3);
            return _context4.abrupt("return", res.status(400).json({
              err: String(_context4.t0),
              res: []
            }));

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 10]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //get only workers and natural person

router.get('/workers', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            _context5.prev = 3;
            _context5.next = 6;
            return db.collection("gi").find({
              categoria: "Persona Natural",
              grupo_interes: 'Empleados',
              activo_inactivo: true
            }).toArray();

          case 6:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              res: result
            }));

          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](3);
            return _context5.abrupt("return", res.status(400).json({
              err: String(_context5.t0),
              res: []
            }));

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[3, 10]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //BUSCAR GIS POR NOMBRE O RUT

router.post("/buscar", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countGIs;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context6.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context6.sent;
            console.log('error', [identificador, filtro, pageNumber, nPerPage]);
            _context6.prev = 6;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado = filtro;
              rutFiltrado.replace("k", "K");
            } else {
              rutFiltrado = filtro;
            }

            ;
            rexExpresionFiltro = new RegExp(rutFiltrado, "i");

            if (!(identificador === 1)) {
              _context6.next = 19;
              break;
            }

            _context6.next = 13;
            return db.collection("gi").find({
              rut: rexExpresionFiltro,
              activo_inactivo: true
            }).count();

          case 13:
            countGIs = _context6.sent;
            _context6.next = 16;
            return db.collection("gi").find({
              rut: rexExpresionFiltro,
              activo_inactivo: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 16:
            result = _context6.sent;
            _context6.next = 34;
            break;

          case 19:
            if (!(identificador === 2)) {
              _context6.next = 28;
              break;
            }

            _context6.next = 22;
            return db.collection("gi").find({
              razon_social: rexExpresionFiltro,
              activo_inactivo: true
            }).count();

          case 22:
            countGIs = _context6.sent;
            _context6.next = 25;
            return db.collection("gi").find({
              razon_social: rexExpresionFiltro,
              activo_inactivo: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 25:
            result = _context6.sent;
            _context6.next = 34;
            break;

          case 28:
            _context6.next = 30;
            return db.collection("gi").find({
              grupo_interes: rexExpresionFiltro,
              activo_inactivo: true
            }).count();

          case 30:
            countGIs = _context6.sent;
            _context6.next = 33;
            return db.collection("gi").find({
              grupo_interes: rexExpresionFiltro,
              activo_inactivo: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 33:
            result = _context6.sent;

          case 34:
            return _context6.abrupt("return", res.status(200).json({
              total_items: countGIs,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGIs / nPerPage + 1),
              gis: result
            }));

          case 37:
            _context6.prev = 37;
            _context6.t0 = _context6["catch"](6);
            console.log(_context6.t0);
            return _context6.abrupt("return", res.status(400).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              gis: [],
              err: String(_context6.t0)
            }));

          case 41:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[6, 37]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //SELECT BY RUT

router.post("/client", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var _req$body3, rut, selector, db, rutFiltrado, result;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _req$body3 = req.body, rut = _req$body3.rut, selector = _req$body3.selector;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            result = "";

            if (rut.includes("k")) {
              rutFiltrado = rut.replace("k", "K");
            } else {
              rutFiltrado = rut;
            }

            console.log('rut filtrado', [rutFiltrado, selector]);
            _context7.prev = 7;

            if (!(selector == 1)) {
              _context7.next = 14;
              break;
            }

            _context7.next = 11;
            return db.collection("gi").findOne({
              rut: rutFiltrado,
              categoria: "Empresa/Organizacion",
              activo_inactivo: true
            });

          case 11:
            result = _context7.sent;
            _context7.next = 18;
            break;

          case 14:
            if (!(selector == 2)) {
              _context7.next = 18;
              break;
            }

            _context7.next = 17;
            return db.collection("gi").findOne({
              rut: rutFiltrado,
              categoria: "Persona Natural",
              activo_inactivo: true
            });

          case 17:
            result = _context7.sent;

          case 18:
            if (result) {
              _context7.next = 20;
              break;
            }

            return _context7.abrupt("return", res.status(200).json({
              err: 98,
              res: result
            }));

          case 20:
            return _context7.abrupt("return", res.status(200).json({
              err: null,
              res: result
            }));

          case 23:
            _context7.prev = 23;
            _context7.t0 = _context7["catch"](7);
            return _context7.abrupt("return", res.status(500).json({
              err: String(err),
              res: null
            }));

          case 26:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[7, 23]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //SELECT BY ID

router.get("/:id", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _context8.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context8.sent;
            _context8.prev = 4;
            _context8.next = 7;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(id),
              activo_inactivo: true
            });

          case 7:
            result = _context8.sent;
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              res: result
            }));

          case 11:
            _context8.prev = 11;
            _context8.t0 = _context8["catch"](4);
            console.log(_context8.t0);
            return _context8.abrupt("return", res.status(400).json({
              err: String(_context8.t0),
              res: null
            }));

          case 15:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[4, 11]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //UPDATE GI

router.put('/:id', _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, updatedGI, db, exitstGI;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            updatedGI = JSON.parse(req.body.data);
            _context9.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context9.sent;

            if (req.file) {
              updatedGI.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path
              };
            }

            _context9.prev = 6;
            updatedGI.rol = updatedGI.rol || 'Clientes';

            if (updatedGI.rut !== '' && updatedGI.rut.split('-')[1] === 'k') {
              updatedGI.rut = "".concat(updatedGI.rut.split('-')[0], "-K");
            }

            _context9.next = 11;
            return db.collection('gi').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 11:
            exitstGI = _context9.sent;

            if (exitstGI) {
              _context9.next = 14;
              break;
            }

            return _context9.abrupt("return", res.status(400).json({
              err: 98,
              res: _var.NOT_EXISTS
            }));

          case 14:
            ;
            _context9.next = 17;
            return db.collection('gi').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: _objectSpread({}, exitstGI, {}, updatedGI)
            });

          case 17:
            return _context9.abrupt("return", res.status(200).json({
              err: null,
              res: "GI modificado correctamente"
            }));

          case 20:
            _context9.prev = 20;
            _context9.t0 = _context9["catch"](6);
            console.log(_context9.t0);
            return _context9.abrupt("return", res.status(500).json({
              err: String(_context9.t0),
              res: null
            }));

          case 24:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[6, 20]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //UPDATE PASSWORD

router.put('/editpassword/:id', /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var db, id, data;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context10.sent;
            id = req.params.id;
            data = req.body;
            console.log('id', id);
            console.log('data', data);
            _context10.prev = 7;

            if (!data.isEditPassword) {
              _context10.next = 20;
              break;
            }

            _context10.t0 = db.collection('gi');
            _context10.t1 = {
              _id: (0, _mongodb.ObjectID)(id)
            };
            _context10.next = 13;
            return (0, _bcrypt.encrypPassword)(data.new_password);

          case 13:
            _context10.t2 = _context10.sent;
            _context10.t3 = data.rol;
            _context10.t4 = {
              password: _context10.t2,
              rol: _context10.t3
            };
            _context10.t5 = {
              $set: _context10.t4
            };
            _context10.next = 19;
            return _context10.t0.updateOne.call(_context10.t0, _context10.t1, _context10.t5);

          case 19:
            return _context10.abrupt("return", res.status(200).json({
              err: null,
              msg: "Configuración realizada exitosamente",
              res: null
            }));

          case 20:
            _context10.next = 22;
            return db.collection('gi').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                rol: data.rol
              }
            });

          case 22:
            return _context10.abrupt("return", res.status(200).json({
              err: null,
              msg: "Configuración realizada exitosamente",
              res: null
            }));

          case 25:
            _context10.prev = 25;
            _context10.t6 = _context10["catch"](7);
            console.log(_context10.t6);
            return _context10.abrupt("return", res.status(500).json({
              err: String(_context10.t6),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 29:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[7, 25]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //TEST DATOS ARCHIVOS

router.post("/test/gonzalo", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            console.log(req.file);

          case 1:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}()); //ENDPOINT PARA INSERCION DE GI EMPRESAS

router.post('/masivo/empresas', _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var data, _verificateGrupoInter, companies, noInserted, db, gisInDB, _eliminatedDuplicated, uniqueCompanies, duplicatedGI, _verificateClientType, clients, notInsertClient, _isExistsRUT, gisWithRut, notInsertGIWithoutRut, gisIsReady, lastGi, gisWithCode;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            data = (0, _excelToJson["default"])(req.file.path, "PLANTILLA GI_ASIS");
            _context12.prev = 1;

            if (!(!data && data.length === 0)) {
              _context12.next = 4;
              break;
            }

            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Excel no contiene información',
              res: null
            }));

          case 4:
            _verificateGrupoInter = (0, _companiesInsert.verificateGrupoInteres)(data), companies = _verificateGrupoInter.companies, noInserted = _verificateGrupoInter.noInserted;

            if (!(companies.length === 0)) {
              _context12.next = 7;
              break;
            }

            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'No se encontraron gi acorde al tipo en sistema en el excel',
              res: null
            }));

          case 7:
            _context12.next = 9;
            return (0, _database.connect)();

          case 9:
            db = _context12.sent;
            _context12.next = 12;
            return db.collection('gi').find({
              categoria: 'Empresa/Organizacion'
            }).toArray();

          case 12:
            gisInDB = _context12.sent;
            _eliminatedDuplicated = (0, _companiesInsert.eliminatedDuplicated)(companies, gisInDB), uniqueCompanies = _eliminatedDuplicated.uniqueCompanies, duplicatedGI = _eliminatedDuplicated.duplicatedGI;

            if (!(uniqueCompanies.length === 0)) {
              _context12.next = 16;
              break;
            }

            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Todos los gi ya se encuentran ingresados en la db',
              res: null
            }));

          case 16:
            _verificateClientType = (0, _companiesInsert.verificateClientType)(uniqueCompanies, 'empresa/organizacion'), clients = _verificateClientType.clients, notInsertClient = _verificateClientType.notInsertClient;

            if (!(clients.length === 0)) {
              _context12.next = 19;
              break;
            }

            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'No existen Empresa/Organizacion en los datos del excel',
              res: null
            }));

          case 19:
            _isExistsRUT = (0, _companiesInsert.isExistsRUT)(clients), gisWithRut = _isExistsRUT.gisWithRut, notInsertGIWithoutRut = _isExistsRUT.notInsertGIWithoutRut;

            if (!(gisWithRut.length === 0)) {
              _context12.next = 22;
              break;
            }

            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Ningun gi ingresado contiene rut válido',
              res: null
            }));

          case 22:
            gisIsReady = (0, _companiesInsert.mapDataToInsertManyGIs)(gisWithRut);
            _context12.next = 25;
            return db.collection("gi").find({}).sort({
              codigo: -1
            }).limit(1).toArray();

          case 25:
            lastGi = _context12.sent;
            gisWithCode = (0, _addCodeGI["default"])(gisIsReady, lastGi[0], (0, _moment["default"])().format('YYYY'));
            _context12.next = 29;
            return db.collection('gi').insertMany(gisWithCode);

          case 29:
            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'GIs insertados correctamente',
              res: {
                cant_inserted: gisWithCode.length,
                cant_not_inserted: [].concat(_toConsumableArray(noInserted), _toConsumableArray(duplicatedGI), _toConsumableArray(notInsertClient), _toConsumableArray(notInsertGIWithoutRut)).length,
                not_inserted: [].concat(_toConsumableArray(noInserted), _toConsumableArray(duplicatedGI), _toConsumableArray(notInsertClient), _toConsumableArray(notInsertGIWithoutRut))
              }
            }));

          case 32:
            _context12.prev = 32;
            _context12.t0 = _context12["catch"](1);
            return _context12.abrupt("return", res.status(500).json({
              err: String(_context12.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 35:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[1, 32]]);
  }));

  return function (_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}()); //ENDPOINT PARA INSERCION DE GI PERSONA NATURAL

router.post('/masivo/persona', _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(req, res) {
    var data, _verificateGrupoInter2, companies, noInserted, db, gisInDB, _eliminatedDuplicated2, uniqueCompanies, duplicatedGI, _verificateClientType2, clients, notInsertClient, _isExistsRUT2, gisWithRut, notInsertGIWithoutRut, gisIsReady, lastGi, gisWithCode;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            data = (0, _excelToJson["default"])(req.file.path, "PLANTILLA GI_ASIS");
            _context13.prev = 1;

            if (!(!data && data.length === 0)) {
              _context13.next = 4;
              break;
            }

            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Excel no contiene información',
              res: null
            }));

          case 4:
            _verificateGrupoInter2 = (0, _companiesInsert.verificateGrupoInteres)(data), companies = _verificateGrupoInter2.companies, noInserted = _verificateGrupoInter2.noInserted;

            if (!(companies.length === 0)) {
              _context13.next = 7;
              break;
            }

            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'No se encontraron gi acorde al tipo en sistema en el excel',
              res: null
            }));

          case 7:
            console.log(companies.length);
            _context13.next = 10;
            return (0, _database.connect)();

          case 10:
            db = _context13.sent;
            _context13.next = 13;
            return db.collection('gi').find({
              categoria: 'Persona Natural'
            }).toArray();

          case 13:
            gisInDB = _context13.sent;
            _eliminatedDuplicated2 = (0, _companiesInsert.eliminatedDuplicated)(companies, gisInDB), uniqueCompanies = _eliminatedDuplicated2.uniqueCompanies, duplicatedGI = _eliminatedDuplicated2.duplicatedGI;

            if (!(!uniqueCompanies && uniqueCompanies.length === 0)) {
              _context13.next = 17;
              break;
            }

            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Todos los gi ya se encuentran ingresados en la db',
              res: null
            }));

          case 17:
            _verificateClientType2 = (0, _companiesInsert.verificateClientType)(uniqueCompanies, 'persona natural'), clients = _verificateClientType2.clients, notInsertClient = _verificateClientType2.notInsertClient;

            if (!(clients.length === 0)) {
              _context13.next = 20;
              break;
            }

            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'No existen Personas Naturales en los datos del excel',
              res: null
            }));

          case 20:
            _isExistsRUT2 = (0, _companiesInsert.isExistsRUT)(clients), gisWithRut = _isExistsRUT2.gisWithRut, notInsertGIWithoutRut = _isExistsRUT2.notInsertGIWithoutRut;

            if (!(gisWithRut.length === 0)) {
              _context13.next = 23;
              break;
            }

            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Ningun gi ingresado contiene rut válido',
              res: null
            }));

          case 23:
            gisIsReady = (0, _naturalPersonsInsert.mapDataToInsertManyNaturalPersons)(gisWithRut);
            _context13.next = 26;
            return db.collection("gi").find({}).sort({
              codigo: -1
            }).limit(1).toArray();

          case 26:
            lastGi = _context13.sent;
            gisWithCode = (0, _addCodeGI["default"])(gisIsReady, lastGi[0], (0, _moment["default"])().format('YYYY'));
            _context13.next = 30;
            return db.collection('gi').insertMany(gisWithCode);

          case 30:
            return _context13.abrupt("return", res.status(200).json({
              err: null,
              msg: 'GIs insertados correctamente',
              res: {
                cant_inserted: gisWithCode.length,
                cant_not_inserted: [].concat(_toConsumableArray(noInserted), _toConsumableArray(duplicatedGI), _toConsumableArray(notInsertClient), _toConsumableArray(notInsertGIWithoutRut)).length,
                not_inserted: [].concat(_toConsumableArray(noInserted), _toConsumableArray(duplicatedGI), _toConsumableArray(notInsertClient), _toConsumableArray(notInsertGIWithoutRut))
              }
            }));

          case 33:
            _context13.prev = 33;
            _context13.t0 = _context13["catch"](1);
            console.log(_context13.t0);
            return _context13.abrupt("return", res.status(500).json({
              err: String(_context13.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 37:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[1, 33]]);
  }));

  return function (_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}()); //TEST PARA RECIBIR EXCEL DE INGRESO DE GIS
// router.post("/masivo/file", multer.single("archivo"), async (req, res) => {
//   const { nombre } = req.body;
//   const db = await connect();
//   const data = excelToJson(req.file.path, "PLANTILLA GI_ASIS");
//   let array_general_empresas = [];
//   let array_general_personas = [];
//   let array_general = [];
//   let renegados = [];
//   try {
//     if (data.length > 0) {
//       array_general = verificateTipoCliente(data);
//       array_general[1].renegados.forEach((element) => {
//         renegados.push(element);
//       });
//       array_general_empresas = getEmpresasGI(array_general[0].newdata);
//       let empresas = array_general_empresas[0].newdata;
//       array_general_personas = getPersonasGI(array_general[0].newdata);
//       let personas = array_general_personas[0].newdata;
//       // console.log(array_general_personas[0].newdata);
//       empresas = eliminateDuplicated(empresas, "rut");
//       personas = eliminateDuplicated(personas, "rut");
//       empresas = verificateGrupoInteres(empresas);
//       personas = verificateGrupoInteres(personas);
//       empresas = verificateCatEmpresa(empresas);
//       personas = verificateCatPersona(personas);
//       empresas = verificateCatCliente(empresas);
//       personas = verificateCatCliente(personas);
//       empresas = verificateCredito(empresas);
//       empresas = verificateDiasCredito(empresas);
//       empresas = verificateOrdenCompra(empresas);
//       const lastGi = await db
//         .collection("gi")
//         .find({})
//         .sort({ codigo: -1 })
//         .limit(1)
//         .toArray();
//       // console.log(lastGi);
//       let arrayGIs = createJsonGIs(empresas, personas);
//       arrayGIs = addCodeGI(arrayGIs, lastGi[0], YEAR);
//       //sacamos los empleados
//       const empleados = arrayGIs.filter((el) => el.GrupoInteres === 'Empleados');
//       const othersWorkers = arrayGIs.filter((el) => el.GrupoInteres !== 'Empleados');
//       console.log('insert many', othersWorkers[0])
//       await db.collection('gi').insertMany(othersWorkers || []);
//       await db.collection('empleados').insertMany(empleados || []);
//       // const result = await db.collection("gi").insertMany(arrayGIs);
//       return res.json({
//         message: "Ha finalizado la inserción masiva",
//         isOK: true,
//         renegados: [],
//       });
//     } else {
//       return res.json({
//         message: "EL archivo ingresado no es un archivo excel válido",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       message: "Algo ha salido mal",
//       isOK: false,
//       error: String(err),
//     });
//   }
// });
//INSERT

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(req, res) {
    var db, newGi, items, olgid, obj;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context14.sent;
            newGi = JSON.parse(req.body.data);
            _context14.next = 6;
            return db.collection("gi").find({}).toArray();

          case 6:
            items = _context14.sent;
            _context14.prev = 7;

            if (!(items.length > 0)) {
              _context14.next = 12;
              break;
            }

            olgid = items.find(function (gi) {
              return gi.categoria === newGi.categoria && gi.rut === newGi.rut;
            });

            if (!olgid) {
              _context14.next = 12;
              break;
            }

            return _context14.abrupt("return", res.status(400).json({
              err: 99,
              res: _var.ALREADY_EXISTS
            }));

          case 12:
            if (items.length > 0) {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-00001");
            }

            if (req.file) {
              newGi.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            } else {
              newGi.url_file_adjunto = {};
            }

            if (newGi.rut !== '' && newGi.rut.split('-')[1] === 'k') {
              newGi.rut = "".concat(newGi.rut.split('-')[0], "-K");
            }

            newGi.rol = newGi.rol || 'Clientes';
            newGi.activo_inactivo = true;

            if (newGi.grupo_interes === "Empleados") {
              obj = {};
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
              newGi = _objectSpread({}, newGi, {}, obj);
            }

            ;
            _context14.next = 21;
            return db.collection("gi").insertOne(newGi);

          case 21:
            return _context14.abrupt("return", res.status(200).json({
              err: null,
              res: 'GI creado satisfactoriamente'
            }));

          case 24:
            _context14.prev = 24;
            _context14.t0 = _context14["catch"](7);
            console.log(_context14.t0);
            return _context14.abrupt("return", res.status(500).json({
              err: "Se ha generado el siguiente error : ".concat(String(_context14.t0)),
              res: null
            }));

          case 28:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, null, [[7, 24]]);
  }));

  return function (_x27, _x28) {
    return _ref14.apply(this, arguments);
  };
}()); //DELETE

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            id = req.params.id;
            _context15.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context15.sent;
            _context15.prev = 4;
            _context15.next = 7;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                activo_inactivo: false
              }
            });

          case 7:
            result = _context15.sent;
            return _context15.abrupt("return", res.status(200).json({
              err: null,
              res: 'GI eliminado correctamente'
            }));

          case 11:
            _context15.prev = 11;
            _context15.t0 = _context15["catch"](4);
            console.log(_context15.t0);
            return _context15.abrupt("return", res.status(500).json({
              err: String(_context15.t0),
              res: null
            }));

          case 15:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[4, 11]]);
  }));

  return function (_x29, _x30) {
    return _ref15.apply(this, arguments);
  };
}()); //para programar solamente limpiar toda la db

router["delete"]("/", /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context16.sent;
            _context16.next = 5;
            return db.collection("gi").drop();

          case 5:
            result = _context16.sent;
            // await db.collection("cobranza").drop();
            // await db.collection("evaluaciones").drop();
            // await db.collection("existencia").drop();
            // await db.collection("facturaciones").drop();
            // await db.collection("gastos").drop();
            // await db.collection("pagos").drop();
            // await db.collection("prexistencia").drop();
            // await db.collection("reservas").drop();
            // await db.collection("resultados").drop();
            // await db.collection("salidas").drop();
            // await db.collection("solicitudes").drop();
            res.json({
              message: "listo"
            });

          case 7:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));

  return function (_x31, _x32) {
    return _ref16.apply(this, arguments);
  };
}()); //change rut k

router.get("/changerut/dv", /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(req, res) {
    var db, changeDv, verifyDv, result, reduceredGis;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context18.sent;

            changeDv = function changeDv(rut) {
              var dv = rut.split('-')[1];
              console.log("".concat(rut.split('-')[0], "-").concat(dv.toUpperCase()));
              return "".concat(rut.split('-')[0], "-").concat(dv.toUpperCase()) || rut;
            };

            verifyDv = function verifyDv(rut) {
              if (rut === '') return rut;
              var dv = rut.split('-')[1];
              if (dv === 'k' || dv === 'K') return true;
              return false;
            };

            _context18.prev = 5;
            _context18.next = 8;
            return db.collection('gi').find().toArray();

          case 8:
            result = _context18.sent;
            //sacar solo los que tiene -k
            reduceredGis = result.reduce(function (acc, current) {
              if (verifyDv(current.rut)) {
                acc.push({
                  _id: current._id,
                  rut: current.rut
                });
              }

              return acc;
            }, []); //recorrer cada gi e ir editando su rut si es k

            reduceredGis.forEach( /*#__PURE__*/function () {
              var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(element) {
                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                  while (1) {
                    switch (_context17.prev = _context17.next) {
                      case 0:
                        if (!(element.rut.split('-')[1] === 'k')) {
                          _context17.next = 3;
                          break;
                        }

                        _context17.next = 3;
                        return db.collection('gi').updateOne({
                          _id: (0, _mongodb.ObjectID)(String(element._id))
                        }, {
                          $set: {
                            rut: changeDv(element.rut)
                          }
                        });

                      case 3:
                      case "end":
                        return _context17.stop();
                    }
                  }
                }, _callee17);
              }));

              return function (_x35) {
                return _ref18.apply(this, arguments);
              };
            }());
            return _context18.abrupt("return", res.json({
              msg: 'Ok'
            }));

          case 14:
            _context18.prev = 14;
            _context18.t0 = _context18["catch"](5);
            return _context18.abrupt("return", res.status(500).json({
              msg: String(_context18.t0)
            }));

          case 17:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[5, 14]]);
  }));

  return function (_x33, _x34) {
    return _ref17.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;