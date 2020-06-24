"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _excelToJson = _interopRequireDefault(require("../../functions/insertManyGis/excelToJson"));

var _verificateTipoCliente = _interopRequireDefault(require("../../functions/insertManyGis/verificateTipoCliente"));

var _getEmpresasGI = _interopRequireDefault(require("../../functions/insertManyGis/getEmpresasGI"));

var _getPersonasGI = _interopRequireDefault(require("../../functions/insertManyGis/getPersonasGI"));

var _eliminateDuplicated = _interopRequireDefault(require("../../functions/insertManyGis/eliminateDuplicated"));

var _verificateGrupoInteres = _interopRequireDefault(require("../../functions/insertManyGis/verificateGrupoInteres"));

var _verificateCatEmpresa = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatEmpresa"));

var _verificateCatPersona = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatPersona"));

var _verificateCatCliente = _interopRequireDefault(require("../../functions/insertManyGis/verificateCatCliente"));

var _verificateCredito = _interopRequireDefault(require("../../functions/insertManyGis/verificateCredito"));

var _verificateFechaInicio = _interopRequireDefault(require("../../functions/insertManyGis/verificateFechaInicio"));

var _verificateDiasCredito = _interopRequireDefault(require("../../functions/insertManyGis/verificateDiasCredito"));

var _verificateOrdenCompra = _interopRequireDefault(require("../../functions/insertManyGis/verificateOrdenCompra"));

var _createJsonGiForInsert = _interopRequireDefault(require("../../functions/insertManyGis/createJsonGiForInsert"));

var _addCodeGI = _interopRequireDefault(require("../../functions/insertManyGis/addCodeGI"));

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
            return db.collection("gi").find().toArray();

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
}()); // SELECT GI PAGINATED

router.post("/pagination", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var _req$body, pageNumber, nPerPage, db, result;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            _context2.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context2.sent;
            _context2.prev = 4;
            _context2.next = 7;
            return db.collection("gi").find().skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0).limit(nPerPage).toArray();

          case 7:
            result = _context2.sent;
            console.log(result);
            res.json(result);
            _context2.next = 15;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](4);
            res.json(_context2.t0);

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[4, 12]]);
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
            _context3.next = 5;
            return db.collection("gi").find({
              categoria: "Empresa/Organizacion"
            }).toArray();

          case 5:
            result = _context3.sent;
            res.json(result);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT BY RUT

router.post("/:rut", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var rut, verificador, db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            rut = req.params.rut;
            verificador = req.body.verificador;
            _context4.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context4.sent;
            result = "";

            if (!(verificador == 1)) {
              _context4.next = 12;
              break;
            }

            _context4.next = 9;
            return db.collection("gi").findOne({
              rut: rut,
              categoria: "Empresa/Organizacion"
            });

          case 9:
            result = _context4.sent;
            _context4.next = 16;
            break;

          case 12:
            if (!(verificador == 2)) {
              _context4.next = 16;
              break;
            }

            _context4.next = 15;
            return db.collection("gi").findOne({
              rut: rut,
              categoria: "Persona Natural"
            });

          case 15:
            result = _context4.sent;

          case 16:
            res.json(result);

          case 17:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //SELECT BY ID

router.get("/:id", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            _context5.next = 6;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context5.sent;
            res.json(result);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //UPDATE

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, updatedGI, db, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            updatedGI = JSON.parse(req.body.data);
            _context6.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context6.sent;
            // let result = await db.collection("gi").findOne({ _id: ObjectID(id) });
            updatedGI.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path
            };
            _context6.prev = 6;
            _context6.next = 9;
            return db.collection("gi").replaceOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, updatedGI);

          case 9:
            result = _context6.sent;
            res.status(201).json({
              message: "GI editado correctamente"
            });
            _context6.next = 17;
            break;

          case 13:
            _context6.prev = 13;
            _context6.t0 = _context6["catch"](6);
            res.status(500).json({
              message: "ha ocurrido un error",
              error: _context6.t0
            });
            console.log(_context6.t0);

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[6, 13]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //TEST PARA recibir EXCEL DE INGRESO DE GIS

router.post("/test/file", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var nombre, db, data, array_general_empresas, array_general_personas, array_general, renegados, empresas, personas, lastGi, arrayGIs, result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            nombre = req.body.nombre;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            data = (0, _excelToJson["default"])(req.file.path);
            array_general_empresas = [];
            array_general_personas = [];
            array_general = [];
            renegados = [];
            _context7.prev = 9;

            if (!(data.length > 0)) {
              _context7.next = 41;
              break;
            }

            array_general = (0, _verificateTipoCliente["default"])(data);
            array_general[1].renegados.forEach(function (element) {
              renegados.push(element);
            });
            array_general_empresas = (0, _getEmpresasGI["default"])(array_general[0].newdata);
            empresas = array_general_empresas[0].newdata;
            array_general_personas = (0, _getPersonasGI["default"])(array_general[0].newdata);
            personas = array_general_personas[0].newdata;
            console.log(array_general_personas[0].newdata);
            empresas = (0, _eliminateDuplicated["default"])(empresas, "Rut");
            personas = (0, _eliminateDuplicated["default"])(personas, "Rut");
            empresas = (0, _verificateGrupoInteres["default"])(empresas);
            personas = (0, _verificateGrupoInteres["default"])(personas);
            empresas = (0, _verificateCatEmpresa["default"])(empresas);
            personas = (0, _verificateCatPersona["default"])(personas);
            empresas = (0, _verificateCatCliente["default"])(empresas);
            personas = (0, _verificateCatCliente["default"])(personas);
            empresas = (0, _verificateCredito["default"])(empresas);
            empresas = (0, _verificateDiasCredito["default"])(empresas);
            empresas = (0, _verificateOrdenCompra["default"])(empresas);
            _context7.next = 31;
            return db.collection("gi").find({}).sort({
              codigo: -1
            }).limit(1).toArray();

          case 31:
            lastGi = _context7.sent;
            console.log(lastGi);
            arrayGIs = (0, _createJsonGiForInsert["default"])(empresas, personas);
            arrayGIs = (0, _addCodeGI["default"])(arrayGIs, lastGi[0], YEAR);
            _context7.next = 37;
            return db.collection("gi").insertMany(arrayGIs);

          case 37:
            result = _context7.sent;
            res.json({
              message: "Ha finalizado la inserción masiva",
              isOK: true,
              renegados: []
            });
            _context7.next = 42;
            break;

          case 41:
            res.json({
              message: "EL archivo ingresado no es un archivo excel válido"
            });

          case 42:
            _context7.next = 47;
            break;

          case 44:
            _context7.prev = 44;
            _context7.t0 = _context7["catch"](9);
            res.json({
              message: "Algo ha salido mal",
              isOK: false,
              error: _context7.t0
            });

          case 47:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[9, 44]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //INSERT

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var db, newGi, items, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context8.sent;
            newGi = JSON.parse(req.body.data);
            _context8.next = 6;
            return db.collection("gi").find({}).toArray();

          case 6:
            items = _context8.sent;

            if (items.length > 0) {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-00001");
            }

            newGi.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path
            };
            _context8.next = 11;
            return db.collection("gi").insertOne(newGi);

          case 11:
            result = _context8.sent;
            res.json(result);

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //DELETE

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            _context9.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context9.sent;
            _context9.next = 6;
            return db.collection("gi").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context9.sent;
            res.json(result);

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //para programar solamente limpiar toda la db

router["delete"]("/", /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context10.sent;
            _context10.next = 5;
            return db.collection("gi").drop();

          case 5:
            result = _context10.sent;
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
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;