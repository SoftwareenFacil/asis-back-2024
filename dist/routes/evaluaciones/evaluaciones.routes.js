"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _getFechaVenc = require("../../functions/getFechaVenc");

var _getDateNow = require("../../functions/getDateNow");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
            return db.collection("evaluaciones").find({}).toArray();

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
}()); //PASAR A EN EVALUACION

router.post("/evaluar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var id, db, datos, obs, archivo, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            id = req.params.id;
            _context2.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context2.sent;
            datos = JSON.parse(req.body.data);
            obs = {};
            archivo = {};
            obs.obs = datos.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context2.next = 13;
            return db.collection("evaluaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "En Evaluacion",
                estado_archivo: "Cargado",
                archivo_examen: datos.archivo_examen,
                fecha_carga_examen: datos.fecha_carga_examen,
                hora_carga_examen: datos.hora_carga_examen,
                url_file_adjunto_EE: archivo
              },
              $push: {
                observaciones: obs
              }
            });

          case 13:
            result = _context2.sent;
            res.json(result);

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //PASAR A EVALUADO

router.post("/evaluado/:id", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, db, datos, estadoEvaluacion, obs, result, codAsis, resultinsert;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            _context3.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context3.sent;
            datos = req.body;
            estadoEvaluacion = "";
            obs = {};
            obs.obs = datos.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = datos.estado_archivo;

            if (datos.estado_archivo == "Aprobado" || datos.estado_archivo == "Aprobado con Obs") {
              estadoEvaluacion = "Evaluado";
            } else {
              estadoEvaluacion = "Ingresado";
            }

            _context3.next = 13;
            return db.collection("evaluaciones").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estadoEvaluacion,
                estado_archivo: datos.estado_archivo,
                fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
                hora_confirmacion_examen: datos.hora_confirmacion_examen
              },
              $push: {
                observaciones: obs
              }
            }, {
              sort: {
                codigo: 1
              },
              returnNewDocument: true
            });

          case 13:
            result = _context3.sent;

            if (!(result.ok == 1 && (datos.estado_archivo == "Aprobado" || datos.estado_archivo == "Aprobado con Obs"))) {
              _context3.next = 21;
              break;
            }

            codAsis = result.value.codigo;
            codAsis = codAsis.replace("EVA", "RES");
            _context3.next = 19;
            return db.collection("resultados").insertOne({
              codigo: codAsis,
              nombre_servicio: result.value.nombre_servicio,
              id_GI_personalAsignado: result.value.id_GI_personalAsignado,
              faena_seleccionada_cp: result.value.faena_seleccionada_cp,
              valor_servicio: result.value.valor_servicio,
              rut_cp: result.value.rut_cp,
              razon_social_cp: result.value.razon_social_cp,
              rut_cs: result.value.rut_cs,
              razon_social_cs: result.value.razon_social_cs,
              lugar_servicio: result.value.lugar_servicio,
              sucursal: result.value.sucursal,
              condicionantes: [],
              vigencia_examen: "",
              observaciones: [],
              fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
              hora_confirmacion_examen: datos.hora_confirmacion_examen,
              estado: "En Revisión",
              estado_archivo: "Sin Documento",
              estado_resultado: ""
            });

          case 19:
            resultinsert = _context3.sent;
            result = resultinsert;

          case 21:
            res.json(result);

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;