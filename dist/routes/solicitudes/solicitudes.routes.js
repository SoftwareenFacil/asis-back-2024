"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _getDateNow = require("../../functions/getDateNow");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var addDays = require("add-days");

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
            _context.next = 5;
            return db.collection("solicitudes").find({}).toArray();

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

router.get("/mostrar/:id", /*#__PURE__*/function () {
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
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            resultSol = _context2.sent;
            _context2.next = 10;
            return db.collection("gi").findOne({
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

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, newSolicitud, nuevaObs, items, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            newSolicitud = JSON.parse(req.body.data);
            nuevaObs = newSolicitud.observacion_solicitud;
            _context3.next = 7;
            return db.collection("solicitudes").find({}).toArray();

          case 7:
            items = _context3.sent;

            if (items.length > 0) {
              newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newSolicitud.codigo = "ASIS-SOL-".concat(YEAR, "-00001");
            }

            newSolicitud.observacion_solicitud = [];
            newSolicitud.observacion_solicitud.push({
              obs: nuevaObs,
              fecha: (0, _getDateNow.getDate)(new Date())
            });
            newSolicitud.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path
            };
            _context3.next = 14;
            return db.collection("solicitudes").insertOne(newSolicitud);

          case 14:
            result = _context3.sent;
            res.json(result);

          case 16:
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

router.post("/confirmar/:id", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, solicitud, id, obs, resultSol, resultGI, resp, codigoAsis, newReserva, resulReserva;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            solicitud = req.body;
            id = req.params.id;
            obs = {};
            obs.obs = solicitud.observacion_solicitud;
            obs.fecha = (0, _getDateNow.getDate)(new Date()); //obtener mail del cliente principal

            _context4.next = 10;
            return db.collection("solicitudes").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_confirmacion: solicitud.fecha_solicitud,
                hora_confirmacion: solicitud.hora_solicitud,
                medio_confirmacion: solicitud.medio_confirmacion,
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            });

          case 10:
            resultSol = _context4.sent;

            if (!resultSol.result.ok) {
              _context4.next = 26;
              break;
            }

            _context4.next = 14;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(solicitud.id_GI_Principal)
            }, {
              $set: {
                email_central: solicitud.email_central
              }
            });

          case 14:
            resultGI = _context4.sent;

            if (!resultGI.result.ok) {
              _context4.next = 26;
              break;
            }

            _context4.next = 18;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 18:
            resp = _context4.sent;
            codigoAsis = resp.codigo;
            codigoAsis = codigoAsis.replace("SOL", "AGE");
            newReserva = {
              codigo: codigoAsis,
              id_GI_Principal: resp.id_GI_Principal,
              id_GI_Secundario: resp.id_GI_Secundario,
              id_GI_personalAsignado: resp.id_GI_PersonalAsignado,
              faena_seleccionada_cp: resp.faena_seleccionada_cp,
              valor_servicio: resp.precio,
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
              observacion: [],
              estado: "Ingresado"
            };
            _context4.next = 24;
            return db.collection("reservas").insertOne(newReserva);

          case 24:
            resulReserva = _context4.sent;
            res.json(resulReserva);

          case 26:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //CONFIRM MANY

router.post("/many", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, new_array, obs, result, resp, codigoAsis, arrayReservas, resultReserva;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            new_array = [];
            obs = {};
            obs.obs = req.body[0].observacion_solicitud;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            req.body[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            result = db.collection("solicitudes").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_confirmacion: req.body[0].fecha_solicitud,
                hora_confirmacion: req.body[0].hora_solicitud,
                medio_confirmacion: req.body[0].medio_confirmacion,
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            }); // se crea el array de objetos para la insercion de reservas

            resp = "";
            codigoAsis = "";
            arrayReservas = [];
            _context5.next = 14;
            return db.collection("solicitudes").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 14:
            resp = _context5.sent;
            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("SOL", "AGE");
              arrayReservas.push({
                codigo: codigoAsis,
                id_GI_Principal: element.id_GI_Principal,
                id_GI_Secundario: element.id_GI_Secundario,
                id_GI_personalAsignado: element.id_GI_PersonalAsignado,
                faena_seleccionada_cp: element.faena_seleccionada_cp,
                valor_servicio: element.precio,
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
                estado: "Ingresado"
              });
            });
            _context5.next = 18;
            return db.collection("reservas").insertMany(arrayReservas);

          case 18:
            resultReserva = _context5.sent;
            res.json(resultReserva);

          case 20:
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
            return db.collection("solicitudes").deleteOne({
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