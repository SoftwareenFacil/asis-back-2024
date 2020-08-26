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

var _calculateFechaPago = require("../../functions/calculateFechaPago");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _database = require("../../database");

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)(); //database connection

//SELECT
router.get("/", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var db, result, empresa;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context.sent;
            _context.next = 5;
            return db.collection("facturaciones").find({}).toArray();

          case 5:
            result = _context.sent;
            _context.next = 8;
            return db.collection("empresa").findOne({});

          case 8:
            empresa = _context.sent;
            res.json({
              datos: result,
              empresa: empresa
            });

          case 10:
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
    var id, db, result, empresa;
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
            return db.collection('facturaciones').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context2.sent;
            _context2.next = 9;
            return db.collection('empresa').findOne();

          case 9:
            empresa = _context2.sent;
            res.json({
              facturaciones: result,
              empresa: empresa
            });

          case 11:
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
    var db, _req$body, pageNumber, nPerPage, skip_page, countFac, empresa, result;

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
            return db.collection("facturaciones").find().count();

          case 8:
            countFac = _context3.sent;
            _context3.next = 11;
            return db.collection("empresa").findOne({});

          case 11:
            empresa = _context3.sent;
            _context3.next = 14;
            return db.collection("facturaciones").find().skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context3.sent;
            res.json({
              total_items: countFac,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countFac / nPerPage + 1),
              empresa: empresa,
              facturaciones: result
            });
            _context3.next = 21;
            break;

          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](5);
            res.status(501).json(_context3.t0);

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[5, 18]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //BUSCAR POR RUT O NOMBRE

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countFac;

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
            return db.collection("facturaciones").find({
              rut_cp: rexExpresionFiltro
            }).count();

          case 11:
            countFac = _context4.sent;
            _context4.next = 14;
            return db.collection("facturaciones").find({
              rut_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            _context4.next = 23;
            break;

          case 17:
            _context4.next = 19;
            return db.collection("facturaciones").find({
              razon_social_cp: rexExpresionFiltro
            }).count();

          case 19:
            countFac = _context4.sent;
            _context4.next = 22;
            return db.collection("facturaciones").find({
              razon_social_cp: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 22:
            result = _context4.sent;

          case 23:
            res.json({
              total_items: countFac,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countFac / nPerPage + 1),
              facturaciones: result
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
    var id, db, factura, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            factura = JSON.parse(req.body.data);

            if (req.file) {
              factura.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context5.prev = 6;
            _context5.next = 9;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                nro_factura: factura.nro_factura,
                archivo_factura: archivo,
                monto_neto: factura.monto_neto,
                porcentaje_impuesto: factura.porcentaje_impuesto,
                valor_impuesto: factura.valor_impuesto,
                sub_total: factura.sub_total,
                exento: factura.exento,
                descuento: factura.descuento,
                total: factura.total
              }
            });

          case 9:
            result = _context5.sent;
            res.status(201).json({
              message: "Factura modificada correctamente",
              result: result
            });
            _context5.next = 16;
            break;

          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5["catch"](6);
            res.status(500).json({
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
}()); //INSERTAR DATOS DE FACTURACION

router.post("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, datos, archivo, obs, result;
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
            archivo = {};
            obs = {};
            obs.obs = datos.observacion_factura;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";
            result = "";

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context6.next = 14;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_facturacion: datos.fecha_facturacion,
                estado_archivo: "Cargado",
                nro_factura: datos.nro_factura,
                archivo_factura: archivo,
                monto_neto: datos.monto_neto,
                porcentaje_impuesto: datos.porcentaje_impuesto,
                valor_impuesto: datos.valor_impuesto,
                sub_total: datos.sub_total,
                exento: datos.exento,
                descuento: datos.descuento,
                total: datos.total
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 14:
            result = _context6.sent;
            res.json(result);

          case 16:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //INSERTAR FACTURA MASIVO

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var db, new_array, datos, archivo, obs, result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context7.sent;
            new_array = [];
            datos = JSON.parse(req.body.data);
            archivo = {};
            obs = {};
            obs.obs = datos[0].observacion_factura;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";
            result = "";
            datos[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context7.next = 15;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_facturacion: datos[0].fecha_facturacion,
                estado_archivo: "Cargado",
                nro_factura: datos[0].nro_factura,
                archivo_factura: archivo,
                monto_neto: datos[0].monto_neto,
                porcentaje_impuesto: datos[0].porcentaje_impuesto,
                valor_impuesto: datos[0].valor_impuesto,
                sub_total: datos[0].sub_total,
                exento: datos[0].exento,
                descuento: datos[0].descuento,
                total: datos[0].total
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 15:
            result = _context7.sent;
            res.json(result);

          case 17:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //SUBIR OC

router.post("/subiroc/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, db, datos, archivo, obs, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _context8.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context8.sent;
            datos = JSON.parse(req.body.data);
            archivo = {};
            obs = {};
            obs.obs = datos.observacion_oc;
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

            _context8.next = 13;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                archivo_oc: archivo,
                fecha_oc: datos.fecha_oc,
                hora_oc: datos.hora_oc,
                nro_oc: datos.nro_oc,
                estado_archivo: "Cargado",
                estado: "En Revisión"
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 13:
            result = _context8.sent;
            res.json(result);

          case 15:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //SUBIR OC MASIVO

router.post("/oc/subiroc/many", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var db, new_array, datos, archivo, obs, result;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context9.sent;
            new_array = [];
            datos = JSON.parse(req.body.data);
            archivo = {};
            obs = {};
            obs.obs = datos[0].observacion_oc;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";
            datos[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context9.next = 14;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                archivo_oc: archivo,
                fecha_oc: datos[0].fecha_oc,
                hora_oc: datos[0].hora_oc,
                nro_oc: datos[0].nro_oc,
                estado_archivo: "Cargado",
                estado: "En Revisión"
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 14:
            result = _context9.sent;
            res.json(result);

          case 16:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //CONFIRMAR OC

router.post("/confirmaroc/:id", /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var id, db, obs, estado, result;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            id = req.params.id;
            _context10.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context10.sent;
            obs = {};
            obs.obs = req.body.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = req.body.estado_archivo;
            estado = "";
            req.body.estado_archivo == "Aprobado" ? estado = "En Facturacion" : estado = "Ingresado";
            _context10.next = 12;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estado,
                estado_archivo: req.body.estado_archivo
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 12:
            result = _context10.sent;
            res.json(result);

          case 14:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //CONFIRMAR OC MASIVO

router.post("/oc/confirmaroc/many", /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var db, new_array, obs, estado, result;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context11.sent;
            new_array = [];
            obs = {};
            obs.obs = req.body[0].observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = req.body[0].estado_archivo;
            estado = "";
            req.body[0].estado_archivo == "Aprobado" ? estado = "En Facturacion" : estado = "Ingresado";
            req.body[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _context11.next = 13;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                estado: estado,
                estado_archivo: req.body[0].estado_archivo
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 13:
            result = _context11.sent;
            res.json(result);

          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}()); // VALIDAR FACTURA

router.post("/validar/:id", /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var id, _req$body3, estado_archivo, observaciones, nro_nota_credito, fecha_nota_credito, monto_nota_credito, factura_anular, db, obs, estado, result, _db$collection$insert, codAsis, gi, servicio, _db$collection$insert2;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            id = req.params.id;
            _req$body3 = req.body, estado_archivo = _req$body3.estado_archivo, observaciones = _req$body3.observaciones, nro_nota_credito = _req$body3.nro_nota_credito, fecha_nota_credito = _req$body3.fecha_nota_credito, monto_nota_credito = _req$body3.monto_nota_credito, factura_anular = _req$body3.factura_anular;
            _context12.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context12.sent;
            obs = {};
            obs.obs = observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = estado_archivo;
            estado = "";
            estado_archivo == "Rechazado" ? estado = "En Facturacion" : estado = "Facturado";
            _context12.next = 13;
            return db.collection("facturaciones").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estado,
                estado_archivo: estado_archivo,
                nro_nota_credito: nro_nota_credito,
                fecha_nota_credito: fecha_nota_credito,
                monto_nota_credito: monto_nota_credito,
                factura_anular: factura_anular
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 13:
            result = _context12.sent;

            if (!(estado_archivo == "Aprobado")) {
              _context12.next = 28;
              break;
            }

            //insertar pago en modulo pago
            codAsis = result.value.codigo;
            _context12.next = 18;
            return db.collection("gi").findOne({
              rut: result.value.rut_cp,
              razon_social: result.value.razon_social_cp
            });

          case 18:
            gi = _context12.sent;
            _context12.next = 21;
            return db.collection("solicitudes").findOne({
              codigo: codAsis.replace("FAC", "SOL")
            });

          case 21:
            servicio = _context12.sent;
            _context12.next = 24;
            return db.collection("pagos").insertOne((_db$collection$insert = {
              codigo: codAsis.replace("FAC", "PAG"),
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
              estado: "No Pagado",
              fecha_facturacion: result.value.fecha_facturacion,
              nro_factura: result.value.nro_factura,
              credito: gi.credito,
              dias_credito: gi.dias_credito
            }, _defineProperty(_db$collection$insert, "valor_servicio", Number(servicio.precio)), _defineProperty(_db$collection$insert, "valor_cancelado", 0), _defineProperty(_db$collection$insert, "fecha_pago", (0, _calculateFechaPago.getFechaPago)(result.value.fecha_facturacion, Number(gi.dias_credito))), _defineProperty(_db$collection$insert, "pagos", []), _db$collection$insert));

          case 24:
            if (!((0, _changeToMiniscula.getMinusculas)(gi.credito) == "no")) {
              _context12.next = 28;
              break;
            }

            _context12.next = 27;
            return db.collection("cobranza").insertOne((_db$collection$insert2 = {
              codigo: codAsis.replace("FAC", "COB"),
              nombre_servicio: result.value.nombre_servicio,
              faena_seleccionada_cp: result.value.faena_seleccionada_cp,
              valor_servicio: result.value.valor_servicio,
              categoria_cliente: gi.categoria,
              fecha_facturacion: result.value.fecha_facturacion,
              dias_credito: gi.dias_credito,
              rut_cp: result.value.rut_cp,
              razon_social_cp: result.value.razon_social_cp,
              rut_cs: result.value.rut_cs,
              razon_social_cs: result.value.razon_social_cs,
              lugar_servicio: result.value.lugar_servicio,
              sucursal: result.value.sucursal,
              estado: "Vencido"
            }, _defineProperty(_db$collection$insert2, "valor_servicio", Number(servicio.precio)), _defineProperty(_db$collection$insert2, "valor_cancelado", 0), _defineProperty(_db$collection$insert2, "valor_deuda", Number(servicio.precio)), _defineProperty(_db$collection$insert2, "cartas_cobranza", []), _db$collection$insert2));

          case 27:
            result = _context12.sent;

          case 28:
            res.json(result);

          case 29:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function (_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}()); //VALIDAR FACTURA MASIVO

router.post("/validar/factura/asis/many", /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(req, res) {
    var db, obs, estado, estadoArchivo, result, new_array, resp, codigoAsis, arrayIDsCP, serviciosArray, arrayFacturaciones, GIs, gi, Servicios, servicio, resultPagos, resultCobranza;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context13.sent;
            obs = {};
            estado = "";
            estadoArchivo = "";
            result = "";
            new_array = [];
            obs.obs = req.body[0].observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = req.body[0].estado_archivo;
            estadoArchivo == "Rechazado" ? estado = "En Facturacion" : estado = "Facturado";
            req.body[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _context13.next = 15;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                estado: estado,
                estado_archivo: req.body[0].estado_archivo,
                nro_nota_credito: req.body[0].nro_nota_credito,
                fecha_nota_credito: req.body[0].fecha_nota_credito,
                monto_nota_credito: req.body[0].monto_nota_credito,
                factura_anular: req.body[0].factura_anular
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 15:
            result = _context13.sent;

            if (!(req.body[0].estado_archivo == "Aprobado")) {
              _context13.next = 51;
              break;
            }

            resp = "";
            codigoAsis = "";
            arrayIDsCP = [];
            serviciosArray = [];
            arrayFacturaciones = [];
            GIs = [];
            gi = {};
            Servicios = [];
            servicio = {};
            _context13.next = 28;
            return db.collection("facturaciones").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 28:
            resp = _context13.sent;
            resp.forEach(function (element) {
              arrayIDsCP.push(element.rut_cp.toString());
            });
            resp.forEach(function (element) {
              serviciosArray.push(element.codigo.replace("FAC", "SOL"));
            });
            _context13.next = 33;
            return db.collection("gi").find({
              rut: {
                $in: arrayIDsCP
              }
            }).toArray();

          case 33:
            GIs = _context13.sent;
            _context13.next = 36;
            return db.collection("solicitudes").find({
              codigo: {
                $in: serviciosArray
              }
            }).toArray();

          case 36:
            Servicios = _context13.sent;
            resp.forEach(function (element) {
              var _arrayFacturaciones$p;

              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("FAC", "PAG"); //- se busca el gi correspondiente

              gi = GIs.find(function (gi) {
                return gi.rut === element.rut_cp;
              }); //-
              //- se busca el servicio asociado

              servicio = Servicios.find(function (serv) {
                return serv.codigo.replace("SOL", "FAC").toString() === element.codigo;
              }); //-

              arrayFacturaciones.push((_arrayFacturaciones$p = {
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
                estado: "No Pagado",
                fecha_facturacion: element.fecha_facturacion,
                nro_factura: element.nro_factura,
                credito: gi.credito,
                dias_credito: gi.dias_credito
              }, _defineProperty(_arrayFacturaciones$p, "valor_servicio", Number(servicio.precio)), _defineProperty(_arrayFacturaciones$p, "valor_cancelado", 0), _defineProperty(_arrayFacturaciones$p, "fecha_pago", (0, _calculateFechaPago.getFechaPago)(element.fecha_facturacion, Number(gi.dias_credito))), _defineProperty(_arrayFacturaciones$p, "pagos", []), _arrayFacturaciones$p));
            });
            _context13.next = 40;
            return db.collection("pagos").insertMany(arrayFacturaciones);

          case 40:
            resultPagos = _context13.sent;
            //si no tiene dias credito , pasa directo a cobranza
            arrayFacturaciones = [];
            resp.forEach(function (element) {
              //- se busca el gi correspondiente
              gi = GIs.find(function (gi) {
                return gi.rut === element.rut_cp;
              }); //-
              //- se busca el servicio asociado

              servicio = Servicios.find(function (serv) {
                return serv.codigo.replace("SOL", "FAC").toString() === element.codigo;
              }); //-

              if ((0, _changeToMiniscula.getMinusculas)(gi.credito) == "no") {
                var _arrayFacturaciones$p2;

                arrayFacturaciones.push((_arrayFacturaciones$p2 = {
                  codigo: servicio.codigo.replace("SOL", "COB"),
                  nombre_servicio: element.nombre_servicio,
                  faena_seleccionada_cp: element.faena_seleccionada_cp,
                  valor_servicio: element.valor_servicio,
                  categoria_cliente: gi.categoria,
                  fecha_facturacion: element.fecha_facturacion,
                  dias_credito: gi.dias_credito,
                  rut_cp: element.rut_cp,
                  razon_social_cp: element.razon_social_cp,
                  rut_cs: element.rut_cs,
                  razon_social_cs: element.razon_social_cs,
                  lugar_servicio: element.lugar_servicio,
                  sucursal: element.sucursal,
                  estado: "Vencido"
                }, _defineProperty(_arrayFacturaciones$p2, "valor_servicio", Number(servicio.precio)), _defineProperty(_arrayFacturaciones$p2, "valor_cancelado", 0), _defineProperty(_arrayFacturaciones$p2, "valor_deuda", Number(servicio.precio)), _defineProperty(_arrayFacturaciones$p2, "cartas_cobranza", []), _arrayFacturaciones$p2));
              }
            });

            if (!(arrayFacturaciones.length > 0)) {
              _context13.next = 50;
              break;
            }

            _context13.next = 46;
            return db.collection("cobranza").insertMany(arrayFacturaciones);

          case 46:
            resultCobranza = _context13.sent;
            res.json(resultCobranza);
            _context13.next = 51;
            break;

          case 50:
            res.json(resultPagos);

          case 51:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function (_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;