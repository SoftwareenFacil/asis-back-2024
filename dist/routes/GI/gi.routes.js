"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _excelToJson = _interopRequireDefault(require("../../functions/insertManyGis/excelToJson"));

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
            return db.collection("gi").find({}).toArray();

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
}()); //SELECT BY RUT

router.post("/:rut", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var rut, verificador, db, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            rut = req.params.rut;
            verificador = req.body.verificador;
            _context2.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context2.sent;
            result = "";

            if (!(verificador == 1)) {
              _context2.next = 12;
              break;
            }

            _context2.next = 9;
            return db.collection("gi").findOne({
              rut: rut,
              categoria: "Empresa/Organización"
            });

          case 9:
            result = _context2.sent;
            _context2.next = 16;
            break;

          case 12:
            if (!(verificador == 2)) {
              _context2.next = 16;
              break;
            }

            _context2.next = 15;
            return db.collection("gi").findOne({
              rut: rut,
              categoria: "Persona Natural"
            });

          case 15:
            result = _context2.sent;

          case 16:
            res.json(result);

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //TEST PARA GONZALO PASA SUBIR ARCHIVO

router.post("/test/gonzalo", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var data;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            data = req.file;
            res.json(data);

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //TEST PARA RECIBIR FILES

router.post("/test/file", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var nombre, db, data, empresas, personas, lastGi, arrayGIs, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            nombre = req.body.nombre;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            data = (0, _excelToJson["default"])(req.file.path);
            _context4.prev = 5;

            if (!(data.length > 0)) {
              _context4.next = 36;
              break;
            }

            _context4.next = 9;
            return (0, _getEmpresasGI["default"])(data);

          case 9:
            empresas = _context4.sent;
            _context4.next = 12;
            return (0, _getPersonasGI["default"])(data);

          case 12:
            personas = _context4.sent;
            empresas = (0, _eliminateDuplicated["default"])(empresas, "Rut");
            personas = (0, _eliminateDuplicated["default"])(personas, "Rut");
            empresas = (0, _verificateGrupoInteres["default"])(empresas);
            personas = (0, _verificateGrupoInteres["default"])(personas);
            empresas = (0, _verificateCatEmpresa["default"])(empresas);
            personas = (0, _verificateCatPersona["default"])(personas);
            empresas = (0, _verificateCatCliente["default"])(empresas);
            personas = (0, _verificateCatCliente["default"])(personas);
            empresas = (0, _verificateCredito["default"])(empresas); // personas = verificateCredito(personas)

            empresas = (0, _verificateDiasCredito["default"])(empresas); // personas = verificateDiasCredito(personas)
            // empresas = verificateFechaInicio(empresas)
            // personas = verificateFechaInicio(personas)

            empresas = (0, _verificateOrdenCompra["default"])(empresas);
            console.log(empresas.length + "/" + personas.length);
            _context4.next = 27;
            return db.collection("gi").find({}).sort({
              "codigo": -1
            }).limit(1).toArray();

          case 27:
            lastGi = _context4.sent;
            arrayGIs = (0, _createJsonGiForInsert["default"])(empresas, personas);
            arrayGIs = (0, _addCodeGI["default"])(arrayGIs, lastGi[0], YEAR);
            _context4.next = 32;
            return db.collection("gi").insertMany(arrayGIs);

          case 32:
            result = _context4.sent;
            res.json({
              message: "Ha finalizado la inserción masiva",
              isOK: true,
              renegados: []
            });
            _context4.next = 37;
            break;

          case 36:
            res.json({
              message: "EL archivo ingresado no es un archivo excel válido"
            });

          case 37:
            _context4.next = 42;
            break;

          case 39:
            _context4.prev = 39;
            _context4.t0 = _context4["catch"](5);
            res.json({
              message: "Algo ha salido mal",
              isOK: false,
              error: _context4.t0
            });

          case 42:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[5, 39]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //INSERT

router.post("/", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, newGi, items, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            newGi = req.body;
            _context5.next = 6;
            return db.collection("gi").find({}).toArray();

          case 6:
            items = _context5.sent;

            if (items.length > 0) {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGi.codigo = "ASIS-GI-".concat(YEAR, "-00001");
            }

            _context5.next = 10;
            return db.collection("gi").insertOne(newGi);

          case 10:
            result = _context5.sent;
            res.json(result);

          case 12:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //DELETE

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            _context6.next = 6;
            return db.collection("gi").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context6.sent;
            res.json(result);

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;