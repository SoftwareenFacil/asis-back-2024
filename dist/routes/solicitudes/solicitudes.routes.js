"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _getDateNow = require("../../functions/getDateNow");

var _excelToJson = _interopRequireDefault(require("../../functions/insertManyGis/excelToJson"));

var _sendinblue = _interopRequireDefault(require("../../libs/sendinblue/sendinblue"));

var _isRol = require("../../functions/isRol");

var _createJsonSolForInsert = _interopRequireDefault(require("../../functions/insertManySolicitudes/createJsonSolForInsert"));

var _addCodeSolicitud = _interopRequireDefault(require("../../functions/insertManySolicitudes/addCodeSolicitud"));

var _moment = _interopRequireDefault(require("moment"));

var _jwt = require("../../libs/jwt");

var _text_messages = require("../../constant/text_messages");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

var _var = require("../../constant/var");

var _requestInsertMassive = require("../../functions/requestInsertMassive");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_moment["default"].locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
  weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
});

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

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
            _context.prev = 3;
            _context.next = 6;
            return db.collection("solicitudes").find({
              isActive: true
            }).toArray();

          case 6:
            result = _context.sent;
            return _context.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Solicitudes obtenidas',
              res: result
            }));

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", res.status(500).json({
              err: String(_context.t0),
              msg: _text_messages.ERROR,
              res: null
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
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countSol, result;

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
            return db.collection("solicitudes").find({
              isActive: true
            }).count();

          case 8:
            countSol = _context2.sent;
            _context2.next = 11;
            return db.collection("solicitudes").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).sort({
              codigo: -1
            }).toArray();

          case 11:
            result = _context2.sent;
            return _context2.abrupt("return", res.status(200).json({
              // auth: AUTHORIZED,
              total_items: countSol,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSol / nPerPage + 1),
              solicitudes: result
            }));

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](5);
            console.log(_context2.t0);
            return _context2.abrupt("return", res.status(500).json({
              // auth: AUTHORIZED,
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              solicitudes: null,
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
}()); //BUSCAR POR RUT O NOMBRE

router.post("/buscar", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, rutFiltrado, rexExpresionFiltro, result, countSol, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            console.log([identificador, filtro, headFilter, pageNumber, nPerPage]); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            ;
            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context3.prev = 10;
            _context3.next = 13;
            return db.collection("solicitudes").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 13:
            countSol = _context3.sent;
            _context3.next = 16;
            return db.collection("solicitudes").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 16:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              total_items: countSol,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSol / nPerPage + 1),
              solicitudes: result
            }));

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](10);
            return _context3.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              solicitudes: null,
              err: String(_context3.t0)
            }));

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[10, 20]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT REQUESTS TO CONFIRM

router.get('/ingresadas', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            _context4.next = 6;
            return db.collection('solicitudes').find({
              estado: 'Ingresado'
            }).toArray();

          case 6:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Solicitudes encontradas',
              res: result
            }));

          case 10:
            _context4.prev = 10;
            _context4.t0 = _context4["catch"](0);
            console.log(_context4.t0);
            return _context4.abrupt("return", res.status(500).json({
              err: String(_context4.t0),
              msg: 'No se ha podido cargar las solicitudes',
              res: null
            }));

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 10]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //SELECT FIELDS TO CONFIRM SOLICITUD

router.get("/mostrar/:id", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, id, resultSol, resultGI;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            id = req.params.id; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context5.prev = 4;
            _context5.next = 7;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            resultSol = _context5.sent;
            _context5.next = 10;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(resultSol.id_GI_Principal)
            });

          case 10:
            resultGI = _context5.sent;
            resultSol.email_gi = resultGI.email_central !== null ? resultGI.email_central : '';
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              msg: '',
              res: resultSol
            }));

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](4);
            return _context5.abrupt("return", res.status(500).json({
              err: String(_context5.t0),
              msg: '',
              res: null
            }));

          case 18:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[4, 15]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //SELECT BY ID

router.get("/:id", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, result, observacion_solicitud, restOfData;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            console.log(id);
            _context6.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context6.sent;
            _context6.prev = 5;
            _context6.next = 8;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 8:
            result = _context6.sent;
            observacion_solicitud = result.observacion_solicitud, restOfData = _objectWithoutProperties(result, ["observacion_solicitud"]);
            console.log(observacion_solicitud[0].obs);
            return _context6.abrupt("return", res.status(200).json({
              err: null,
              msg: '',
              res: _objectSpread({}, restOfData, {
                observacion_solicitud: observacion_solicitud[0].obs
              })
            }));

          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](5);
            console.log(_context6.t0);
            return _context6.abrupt("return", res.status(500).json({
              err: String(_context6.t0),
              msg: '',
              res: null
            }));

          case 18:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[5, 14]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //INSERT

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var db, newSolicitud, nuevaObs, token, items, result, gi;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context7.sent;
            newSolicitud = JSON.parse(req.body.data);
            nuevaObs = newSolicitud.observacion_solicitud;
            token = req.headers['x-access-token']; // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context7.next = 8;
            return db.collection("solicitudes").find().toArray();

          case 8:
            items = _context7.sent;

            if (items) {
              _context7.next = 11;
              break;
            }

            return _context7.abrupt("return", res.status(401).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 11:
            items.length > 0 ? newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1])) : newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-00001");
            newSolicitud.observacion_solicitud = [];
            newSolicitud.observacion_solicitud.push({
              obs: nuevaObs,
              fecha: (0, _getDateNow.getDate)(new Date())
            });
            req.file ? newSolicitud.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path,
              type: req.file.mimetype
            } : newSolicitud.url_file_adjunto = {}; // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            _context7.prev = 15;
            newSolicitud.isActive = true;
            _context7.next = 19;
            return db.collection("solicitudes").insertOne(newSolicitud);

          case 19:
            result = _context7.sent;

            if (!(result.result.ok === 1)) {
              _context7.next = 24;
              break;
            }

            _context7.next = 23;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(result.ops[0].id_GI_Principal)
            });

          case 23:
            gi = _context7.sent;

          case 24:
            ;
            return _context7.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.SUCCESSFULL_INSERT,
              res: result
            }));

          case 28:
            _context7.prev = 28;
            _context7.t0 = _context7["catch"](15);
            return _context7.abrupt("return", res.status(500).json({
              err: String(_context7.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 31:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[15, 28]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //TEST PARA RECIBIR EXCEL DE INGRESO MASIVO DE SOLICITUDES

router.post("/masivo", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var data, db, companies, naturalPersons, _mapRequestsToInsert, requestsMapped, notInserted, lastRequest, requestsWithCode;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            data = (0, _excelToJson["default"])(req.file.path, "PLANTILLA SOL_ASIS");
            _context8.prev = 1;

            if (!(!data || data.length === 0)) {
              _context8.next = 4;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'No existe datos en el excel ingresado',
              res: null
            }));

          case 4:
            _context8.next = 6;
            return (0, _database.connect)();

          case 6:
            db = _context8.sent;
            _context8.next = 9;
            return db.collection('gi').find({
              activo_inactivo: true,
              categoria: 'Empresa/Organizacion'
            }).toArray();

          case 9:
            companies = _context8.sent;
            _context8.next = 12;
            return db.collection('gi').find({
              activo_inactivo: true,
              categoria: 'Persona Natural'
            }).toArray();

          case 12:
            naturalPersons = _context8.sent;
            console.log(companies.length);
            console.log(naturalPersons.length);
            _mapRequestsToInsert = (0, _requestInsertMassive.mapRequestsToInsert)(data, companies, naturalPersons), requestsMapped = _mapRequestsToInsert.requestsMapped, notInserted = _mapRequestsToInsert.notInserted;

            if (!(requestsMapped.length == 0)) {
              _context8.next = 18;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Ninguna solicitud cumple con los requisitos',
              res: notInserted
            }));

          case 18:
            _context8.next = 20;
            return db.collection("gi").find({}).sort({
              codigo: -1
            }).limit(1).toArray();

          case 20:
            lastRequest = _context8.sent;
            requestsWithCode = (0, _requestInsertMassive.addCodeRequest)(requestsMapped, lastRequest[0], (0, _moment["default"])().format('YYYY'));
            _context8.next = 24;
            return db.collection('solicitudes').insertMany(requestsWithCode);

          case 24:
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Solicitudes ingresadas correctamente',
              res: {
                cant_inserted: requestsWithCode.length,
                cant_notInserted: notInserted.length,
                notInserted: notInserted
              }
            }));

          case 27:
            _context8.prev = 27;
            _context8.t0 = _context8["catch"](1);
            console.log(_context8.t0);
            return _context8.abrupt("return", res.status(500).json({
              err: String(_context8.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 31:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[1, 27]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //EDITAR SOLICITUD

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var db, solicitud, id, existsRequest, observacion_solicitud, restOfSolcitud;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context9.sent;
            solicitud = JSON.parse(req.body.data);
            id = req.params.id; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            if (req.file) solicitud.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path,
              type: req.file.mimetype
            };
            _context9.prev = 6;
            _context9.next = 9;
            return db.collection('solicitudes').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 9:
            existsRequest = _context9.sent;

            if (existsRequest) {
              _context9.next = 12;
              break;
            }

            return _context9.abrupt("return", res.status(400).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: []
            }));

          case 12:
            ;
            observacion_solicitud = solicitud.observacion_solicitud, restOfSolcitud = _objectWithoutProperties(solicitud, ["observacion_solicitud"]);
            _context9.next = 16;
            return db.collection("solicitudes").updateOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            }, {
              $set: _objectSpread({}, existsRequest, {}, restOfSolcitud, {
                observacion_solicitud: [].concat(_toConsumableArray(existsRequest.observacion_solicitud), [{
                  obs: observacion_solicitud,
                  fecha: (0, _getDateNow.getDate)(new Date())
                }])
              }) // $push: {
              //   observacion_solicitud: {
              // obs: observacion_solicitud,
              // fecha: getDate(new Date()),
              //   },
              // },

            });

          case 16:
            return _context9.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.SUCCESSFULL_UPDATE,
              res: []
            }));

          case 19:
            _context9.prev = 19;
            _context9.t0 = _context9["catch"](6);
            console.log(_context9.t0);
            return _context9.abrupt("return", res.status(500).json({
              err: String(_context9.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 23:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[6, 19]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //CONFIRMAR SOLICITUD

router.post("/confirmar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var db, solicitud, id, archivo, obs, resultSol, resultGI, resp, codigoAsis, newReserva, resulReserva;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context10.sent;
            solicitud = JSON.parse(req.body.data);
            id = req.params.id;
            archivo = {}; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            obs = {
              obs: solicitud.observacion_solicitud,
              fecha: (0, _getDateNow.getDate)(new Date())
            }; //verificar si hay archivo o no
            // if (req.file) archivo = {
            //   name: req.file.originalname,
            //   size: req.file.size,
            //   path: req.file.path,
            //   type: req.file.mimetype,
            // };

            _context10.prev = 7;
            _context10.next = 10;
            return db.collection("solicitudes").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_confirmacion: solicitud.fecha_solicitud,
                hora_confirmacion: solicitud.hora_solicitud,
                medio_confirmacion: solicitud.medio_confirmacion,
                url_file_adjunto_confirm: {},
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            });

          case 10:
            resultSol = _context10.sent;

            if (!resultSol.result.ok) {
              _context10.next = 26;
              break;
            }

            _context10.next = 14;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(solicitud.id_GI_Principal)
            }, {
              $set: {
                email_central: solicitud.email_central
              }
            });

          case 14:
            resultGI = _context10.sent;

            if (!resultGI.result.ok) {
              _context10.next = 26;
              break;
            }

            _context10.next = 18;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 18:
            resp = _context10.sent;
            codigoAsis = resp.codigo;
            codigoAsis = codigoAsis.replace("SOL", "AGE");
            newReserva = {
              codigo: codigoAsis,
              id_GI_Principal: resp.id_GI_Principal,
              id_GI_Secundario: resp.id_GI_Secundario,
              id_GI_personalAsignado: resp.id_GI_PersonalAsignado,
              faena_seleccionada_cp: resp.faena_seleccionada_cp,
              valor_servicio: resp.monto_total,
              rut_cp: resp.rut_CP,
              razon_social_cp: resp.razon_social_CP,
              rut_cs: resp.rut_cs,
              razon_social_cs: resp.razon_social_cs,
              fecha_reserva: resp.fecha_servicio_solicitado,
              hora_reserva: resp.hora_servicio_solicitado,
              fecha_reserva_fin: resp.fecha_servicio_solicitado_termino,
              hora_reserva_fin: resp.hora_servicio_solicitado_termino,
              jornada: resp.jornada,
              mes: resp.mes_solicitud,
              anio: resp.anio_solicitud,
              nombre_servicio: resp.nombre_servicio,
              lugar_servicio: resp.lugar_servicio,
              sucursal: resp.sucursal,
              url_file_adjunto: archivo,
              observacion: [],
              estado: "Ingresado",
              isActive: true
            };
            _context10.next = 24;
            return db.collection("reservas").insertOne(newReserva);

          case 24:
            resulReserva = _context10.sent;
            return _context10.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Solicitud confirmada',
              res: resulReserva
            }));

          case 26:
            _context10.next = 31;
            break;

          case 28:
            _context10.prev = 28;
            _context10.t0 = _context10["catch"](7);
            return _context10.abrupt("return", res.status(500).json({
              err: String(_context10.t0),
              msg: '',
              res: null
            }));

          case 31:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[7, 28]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //CONFIRM MANY

router.post("/many", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var db, dataJson, new_array, obs, resp, codigoAsis, arrayReservas, resultReserva;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context11.sent;
            dataJson = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            new_array = [];
            obs = {
              obs: dataJson[0].observacion_solicitud,
              fecha: (0, _getDateNow.getDate)(new Date())
            }; // let obs = {};
            // obs.obs = dataJson[0].observacion_solicitud;
            // obs.fecha = getDate(new Date());

            dataJson[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            }); //verificar si hay archivo o no
            // if (req.file) {
            //   archivo = {
            //     name: req.file.originalname,
            //     size: req.file.size,
            //     path: req.file.path,
            //     type: req.file.mimetype,
            //   };
            // }
            // else {
            //   archivo = {};
            // }

            _context11.prev = 7;
            db.collection("solicitudes").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_confirmacion: dataJson[0].fecha_solicitud,
                hora_confirmacion: dataJson[0].hora_solicitud,
                medio_confirmacion: dataJson[0].medio_confirmacion,
                url_file_adjunto_confirm: {},
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            }); // se crea el array de objetos para la insercion de reservas

            resp = "";
            codigoAsis = "";
            arrayReservas = [];
            _context11.next = 14;
            return db.collection("solicitudes").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 14:
            resp = _context11.sent;
            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("SOL", "AGE");
              arrayReservas.push({
                codigo: codigoAsis,
                id_GI_Principal: element.id_GI_Principal,
                id_GI_Secundario: element.id_GI_Secundario,
                id_GI_personalAsignado: element.id_GI_PersonalAsignado,
                faena_seleccionada_cp: element.faena_seleccionada_cp,
                valor_servicio: element.monto_total,
                rut_cp: element.rut_CP,
                razon_social_cp: element.razon_social_CP,
                rut_cs: element.rut_cs,
                razon_social_cs: element.razon_social_cs,
                fecha_reserva: element.fecha_servicio_solicitado,
                hora_reserva: element.hora_servicio_solicitado,
                fecha_reserva_fin: element.fecha_servicio_solicitado_termino,
                hora_reserva_fin: element.hora_servicio_solicitado_termino,
                jornada: element.jornada,
                mes: element.mes_solicitud,
                anio: element.anio_solicitud,
                nombre_servicio: element.nombre_servicio,
                lugar_servicio: element.lugar_servicio,
                sucursal: element.sucursal,
                observacion: [],
                estado: "Ingresado",
                isActive: true
              });
            });
            _context11.next = 18;
            return db.collection("reservas").insertMany(arrayReservas);

          case 18:
            resultReserva = _context11.sent;
            return _context11.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Solicitudes confirmadas exitosamente',
              res: resultReserva
            }));

          case 22:
            _context11.prev = 22;
            _context11.t0 = _context11["catch"](7);
            console.log(_context11.t0);
            return _context11.abrupt("return", res.status(500).json({
              err: String(_context11.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 26:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[7, 22]]);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}()); //DELETE / ANULAR

router["delete"]('/:id', /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var id, db;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            id = req.params.id;
            _context12.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context12.sent;
            _context12.prev = 4;
            _context12.next = 7;
            return db.collection('solicitudes').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                isActive: false
              }
            });

          case 7:
            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.DELETE_SUCCESSFULL,
              res: null
            }));

          case 10:
            _context12.prev = 10;
            _context12.t0 = _context12["catch"](4);
            console.log(_context12.t0);
            return _context12.abrupt("return", res.status(500).json({
              err: String(_context12.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 14:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[4, 10]]);
  }));

  return function (_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}());
router["delete"]('/deletemany/many', /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(req, res) {
    var db, ids, contador, i;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context13.sent;
            _context13.prev = 3;
            ids = [];
            contador = 6210;

            for (i = 0; i < 533; i++) {
              ids.push("ASIS-SOL-2021-0".concat(contador));
              contador++;
            }

            ;
            _context13.next = 10;
            return db.collection('solicitudes').deleteMany({
              codigo: {
                $in: ids
              }
            });

          case 10:
            return _context13.abrupt("return", res.status(200).json({
              msg: 'solicitudes eliminadas'
            }));

          case 13:
            _context13.prev = 13;
            _context13.t0 = _context13["catch"](3);
            console.log(_context13.t0);
            return _context13.abrupt("return", res.status(500).json({
              msg: 'error',
              err: String(_context13.t0)
            }));

          case 17:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[3, 13]]);
  }));

  return function (_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;