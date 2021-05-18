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

var _sendinblue = _interopRequireDefault(require("../../libs/sendinblue/sendinblue"));

var _isRol = require("../../functions/isRol");

var _jwt = require("../../libs/jwt");

var _text_messages = require("../../constant/text_messages");

var _database = require("../../database");

var _mongodb = require("mongodb");

var _var = require("../../constant/var");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

//SELECT
router.get('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var db, token, dataToken, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context.sent;
            token = req.headers['x-access-token'];

            if (token) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN,
              auth: _text_messages.UNAUTHOTIZED,
              ERROR: _text_messages.ERROR
            }));

          case 6:
            _context.next = 8;
            return (0, _jwt.verifyToken)(token);

          case 8:
            dataToken = _context.sent;

            if (!(Object.entries(dataToken).length === 0)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return", res.status(400).json({
              msg: _text_messages.ERROR_MESSAGE_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 11:
            _context.prev = 11;
            _context.next = 14;
            return db.collection("reservas").find({
              isActive: true
            }).toArray();

          case 14:
            result = _context.sent;
            res.status(200).json(result);
            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](11);
            res.status(500).json({
              msg: _text_messages.ERROR,
              error: _context.t0
            });

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[11, 18]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countRes, result;

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
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED, ERROR });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context2.prev = 5;
            _context2.next = 8;
            return db.collection("reservas").find({
              isActive: true
            }).count();

          case 8:
            countRes = _context2.sent;
            _context2.next = 11;
            return db.collection("reservas").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).sort({
              codigo: -1
            }).toArray();

          case 11:
            result = _context2.sent;
            return _context2.abrupt("return", res.status(200).json({
              // auth: AUTHORIZED,
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              reservas: result
            }));

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](5);
            return _context2.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              reservas: null,
              err: String(_context2.t0)
            }));

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
}()); //SELECT RESERVATIONS TO CONFIRM

router.get('/ingresadas', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context3.sent;
            _context3.next = 6;
            return db.collection('reservas').find({
              estado: 'Ingresado'
            }).toArray();

          case 6:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Reservas encontradas',
              res: result
            }));

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](0);
            console.log(_context3.t0);
            return _context3.abrupt("return", res.status(500).json({
              err: String(_context3.t0),
              msg: 'No se ha podido cargar las reservas',
              res: null
            }));

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 10]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT ONE

router.get("/:id", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var id, db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            _context4.prev = 4;
            _context4.next = 7;
            return db.collection("reservas").findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 7:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              msg: '',
              res: result
            }));

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](4);
            return _context4.abrupt("return", res.status(500).json({
              err: String(_context4.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[4, 11]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //BUSCAR POR RUT O NOMBRE

router.post('/buscar', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var _req$body2, identificador, filtro, pageNumber, headFilter, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countRes, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, pageNumber = _req$body2.pageNumber, headFilter = _req$body2.headFilter, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context5.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context5.sent;
            // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context5.prev = 8;
            _context5.next = 11;
            return db.collection("reservas").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 11:
            countRes = _context5.sent;
            _context5.next = 14;
            return db.collection("reservas").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              reservas: result
            }));

          case 18:
            _context5.prev = 18;
            _context5.t0 = _context5["catch"](8);
            return _context5.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              reservas: null,
              err: String(_context5.t0)
            }));

          case 21:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[8, 18]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //EDITAR RESERVA

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var db, datos, id, archivo, obs;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context6.sent;
            datos = JSON.parse(req.body.data);
            id = req.params.id; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            archivo = {};
            obs = {
              obs: datos.observacion,
              fecha: (0, _getDateNow.getDate)(new Date())
            };
            if (req.file) archivo = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path,
              type: req.file.mimetype
            };
            _context6.prev = 8;
            _context6.next = 11;
            return db.collection("reservas").updateOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            }, {
              $set: {
                fecha_reserva: datos.fecha_reserva,
                hora_reserva: datos.hora_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva_fin: datos.hora_reserva_fin,
                jornada: datos.jornada,
                mes: datos.mes,
                anio: datos.anio,
                id_GI_personalAsignado: datos.id_GI_personalAsignado,
                sucursal: datos.sucursal,
                url_file_adjunto: archivo
              },
              $push: {
                observacion: obs
              }
            });

          case 11:
            return _context6.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.SUCCESSFULL_UPDATE,
              res: []
            }));

          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](8);
            return _context6.abrupt("return", res.status(500).json({
              err: String(_context6.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[8, 14]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //CONFIRMAR RESERVA

router.post("/confirmar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, datos, db, obs, result, codAsis, reserva, gi, isOC, estado_archivo, estado;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            datos = JSON.parse(req.body.data);
            _context7.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context7.sent;
            // const token = req.headers['x-access-token'];
            // let archivo = {};
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });
            obs = {
              obs: datos.observacion,
              fecha: (0, _getDateNow.getDate)(new Date())
            };
            result = [];
            codAsis = ""; // if (req.file) {
            //   archivo = {
            //     name: req.file.originalname,
            //     size: req.file.size,
            //     path: req.file.path,
            //     type: req.file.mimetype,
            //   };
            // }

            _context7.prev = 8;
            _context7.next = 11;
            return db.collection("reservas").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_reserva: datos.fecha_reserva,
                fecha_reserva_fin: datos.fecha_reserva_fin,
                hora_reserva: datos.hora_reserva,
                hora_reserva_fin: datos.hora_reserva_fin,
                id_GI_personalAsignado: datos.id_GI_personalAsignado,
                sucursal: datos.sucursal,
                url_file_adjunto_confirm: {},
                estado: "Reservado",
                reqEvaluacion: (0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion)
              },
              $push: {
                observacion: obs
              }
            });

          case 11:
            result = _context7.sent;
            _context7.next = 14;
            return db.collection("reservas").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 14:
            reserva = _context7.sent;

            if (!((0, _changeToMiniscula.getMinusculas)(datos.reqEvaluacion) == "si" && result.result.ok == 1)) {
              _context7.next = 22;
              break;
            }

            //insertamos la evaluacion
            codAsis = reserva.codigo;
            codAsis = codAsis.replace("AGE", "EVA");
            _context7.next = 20;
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
              estado: "Ingresado",
              isActive: true
            });

          case 20:
            _context7.next = 34;
            break;

          case 22:
            _context7.next = 24;
            return db.collection("gi").findOne({
              rut: reserva.rut_cp,
              categoria: "Empresa/Organización"
            });

          case 24:
            gi = _context7.sent;
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
            _context7.next = 33;
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
              total: 0,
              isActive: true
            });

          case 33:
            result = _context7.sent;

          case 34:
            return _context7.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.CONFIRM_SUCCESSFULL,
              res: []
            }));

          case 37:
            _context7.prev = 37;
            _context7.t0 = _context7["catch"](8);
            return _context7.abrupt("return", res.status(500).json({
              err: String(_context7.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 40:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[8, 37]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //CONFIRMACION MASIVA DE RESERVAS

router.post("/confirmar", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var db, datosJson, new_array, obs, result, resp, codigoAsis, arrayEvaluaciones, resultEva, arrayIDsCP, isOC, estado_archivo, estado, GIs, resultFac;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context8.sent;
            datosJson = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores' || dataToken.rol === 'Emppleados')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            new_array = []; // let archivo = {};

            obs = {
              obs: datosJson[0].observacion,
              fecha: (0, _getDateNow.getDate)(new Date())
            }; //verificar si hay archivo o no
            // if (req.file) archivo = {
            //   name: req.file.originalname,
            //   size: req.file.size,
            //   path: req.file.path,
            //   type: req.file.mimetype,
            // };

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
                id_GI_personalAsignado: datosJson[0].id_GI_personalAsignado,
                sucursal: datosJson[0].sucursal,
                url_file_adjunto_confirm: {},
                estado: "Reservado",
                reqEvaluacion: (0, _changeToMiniscula.getMinusculas)(datosJson[0].reqEvaluacion)
              },
              $push: {
                observacion: obs
              }
            });
            resp = "";
            codigoAsis = "";
            arrayEvaluaciones = []; // Se insertan las evaluaciones o las facturaciones dependiendo del caso

            _context8.next = 13;
            return db.collection("reservas").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 13:
            resp = _context8.sent;

            if (!((0, _changeToMiniscula.getMinusculas)(datosJson[0].reqEvaluacion) === "si" && result)) {
              _context8.next = 22;
              break;
            }

            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("AGE", "EVA");
              arrayEvaluaciones.push({
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
                estado: "Ingresado",
                isActive: true
              });
            });
            _context8.next = 18;
            return db.collection("evaluaciones").insertMany(arrayEvaluaciones);

          case 18:
            resultEva = _context8.sent;
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Reservas confirmadas correctamente',
              res: resultEva
            }));

          case 22:
            arrayIDsCP = [];
            isOC = "";
            estado_archivo = "";
            estado = "";
            resp.forEach(function (element) {
              arrayIDsCP.push((0, _mongodb.ObjectID)(element.id_GI_Principal));
            });
            _context8.next = 29;
            return db.collection("gi").find({
              _id: {
                $in: arrayIDsCP
              },
              categoria: "Empresa/Organización"
            }).toArray();

          case 29:
            GIs = _context8.sent;
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
                total: 0,
                isActive: true
              });
            });
            _context8.next = 33;
            return db.collection("facturaciones").insertMany(arrayReservas);

          case 33:
            resultFac = _context8.sent;
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Reservas confirmadas correctamente',
              res: resultFac
            }));

          case 35:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //DELETE / ANULAR

router["delete"]('/:id', /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, db, existReserva, codeSolicitud, existSolicitud;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            _context9.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context9.sent;
            _context9.prev = 4;
            _context9.next = 7;
            return db.collection('reservas').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            existReserva = _context9.sent;

            if (existReserva) {
              _context9.next = 10;
              break;
            }

            return _context9.abrupt("return", res.status(200).json({
              err: 98,
              msg: "".concat(_var.NOT_EXISTS, ": reserva"),
              res: []
            }));

          case 10:
            // console.log(existReserva);
            codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
            _context9.next = 13;
            return db.collection('solicitudes').findOne({
              codigo: codeSolicitud
            });

          case 13:
            existSolicitud = _context9.sent;

            if (existSolicitud) {
              _context9.next = 16;
              break;
            }

            return _context9.abrupt("return", res.status(200).json({
              err: 98,
              msg: "".concat(_var.NOT_EXISTS, ": solicitud"),
              res: []
            }));

          case 16:
            _context9.next = 18;
            return db.collection('reservas').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                isActive: false
              }
            });

          case 18:
            _context9.next = 20;
            return db.collection('solicitudes').updateOne({
              codigo: codeSolicitud
            }, {
              $set: {
                isActive: false
              }
            });

          case 20:
            return _context9.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.DELETE_SUCCESSFULL,
              res: []
            }));

          case 23:
            _context9.prev = 23;
            _context9.t0 = _context9["catch"](4);
            console.log(_context9.t0);
            return _context9.abrupt("return", res.status(500).json({
              err: String(_context9.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 27:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[4, 23]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); // ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("reservas")
//       .updateMany({}, {
//         $set: {
//           isActive: true
//         }
//       });
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ msg: String(error) });
//   }
// });

var _default = router;
exports["default"] = _default;