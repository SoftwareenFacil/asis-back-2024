"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _getDateNow = require("../../functions/getDateNow");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _createPdf = _interopRequireDefault(require("../../functions/createPdf/createPdf"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// import { getYear } from "../../functions/getYearActual";
// import { CalculateFechaVenc } from "../../functions/getFechaVenc";
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
}()); //SELECT ONE 

router.post('/selectone/:id', /*#__PURE__*/function () {
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
            return db.collection("evaluaciones").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

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
}());
router.get('/testpdf', function (req, res) {
  try {
    (0, _createPdf["default"])();
    console.log('pdf creado');
    res.json({
      msg: 'pdf creado'
    });
  } catch (error) {
    res.json({
      msg: 'error al crear el pdf'
    });
    console.log('error ', error);
  }
}); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countEva, result;

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
            return db.collection("evaluaciones").find().count();

          case 8:
            countEva = _context3.sent;
            _context3.next = 11;
            return db.collection("evaluaciones").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context3.sent;
            res.json({
              total_items: countEva,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEva / nPerPage + 1),
              evaluaciones: result
            });
            _context3.next = 18;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            res.status(501).json(_context3.t0);

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
}()); //BUSCAR POR NOMBRE O RUT

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countEva;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context4.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context4.sent;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado = filtro;
              rutFiltrado.replace("k", "K");
            } else {
              rutFiltrado = filtro;
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context4.prev = 7;

            if (!(identificador === 1)) {
              _context4.next = 17;
              break;
            }

            _context4.next = 11;
            return db.collection("evaluaciones").find({
              rut_cp: rexExpresionFiltro
            }).count();

          case 11:
            countEva = _context4.sent;
            _context4.next = 14;
            return db.collection("evaluaciones").find({
              rut_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            _context4.next = 23;
            break;

          case 17:
            _context4.next = 19;
            return db.collection("evaluaciones").find({
              razon_social_cp: rexExpresionFiltro
            }).count();

          case 19:
            countEva = _context4.sent;
            _context4.next = 22;
            return db.collection("evaluaciones").find({
              razon_social_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 22:
            result = _context4.sent;

          case 23:
            res.json({
              total_items: countEva,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEva / nPerPage + 1),
              evaluaciones: result
            });
            _context4.next = 29;
            break;

          case 26:
            _context4.prev = 26;
            _context4.t0 = _context4["catch"](7);
            res.status(501).json({
              mgs: "ha ocurrido un error ".concat(_context4.t0)
            });

          case 29:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[7, 26]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //EDIT

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, evaluacion, db, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            evaluacion = JSON.parse(req.body.data);
            _context5.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context5.sent;

            if (req.file) {
              evaluacion.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context5.prev = 6;
            _context5.next = 9;
            return db.collection("evaluaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {}
            });

          case 9:
            result = _context5.sent;
            res.status(201).json({
              message: "Evaluacion modificada correctamente"
            });
            _context5.next = 16;
            break;

          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5["catch"](6);
            res.status(501).json({
              message: "ha ocurrido un error",
              error: _context5.t0
            });

          case 16:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[6, 13]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //PASAR A EN EVALUACION

router.post("/evaluar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, datos, obs, archivo, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
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

            _context6.next = 13;
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
            result = _context6.sent;
            res.json(result);

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //PASAR A EVALUADO

router.post("/evaluado/:id", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, db, datos, estadoEvaluacion, obs, result, codAsis, resultinsert;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
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

            _context7.next = 13;
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
            result = _context7.sent;

            if (!(result.ok == 1 && (datos.estado_archivo == "Aprobado" || datos.estado_archivo == "Aprobado con Obs"))) {
              _context7.next = 21;
              break;
            }

            codAsis = result.value.codigo;
            codAsis = codAsis.replace("EVA", "RES");
            _context7.next = 19;
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
            resultinsert = _context7.sent;
            result = resultinsert;

          case 21:
            res.json(result);

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;