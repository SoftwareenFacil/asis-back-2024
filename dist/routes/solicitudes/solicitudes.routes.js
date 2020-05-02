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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

//SELECT
router.get('/', /*#__PURE__*/function () {
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
            return db.collection('solicitudes').find({}).toArray();

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
}()); //SELECT FIELDS TO CONFIRM SOLICITUD

router.get('/mostrar/:id', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, id, resultFinal, resultSol, resultGI;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            id = req.params.id;
            resultFinal = {};
            _context2.next = 7;
            return db.collection('solicitudes').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            resultSol = _context2.sent;
            _context2.next = 10;
            return db.collection('gi').findOne({
              _id: (0, _mongodb.ObjectID)(resultSol.id_GI_Principal)
            });

          case 10:
            resultGI = _context2.sent;
            resultSol.email_gi = resultGI.email_central;
            res.json(resultSol);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //INSERT

router.post('/', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, newSolicitud, items, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            newSolicitud = req.body;
            _context3.next = 6;
            return db.collection('solicitudes').find({}).toArray();

          case 6:
            items = _context3.sent;

            if (items.length > 0) {
              newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-00001");
            }

            _context3.next = 10;
            return db.collection('solicitudes').insertOne(newSolicitud);

          case 10:
            result = _context3.sent;
            res.json(result);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //CONFIRMAR SOLICITUD

router.post('/confirmar/:id', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, solicitud, id, resultSol, resultGI;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            solicitud = req.body;
            id = req.params.id; //obtener mail del cliente principal

            _context4.next = 7;
            return db.collection('solicitudes').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_servicio_solicitado: solicitud.fecha_servicio_solicitado,
                hora_servicio: solicitud.hora_servicio,
                observacion_solicitud: solicitud.observacion_solicitud,
                estado: "Confirmado"
              }
            });

          case 7:
            resultSol = _context4.sent;
            console.log('result sol', resultSol);

            if (!resultSol.result.ok) {
              _context4.next = 15;
              break;
            }

            _context4.next = 12;
            return db.collection('gi').updateOne({
              _id: (0, _mongodb.ObjectID)(solicitud.id_GI_Principal)
            }, {
              $set: {
                email_central: solicitud.email_central
              }
            });

          case 12:
            resultGI = _context4.sent;
            console.log('result gi', resultGI);

            if (resultGI.result.ok) {
              //-------------------------------------FALTA CREAR LA RESERVA-----------------------
              res.json({
                status: {
                  message: "ok"
                }
              });
            }

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //DELETE

router["delete"]('/:id', /*#__PURE__*/function () {
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
            return db.collection('solicitudes').deleteOne({
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
}());
var _default = router;
exports["default"] = _default;