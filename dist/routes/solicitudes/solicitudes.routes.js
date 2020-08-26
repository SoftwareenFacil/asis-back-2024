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
            return db.collection("solicitudes").find().toArray();

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
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context2.prev = 5;
            _context2.next = 8;
            return db.collection("solicitudes").find().count();

          case 8:
            countSol = _context2.sent;
            _context2.next = 11;
            return db.collection("solicitudes").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context2.sent;
            res.json({
              total_items: countSol,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSol / nPerPage + 1),
              solicitudes: result
            });
            _context2.next = 18;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](5);
            res.status(501).json(_context2.t0);

          case 18:
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
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countSol;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context3.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context3.sent;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado = filtro;
              rutFiltrado.replace("k", "K");
            } else {
              rutFiltrado = filtro;
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context3.prev = 7;

            if (!(identificador === 1)) {
              _context3.next = 17;
              break;
            }

            _context3.next = 11;
            return db.collection("solicitudes").find({
              rut_CP: rexExpresionFiltro
            }).count();

          case 11:
            countSol = _context3.sent;
            _context3.next = 14;
            return db.collection("solicitudes").find({
              rut_CP: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context3.sent;
            _context3.next = 23;
            break;

          case 17:
            _context3.next = 19;
            return db.collection("solicitudes").find({
              razon_social_CP: rexExpresionFiltro
            }).count();

          case 19:
            countSol = _context3.sent;
            _context3.next = 22;
            return db.collection("solicitudes").find({
              razon_social_CP: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 22:
            result = _context3.sent;

          case 23:
            res.json({
              total_items: countSol,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countSol / nPerPage + 1),
              solicitudes: result
            });
            _context3.next = 29;
            break;

          case 26:
            _context3.prev = 26;
            _context3.t0 = _context3["catch"](7);
            res.status(501).json({
              mgs: "ha ocurrido un error ".concat(_context3.t0)
            });

          case 29:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[7, 26]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT FIELDS TO CONFIRM SOLICITUD

router.get("/mostrar/:id", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, id, resultFinal, resultSol, resultGI;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            id = req.params.id;
            resultFinal = {};
            _context4.next = 7;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            resultSol = _context4.sent;
            _context4.next = 10;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(resultSol.id_GI_Principal)
            });

          case 10:
            resultGI = _context4.sent;
            resultSol.email_gi = resultGI.email_central;
            res.json(resultSol);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //INSERT

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, newSolicitud, nuevaObs, items, result, gi, respMail;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            newSolicitud = JSON.parse(req.body.data);
            nuevaObs = newSolicitud.observacion_solicitud;
            _context5.next = 7;
            return db.collection("solicitudes").find({}).toArray();

          case 7:
            items = _context5.sent;

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

            if (req.file) {
              newSolicitud.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            } else {
              newSolicitud.url_file_adjunto = {};
            }

            _context5.next = 14;
            return db.collection("solicitudes").insertOne(newSolicitud);

          case 14:
            result = _context5.sent;

            if (!(result.result.ok === 1)) {
              _context5.next = 20;
              break;
            }

            _context5.next = 18;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(result.ops[0].id_GI_Principal)
            });

          case 18:
            gi = _context5.sent;
            respMail = (0, _sendinblue["default"])({
              RAZON_SOCIAL_CP: result.ops[0].razon_social_CP,
              CODIGO_SOL: result.ops[0].codigo,
              FECHA_SOL: result.ops[0].fecha_solicitud,
              HORA_SOL: result.ops[0].hora_solicitud,
              CATEGORIA_UNO_SOL: result.ops[0].categoria1,
              NOMBRE_SERVICIO: result.ops[0].nombre_servicio,
              NOMBRE_TIPO_SERVICIO: result.ops[0].tipo_servicio,
              LUGAR_SERVICIO: result.ops[0].lugar_servicio,
              SUCURSAL_SERVICIO: result.ops[0].sucursal
            }, [{
              email: gi.email_central,
              nombre: gi.razon_social
            }], 4);

          case 20:
            res.json(result);

          case 21:
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
router.post("/test", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, gi;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.body.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            _context6.next = 6;
            return db.collection("gi").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              email_central: 1
            });

          case 6:
            gi = _context6.sent;
            res.json(gi.email_central);

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
}()); //TEST PARA RECIBIR EXCEL DE INGRESO MASIVO DE SOLICITUDES

router.post("/masivo", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var nombre, db, data;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            nombre = req.body.nombre;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            data = (0, _excelToJson["default"])(req.file.path, "PLANTILLA SOL_ASIS");

            try {
              if (data.length > 0) {}
            } catch (error) {}

          case 6:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //EDITAR SOLICITUD

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var db, solicitud, id, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context8.sent;
            solicitud = JSON.parse(req.body.data);
            id = req.params.id;

            if (req.file) {
              solicitud.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context8.prev = 6;
            _context8.next = 9;
            return db.collection("solicitudes").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                id_GI_Principal: solicitud.id_GI_Principal,
                id_GI_Secundario: solicitud.id_GI_Secundario,
                id_GI_PersonalAsignado: solicitud.id_GI_PersonalAsignado,
                rut_CP: solicitud.rut_CP,
                razon_social_CP: solicitud.razon_social_CP,
                nro_contrato_seleccionado_cp: solicitud.nro_contrato_seleccionado_cp,
                faena_seleccionada_cp: solicitud.faena_seleccionada_cp,
                rut_cs: solicitud.rut_cs,
                razon_social_cs: solicitud.razon_social_cs,
                fecha_solicitud: solicitud.fecha_solicitud,
                fecha_servicio_solicitado: solicitud.fecha_servicio_solicitado,
                mes_solicitud: solicitud.mes_solicitud,
                anio_solicitud: solicitud.anio_solicitud,
                nombre_receptor: solicitud.nombre_receptor,
                categoria1: solicitud.categoria1,
                categoria2: solicitud.categoria2,
                categoria3: solicitud.categoria3,
                nombre_servicio: solicitud.nombre_servicio,
                tipo_servicio: solicitud.tipo_servicio,
                monto_neto: solicitud.monto_neto,
                porcentaje_impuesto: solicitud.porcentaje_impuesto,
                valor_impuesto: solicitud.valor_impuesto,
                precio: solicitud.precio,
                costo_estimado: solicitud.costo_estimado,
                lugar_servicio: solicitud.lugar_servicio,
                sucursal: solicitud.sucursal,
                hora_servicio_solicitado: solicitud.hora_servicio_solicitado,
                fecha_servicio_solicitado_termino: solicitud.fecha_servicio_solicitado_termino,
                hora_servicio_solicitado_termino: solicitud.hora_servicio_solicitado_termino,
                jornada: solicitud.jornada,
                hora_solicitud: solicitud.hora_solicitud,
                estado: solicitud.estado,
                codigo: solicitud.codigo,
                url_file_adjunto: solicitud.url_file_adjunto
              },
              $push: {
                observacion_solicitud: {
                  obs: solicitud.observacion_solicitud,
                  fecha: (0, _getDateNow.getDate)(new Date())
                }
              }
            });

          case 9:
            result = _context8.sent;
            res.status(201).json({
              message: "Solicitud modificada correctamente"
            });
            _context8.next = 16;
            break;

          case 13:
            _context8.prev = 13;
            _context8.t0 = _context8["catch"](6);
            res.status(500).json({
              message: "ha ocurrido un error",
              error: _context8.t0
            });

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[6, 13]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //CONFIRMAR SOLICITUD

router.post("/confirmar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var db, solicitud, id, obs, archivo, resultSol, resultGI, resp, codigoAsis, newReserva, resulReserva, respMail;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context9.sent;
            solicitud = JSON.parse(req.body.data);
            id = req.params.id;
            obs = {};
            archivo = {};
            obs.obs = solicitud.observacion_solicitud;
            obs.fecha = (0, _getDateNow.getDate)(new Date()); //verificar si hay archivo o no

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            } //obtener mail del cliente principal


            _context9.next = 12;
            return db.collection("solicitudes").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_confirmacion: solicitud.fecha_solicitud,
                hora_confirmacion: solicitud.hora_solicitud,
                medio_confirmacion: solicitud.medio_confirmacion,
                url_file_adjunto_confirm: archivo,
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            });

          case 12:
            resultSol = _context9.sent;

            if (!resultSol.result.ok) {
              _context9.next = 29;
              break;
            }

            _context9.next = 16;
            return db.collection("gi").updateOne({
              _id: (0, _mongodb.ObjectID)(solicitud.id_GI_Principal)
            }, {
              $set: {
                email_central: solicitud.email_central
              }
            });

          case 16:
            resultGI = _context9.sent;

            if (!resultGI.result.ok) {
              _context9.next = 29;
              break;
            }

            _context9.next = 20;
            return db.collection("solicitudes").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 20:
            resp = _context9.sent;
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
              estado: "Ingresado"
            };
            _context9.next = 26;
            return db.collection("reservas").insertOne(newReserva);

          case 26:
            resulReserva = _context9.sent;
            res.json(resulReserva);

            if (resulReserva.result.ok) {
              respMail = (0, _sendinblue["default"])({
                RAZON_SOCIAL_CP: resp.razon_social_CP,
                CODIGO_SOL: resp.codigo,
                FECHA_SOL: resp.fecha_solicitud,
                HORA_SOL: resp.hora_solicitud,
                CATEGORIA_UNO_SOL: resp.categoria1,
                NOMBRE_SERVICIO: resp.nombre_servicio,
                NOMBRE_TIPO_SERVICIO: resp.tipo_servicio,
                LUGAR_SERVICIO: resp.lugar_servicio,
                SUCURSAL_SERVICIO: resp.sucursal,
                FECHA_CONFIRMACION_SOL: resp.fecha_confirmacion,
                HORA_CONFIRMACION_SOL: resp.hora_confirmacion,
                MEDIO_CONFIRMACION: resp.medio_confirmacion,
                OBSERVACION_CONFIRMACION: resp.observacion_solicitud[resp.observacion_solicitud.length - 1].obs
              }, [{
                email: solicitud.email_central,
                nombre: resp.razon_social_CP
              }], 5);
            }

          case 29:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //CONFIRM MANY

router.post("/many", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var db, new_array, dataJson, archivo, obs, result, resp, codigoAsis, arrayReservas, resultReserva;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context10.sent;
            new_array = [];
            console.log(JSON.parse(req.body.data));
            dataJson = JSON.parse(req.body.data);
            archivo = {};
            obs = {};
            obs.obs = dataJson[0].observacion_solicitud;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            dataJson[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            }); //verificar si hay archivo o no

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            result = db.collection("solicitudes").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_confirmacion: dataJson[0].fecha_solicitud,
                hora_confirmacion: dataJson[0].hora_solicitud,
                medio_confirmacion: dataJson[0].medio_confirmacion,
                url_file_adjunto_confirm: archivo,
                estado: "Confirmado"
              },
              $push: {
                observacion_solicitud: obs
              }
            }); // se crea el array de objetos para la insercion de reservas

            resp = "";
            codigoAsis = "";
            arrayReservas = [];
            _context10.next = 18;
            return db.collection("solicitudes").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 18:
            resp = _context10.sent;
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
            _context10.next = 22;
            return db.collection("reservas").insertMany(arrayReservas);

          case 22:
            resultReserva = _context10.sent;
            res.json(resultReserva);

          case 24:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //DELETE

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            id = req.params.id;
            _context11.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context11.sent;
            _context11.next = 6;
            return db.collection("solicitudes").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context11.sent;
            res.json(result);

          case 8:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;