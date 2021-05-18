"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _fechaVencExamen = require("../../functions/fechaVencExamen");

var _getDateNow = require("../../functions/getDateNow");

var _getEspecificDate = require("../../functions/getEspecificDate");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _aws = require("../../libs/aws");

var _moment = _interopRequireDefault(require("moment"));

var _jwt = require("../../libs/jwt");

var _uuid = require("uuid");

var _text_messages = require("../../constant/text_messages");

var _database = require("../../database");

var _mongodb = require("mongodb");

var _var = require("../../constant/var");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();

var path = require("path");

var AWS = require('aws-sdk');

var fs = require("fs"); //database connection


//SELECT
router.get("/", /*#__PURE__*/function () {
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
              auth: _text_messages.UNAUTHOTIZED
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
            return db.collection("resultados").find(dataToken.rol === 'Clientes' ? {
              id_GI_Principal: dataToken.id,
              isActive: true
            } : {
              isActive: true
            }).sort({
              codigo: -1
            }).toArray();

          case 14:
            result = _context.sent;
            return _context.abrupt("return", res.status(200).json(result));

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](11);
            return _context.abrupt("return", res.status(500).json({
              msg: _text_messages.ERROR,
              error: _context.t0
            }));

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
            _context2.prev = 4;
            _context2.next = 7;
            return db.collection('resultados').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            result = _context2.sent;

            if (result) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", res.status(400).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 10:
            return _context2.abrupt("return", res.status(200).json({
              err: null,
              msg: '',
              res: result
            }));

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](4);
            return _context2.abrupt("return", res.status(200).json({
              err: String(_context2.t0),
              msg: 'Ha ocurrido un error',
              res: null
            }));

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[4, 13]]);
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
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context3.prev = 5;
            _context3.next = 8;
            return db.collection("resultados").find({
              isActive: true
            }).count();

          case 8:
            countRes = _context3.sent;
            _context3.next = 11;
            return db.collection("resultados").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).sort({
              codigo: -1
            }).toArray();

          case 11:
            result = _context3.sent;
            return _context3.abrupt("return", res.json({
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              resultados: result
            }));

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            return _context3.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              resultados: null,
              err: String(_context3.t0)
            }));

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
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countRes, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context4.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context4.sent;
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            } // else {
            //   rutFiltrado = filtro;
            // }


            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context4.prev = 8;
            _context4.next = 11;
            return db.collection("resultados").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 11:
            countRes = _context4.sent;
            _context4.next = 14;
            return db.collection("resultados").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              total_items: countRes,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countRes / nPerPage + 1),
              resultados: result
            }));

          case 18:
            _context4.prev = 18;
            _context4.t0 = _context4["catch"](8);
            console.log(_context4.t0);
            return _context4.abrupt("return", res.status(501).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              resultados: null,
              err: String(_context4.t0)
            }));

          case 22:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[8, 18]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //SUBIR ARCHIVO RESULTADO

router.post("/subir/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, datos, archivo, obs, nombrePdf, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            archivo = {}; // let obs = {};
            // obs.obs = datos.observaciones;
            // obs.fecha = getDate(new Date());
            // obs.estado = "Cargado";

            obs = {
              obs: datos.observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            }; // if (req.file) archivo = {
            //   name: req.file.originalname,
            //   size: req.file.size,
            //   path: req.file.path,
            //   type: req.file.mimetype,
            // };

            _context5.prev = 7;

            if (req.file) {
              // const nombrePdf = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
              //   ? NAME_PSICO_PDF : datos.nombre_servicio === 'Aversión al Riesgo' ? NAME_AVERSION_PDF : OTHER_NAME_PDF;
              nombrePdf = _var.OTHER_NAME_PDF; // const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_psicosensotecnico.png`;

              archivo = datos.nombre_servicio === 'Psicosensotécnico Riguroso' ? "psico_".concat(datos.codigo, "_").concat((0, _uuid.v4)()) : datos.nombre_servicio === 'Aversión al riesgo' ? "aversion_".concat(datos.codigo, "_").concat((0, _uuid.v4)()) : "".concat(datos.codigo, "_").concat((0, _uuid.v4)());
              setTimeout(function () {
                var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
                var params = {
                  Bucket: _var.AWS_BUCKET_NAME,
                  Body: fileContent,
                  Key: archivo,
                  ContentType: 'application/pdf'
                };
                (0, _aws.uploadFileToS3)(params);
              }, 2000);
            }

            ;
            _context5.next = 12;
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

          case 12:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Archivo subido',
              res: result
            }));

          case 16:
            _context5.prev = 16;
            _context5.t0 = _context5["catch"](7);
            console.log(_context5.t0);
            return _context5.abrupt("return", res.status(500).json({
              err: null,
              msg: _text_messages.ERROR,
              res: null
            }));

          case 20:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[7, 16]]);
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
            datos = req.body; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')
            //   return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN });

            result = "";
            obs = {
              obs: datos.observaciones,
              fecha: (0, _getDateNow.getDate)(new Date())
            }; // let obs = {};
            // obs.obs = datos.observaciones;
            // obs.fecha = getDate(new Date());

            console.log(datos);
            _context6.prev = 8;

            if (!(datos.estado_archivo == "Aprobado")) {
              _context6.next = 34;
              break;
            }

            obs.estado = datos.estado_archivo;

            if (!(datos.estado_resultado == "Aprobado con obs" || datos.estado_resultado == "Aprobado")) {
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
                fecha_vencimiento_examen: (0, _moment["default"])(datos.fecha_resultado, _var.FORMAT_DATE).add(datos.vigencia_examen, 'M').format(_var.FORMAT_DATE) // fecha_vencimiento_examen: getDateEspecific(
                //   getFechaVencExam(datos.fecha_resultado, datos.vigencia_examen)
                // ),

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
              condicionantes: datos.condicionantes,
              vigencia_examen: datos.vigencia_examen,
              oc: isOC,
              archivo_oc: "",
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
              porcentaje_impuesto: 0,
              valor_impuesto: 0,
              sub_total: 0,
              exento: 0,
              descuento: 0,
              total: 0,
              isActive: true
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
            return _context6.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Resultado evaluado satisfactoriamente',
              res: result
            }));

          case 41:
            _context6.prev = 41;
            _context6.t0 = _context6["catch"](8);
            console.log(_context6.t0);
            return _context6.abrupt("return", res.status(500).json({
              err: String(_context6.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 45:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[8, 41]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //GET FILE FROM AWS S3

router.get('/downloadfile/:id', /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, db, evaluacion, pathPdf, s3;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            _context7.prev = 4;
            _context7.next = 7;
            return db.collection('resultados').findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 7:
            evaluacion = _context7.sent;

            if (evaluacion) {
              _context7.next = 10;
              break;
            }

            return _context7.abrupt("return", res.status(500).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 10:
            pathPdf = evaluacion.url_file_adjunto_res;
            s3 = new AWS.S3({
              accessKeyId: _var.AWS_ACCESS_KEY,
              secretAccessKey: _var.AWS_SECRET_KEY
            });
            s3.getObject({
              Bucket: _var.AWS_BUCKET_NAME,
              Key: pathPdf
            }, function (error, data) {
              if (error) {
                return res.status(500).json({
                  err: String(error),
                  msg: 'error s3 get file',
                  res: null
                });
              } else {
                return res.status(200).json({
                  err: null,
                  msg: 'Archivo descargado',
                  res: data.Body,
                  filename: pathPdf
                });
              }

              ;
            });
            _context7.next = 19;
            break;

          case 15:
            _context7.prev = 15;
            _context7.t0 = _context7["catch"](4);
            console.log(_context7.t0);
            return _context7.abrupt("return", res.status(500).json({
              err: String(_context7.t0),
              msg: 'Error al obtener archivo',
              res: null
            }));

          case 19:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[4, 15]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //DELETE / ANULAR

router["delete"]('/:id', /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, db, existResultado, codeEvaluacion, existEvaluacion, codeReserva, existReserva, codeSolicitud, existSolicitud;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _context8.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context8.sent;
            _context8.prev = 4;
            _context8.next = 7;
            return db.collection('resultados').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            existResultado = _context8.sent;

            if (existResultado) {
              _context8.next = 10;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'resultado no existe'
            }));

          case 10:
            codeEvaluacion = existResultado.codigo.replace('RES', 'EVA');
            _context8.next = 13;
            return db.collection('evaluaciones').findOne({
              codigo: codeEvaluacion
            });

          case 13:
            existEvaluacion = _context8.sent;

            if (existEvaluacion) {
              _context8.next = 16;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'evaluacion no existe'
            }));

          case 16:
            codeReserva = existEvaluacion.codigo.replace('EVA', 'AGE');
            _context8.next = 19;
            return db.collection('reservas').findOne({
              codigo: codeReserva
            });

          case 19:
            existReserva = _context8.sent;

            if (existReserva) {
              _context8.next = 22;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'reserva no existe'
            }));

          case 22:
            codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
            _context8.next = 25;
            return db.collection('solicitudes').findOne({
              codigo: codeSolicitud
            });

          case 25:
            existSolicitud = _context8.sent;

            if (existSolicitud) {
              _context8.next = 28;
              break;
            }

            return _context8.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'solicitud no existe no existe'
            }));

          case 28:
            _context8.next = 30;
            return db.collection('resultados').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                isActive: false
              }
            });

          case 30:
            _context8.next = 32;
            return db.collection('evaluaciones').updateOne({
              codigo: codeEvaluacion
            }, {
              $set: {
                isActive: false
              }
            });

          case 32:
            _context8.next = 34;
            return db.collection('reservas').updateOne({
              codigo: codeReserva
            }, {
              $set: {
                isActive: false
              }
            });

          case 34:
            _context8.next = 36;
            return db.collection('solicitudes').updateOne({
              codigo: codeSolicitud
            }, {
              $set: {
                isActive: false
              }
            });

          case 36:
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.DELETE_SUCCESSFULL,
              res: null
            }));

          case 39:
            _context8.prev = 39;
            _context8.t0 = _context8["catch"](4);
            console.log(_context8.t0);
            return _context8.abrupt("return", res.status(500).json({
              err: String(_context8.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 43:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[4, 39]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); // ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("resultados")
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