"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _fechaVencExamen = require("../../functions/fechaVencExamen");

var _getDateNow = require("../../functions/getDateNow");

var _getEspecificDate = require("../../functions/getEspecificDate");

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
            return db.collection("resultados").find({}).toArray();

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

router.get('/:id', /*#__PURE__*/function () {
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
            return db.collection('resultados').findOne({
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
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countRes, result;

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
            return db.collection("resultados").find().count();

          case 8:
            countRes = _context3.sent;
            _context3.next = 11;
            return db.collection("resultados").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context3.sent;
            res.json({
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              resultados: result
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
}()); //BUSCAR POR RUT O NOMBRE

router.post('/buscar', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countRes;

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
            return db.collection("resultados").find({
              rut_cp: rexExpresionFiltro
            }).count();

          case 11:
            countRes = _context4.sent;
            _context4.next = 14;
            return db.collection("resultados").find({
              rut_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            _context4.next = 23;
            break;

          case 17:
            _context4.next = 19;
            return db.collection("resultados").find({
              razon_social_cp: rexExpresionFiltro
            }).count();

          case 19:
            countRes = _context4.sent;
            _context4.next = 22;
            return db.collection("resultados").find({
              razon_social_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 22:
            result = _context4.sent;

          case 23:
            res.json({
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              resultados: result
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
}()); //SUBIR ARCHIVO RESUILTADO

router.post("/subir/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, datos, archivo, obs, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            datos = JSON.parse(req.body.data);
            archivo = {};
            obs = {};
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

            _context5.next = 13;
            return db.collection("resultados").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado_archivo: "Cargado",
                url_file_adjunto_res: archivo
              },
              $push: {
                observaciones: obs
              }
            });

          case 13:
            result = _context5.sent;
            res.json(result);

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //confirmar resultado

router.post("/confirmar/:id", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, datos, result, obs, codAsis, gi, isOC, estado_archivo, estado;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            datos = req.body;
            result = "";
            obs = {};
            obs.obs = datos.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());

            if (!(datos.estado_archivo == "Aprobado")) {
              _context6.next = 34;
              break;
            }

            obs.estado = datos.estado_archivo;

            if (!(datos.estado_resultado == "Aprobado con Obs" || datos.estado_resultado == "Aprobado")) {
              _context6.next = 17;
              break;
            }

            _context6.next = 14;
            return db.collection("resultados").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Revisado",
                estado_archivo: datos.estado_archivo,
                estado_resultado: datos.estado_resultado,
                vigencia_examen: datos.vigencia_examen,
                fecha_resultado: datos.fecha_resultado,
                hora_resultado: datos.hora_resultado,
                condicionantes: datos.condicionantes,
                fecha_vencimiento_examen: (0, _getEspecificDate.getDateEspecific)((0, _fechaVencExamen.getFechaVencExam)(datos.fecha_resultado, datos.vigencia_examen)).substr(0, 10)
              },
              $push: {
                observaciones: obs
              }
            });

          case 14:
            result = _context6.sent;
            _context6.next = 20;
            break;

          case 17:
            _context6.next = 19;
            return db.collection("resultados").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Revisado",
                estado_archivo: datos.estado_archivo,
                estado_resultado: datos.estado_resultado,
                fecha_resultado: datos.fecha_resultado,
                hora_resultado: datos.hora_resultado
              },
              $push: {
                observaciones: obs
              }
            });

          case 19:
            result = _context6.sent;

          case 20:
            //insercion de la facturación
            codAsis = result.value.codigo;
            _context6.next = 23;
            return db.collection("gi").findOne({
              rut: result.value.rut_cp,
              categoria: "Empresa/Organizacion"
            });

          case 23:
            gi = _context6.sent;
            isOC = "";
            estado_archivo = "";
            estado = "";

            if (gi) {
              isOC = gi.orden_compra;

              if (isOC == "Si") {
                estado_archivo = "Sin Documento", estado = "Ingresado";
              } else {
                estado = "En Facturacion", estado_archivo = "Sin Documento";
              }
            } else {
              isOC = "No";
              estado = "En Facturacion", estado_archivo = "Sin Documento";
            }

            if (!result) {
              _context6.next = 32;
              break;
            }

            _context6.next = 31;
            return db.collection("facturaciones").insertOne({
              codigo: codAsis.replace("RES", "FAC"),
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
              condicionantes: result.value.condicionantes,
              vigencia_examen: result.value.vigencia_examen,
              oc: isOC,
              archivo_oc: null,
              fecha_oc: "",
              hora_oc: "",
              nro_oc: "",
              observacion_oc: [],
              observacion_factura: [],
              estado: estado,
              estado_archivo: estado_archivo,
              fecha_facturacion: "",
              nro_factura: "",
              archivo_factura: null,
              monto_neto: 0,
              porcentaje_impuesto: "",
              valor_impuesto: 0,
              sub_total: 0,
              exento: 0,
              descuento: 0,
              total: 0
            });

          case 31:
            result = _context6.sent;

          case 32:
            _context6.next = 38;
            break;

          case 34:
            obs.estado = datos.estado_archivo;
            _context6.next = 37;
            return db.collection("resultados").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado_archivo: datos.estado_archivo
              },
              $push: {
                observaciones: obs
              }
            });

          case 37:
            result = _context6.sent;

          case 38:
            res.json(result);

          case 39:
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