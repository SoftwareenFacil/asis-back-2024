"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _changeToMiniscula = require("../../functions/changeToMiniscula");

var _getDateNow = require("../../functions/getDateNow");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
            return db.collection("reservas").find({}).toArray();

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

router.get("/:id", /*#__PURE__*/function () {
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
            return db.collection("reservas").findOne({
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
}()); //EDITAR RESERVA

router.put("/:id", _multer["default"].single('archivo'), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, datos, db, archivo, obs, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            datos = JSON.parse(req.body.data);
            _context3.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context3.sent;
            archivo = {};
            obs = {};
            obs.obs = datos.observacion;
            obs.fecha = (0, _getDateNow.getDate)(new Date());

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context3.next = 12;
            return db.collection("reservas").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_reserva: datos.fecha_reserva,
                hora_reserva: datos.hora_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva_fin: datos.hora_reserva_fin,
                jornada: datos.jornada,
                mes: datos.mes,
                anio: datos.anio,
                id_GI_personalAsignado: datos.id_GI_profesional_asignado,
                sucursal: datos.sucursal,
                url_file_adjunto: archivo
              },
              $push: {
                observacion: obs
              }
            });

          case 12:
            result = _context3.sent;

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //CONFIRMAR RESERVA

router.post("/confirmar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var id, datos, archivo, db, obs, result, codAsis, reserva, gi, isOC, estado_archivo, estado;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id;
            datos = JSON.parse(req.body.data);
            archivo = {};
            _context4.next = 5;
            return (0, _database.connect)();

          case 5:
            db = _context4.sent;
            obs = {};
            obs.obs = datos.observacion;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            result = null;
            codAsis = "";

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context4.prev = 12;
            _context4.next = 15;
            return db.collection("reservas").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_reserva: datos.fecha_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva: datos.hora_reserva,
                hora_reserva_fin: datos.hora_reserva_fin,
                id_GI_personalAsignado: datos.id_GI_profesional_asignado,
                sucursal: datos.sucursal,
                url_file_adjunto_confirm: archivo,
                estado: "Reservado",
                reqEvaluacion: (0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion)
              },
              $push: {
                observacion: obs
              }
            });

          case 15:
            result = _context4.sent;
            _context4.next = 18;
            return db.collection("reservas").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 18:
            reserva = _context4.sent;

            if (!((0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion) == "si" && result.result.ok == 1)) {
              _context4.next = 26;
              break;
            }

            //insertamos la evaluacion
            codAsis = reserva.codigo;
            codAsis = codAsis.replace("AGE", "EVA");
            _context4.next = 24;
            return db.collection("evaluaciones").insertOne({
              id_GI_personalAsignado: reserva.id_GI_personalAsignado,
              codigo: codAsis,
              valor_servicio: reserva.valor_servicio,
              faena_seleccionada_cp: reserva.faena_seleccionada_cp,
              fecha_evaluacion: reserva.fecha_reserva,
              fecha_evaluacion_fin: reserva.fecha_reserva_fin,
              hora_inicio_evaluacion: reserva.hora_reserva,
              hora_termino_evaluacion: reserva.hora_reserva_fin,
              mes: reserva.mes,
              anio: reserva.anio,
              nombre_servicio: reserva.nombre_servicio,
              rut_cp: reserva.rut_cp,
              razon_social_cp: reserva.razon_social_cp,
              rut_cs: reserva.rut_cs,
              razon_social_cs: reserva.razon_social_cs,
              lugar_servicio: reserva.lugar_servicio,
              sucursal: reserva.sucursal,
              observaciones: [],
              estado_archivo: "Sin Documento",
              estado: "Ingresado"
            });

          case 24:
            _context4.next = 38;
            break;

          case 26:
            _context4.next = 28;
            return db.collection("gi").findOne({
              rut: reserva.rut_cp,
              categoria: "Empresa/Organización"
            });

          case 28:
            gi = _context4.sent;
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
            } //pasa directo a facturaciones


            codAsis = reserva.codigo;
            codAsis = codAsis.replace("AGE", "FAC");
            _context4.next = 37;
            return db.collection("facturaciones").insertOne({
              codigo: codAsis,
              nombre_servicio: reserva.nombre_servicio,
              id_GI_personalAsignado: reserva.id_GI_personalAsignado,
              faena_seleccionada_cp: reserva.faena_seleccionada_cp,
              valor_servicio: reserva.valor_servicio,
              rut_cp: reserva.rut_cp,
              razon_social_cp: reserva.razon_social_cp,
              rut_cs: reserva.rut_cs,
              razon_social_cs: reserva.razon_social_cs,
              lugar_servicio: reserva.lugar_servicio,
              sucursal: reserva.sucursal,
              condicionantes: "",
              vigencia_examen: "",
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

          case 37:
            result = _context4.sent;

          case 38:
            res.json({
              status: 200,
              message: "Reserva Confirmada"
            });
            _context4.next = 44;
            break;

          case 41:
            _context4.prev = 41;
            _context4.t0 = _context4["catch"](12);
            res.json({
              status: 500,
              message: "No se pudo concretar la confirmacion de la reserva",
              error: _context4.t0
            });

          case 44:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[12, 41]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //CONFIRMACION MASIVA DE RESERVAS

router.post("/confirmar", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, datosJson, new_array, archivo, obs, result, resp, codigoAsis, arrayReservas, resultEva, arrayIDsCP, isOC, estado_archivo, estado, GIs, resultFac;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            datosJson = JSON.parse(req.body.data);
            new_array = [];
            archivo = {};
            obs = {};
            obs.obs = datosJson[0].observacion;
            obs.fecha = (0, _getDateNow.getDate)(new Date()); //verificar si hay archivo o no 

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            datosJson[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            }); // Se editan las reservas de forma masiva

            result = db.collection("reservas").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_reserva: datosJson[0].fecha_reserva,
                fecha_reserva_fin: datosJson[0].fecha_reserva_fin,
                hora_reserva: datosJson[0].hora_reserva,
                hora_reserva_fin: datosJson[0].hora_reserva_fin,
                id_GI_personalAsignado: datosJson[0].id_GI_profesional_asignado,
                sucursal: datosJson[0].sucursal,
                url_file_adjunto_confirm: archivo,
                estado: "Reservado",
                reqEvaluacion: (0, _changeToMiniscula.getMinusculas)(datosJson[0].reqEvaluacion)
              },
              $push: {
                observacion: obs
              }
            });
            resp = "";
            codigoAsis = "";
            arrayReservas = []; // Se insertan las evaluaciones o las facturaciones dependiendo del caso

            _context5.next = 17;
            return db.collection("reservas").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 17:
            resp = _context5.sent;

            if (!((0, _changeToMiniscula.getMinusculas)(datosJson[0].reqEvaluacion) === "si" && result)) {
              _context5.next = 26;
              break;
            }

            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("AGE", "EVA");
              arrayReservas.push({
                id_GI_personalAsignado: element.id_GI_personalAsignado,
                codigo: codigoAsis,
                valor_servicio: element.valor_servicio,
                faena_seleccionada_cp: element.faena_seleccionada_cp,
                fecha_evaluacion: element.fecha_reserva,
                fecha_evaluacion_fin: element.fecha_reserva_fin,
                hora_inicio_evaluacion: element.hora_reserva,
                hora_termino_evaluacion: element.hora_reserva_fin,
                mes: element.mes,
                anio: element.anio,
                nombre_servicio: element.nombre_servicio,
                rut_cp: element.rut_cp,
                razon_social_cp: element.razon_social_cp,
                rut_cs: element.rut_cs,
                razon_social_cs: element.razon_social_cs,
                lugar_servicio: element.lugar_servicio,
                sucursal: element.sucursal,
                observaciones: [],
                estado_archivo: "Sin Documento",
                estado: "Ingresado"
              });
            });
            _context5.next = 22;
            return db.collection("evaluaciones").insertMany(arrayReservas);

          case 22:
            resultEva = _context5.sent;
            res.json(resultEva);
            _context5.next = 39;
            break;

          case 26:
            arrayIDsCP = [];
            isOC = "";
            estado_archivo = "";
            estado = "";
            resp.forEach(function (element) {
              arrayIDsCP.push((0, _mongodb.ObjectID)(element.id_GI_Principal));
            });
            _context5.next = 33;
            return db.collection("gi").find({
              _id: {
                $in: arrayIDsCP
              },
              categoria: "Empresa/Organización"
            }).toArray();

          case 33:
            GIs = _context5.sent;
            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("AGE", "FAC"); // gi = GIs.map((gi) => gi._id === element.id_GI_Principal);

              var gi = GIs.find(function (gi) {
                return gi._id.toString() === element.id_GI_Principal;
              });

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

              arrayReservas.push({
                codigo: codigoAsis,
                nombre_servicio: element.nombre_servicio,
                id_GI_personalAsignado: element.id_GI_personalAsignado,
                faena_seleccionada_cp: element.faena_seleccionada_cp,
                valor_servicio: element.valor_servicio,
                rut_cp: element.rut_cp,
                razon_social_cp: element.razon_social_cp,
                rut_cs: element.rut_cs,
                razon_social_cs: element.razon_social_cs,
                lugar_servicio: element.lugar_servicio,
                sucursal: element.sucursal,
                condicionantes: "",
                vigencia_examen: "",
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
            });
            _context5.next = 37;
            return db.collection("facturaciones").insertMany(arrayReservas);

          case 37:
            resultFac = _context5.sent;
            res.json(resultFac);

          case 39:
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