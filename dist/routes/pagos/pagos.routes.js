"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _uuid = require("uuid");

var _aws = require("../../libs/aws");

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

var AWS = require('aws-sdk');

var fs = require("fs");

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
            return db.collection("pagos").find({
              isActive: true
            }).toArray();

          case 5:
            result = _context.sent;
            return _context.abrupt("return", res.json(result));

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
            return db.collection('pagos').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 6:
            result = _context2.sent;
            return _context2.abrupt("return", res.json(result));

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
    var db, _req$body, pageNumber, nPerPage, skip_page, countPagos, result;

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
            return db.collection("pagos").find({
              isActive: true
            }).count();

          case 8:
            countPagos = _context3.sent;
            _context3.next = 11;
            return db.collection("pagos").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              // auth: AUTHORIZED,
              total_items: countPagos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countPagos / nPerPage + 1),
              pagos: result
            }));

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            return _context3.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              pagos: null,
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

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countPagos, _db$collection$find, _db$collection$find2;

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
            } // if (identificador === 1 && filtro.includes("k")) {
            //   rutFiltrado = filtro;
            //   rutFiltrado.replace("k", "K");
            // } else {
            //   rutFiltrado = filtro;
            // }


            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context4.prev = 8;
            _context4.next = 11;
            return db.collection("pagos").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 11:
            countPagos = _context4.sent;
            _context4.next = 14;
            return db.collection("pagos").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              total_items: countPagos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countPagos / nPerPage + 1),
              pagos: result
            }));

          case 18:
            _context4.prev = 18;
            _context4.t0 = _context4["catch"](8);
            return _context4.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              pagos: null,
              err: String(_context4.t0)
            }));

          case 21:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[8, 18]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //INGRESAR PAGO

router.post("/nuevo/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, id, datos, _result$value, archivo, nombrePdf, obj, result, codigoPAG, codigoCOB;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            id = req.params.id;
            console.log(req.body.data);
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });
            // if (req.file) archivo = {
            //   name: req.file.originalname,
            //   size: req.file.size,
            //   path: req.file.path,
            //   type: req.file.mimetype,
            // };

            console.log(datos);
            _context5.prev = 7;
            archivo = '';

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              archivo = "PAGO_".concat(datos.codigo, "_").concat((0, _uuid.v4)());
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
            obj = {
              id: (0, _uuid.v4)(),
              fecha_pago: datos.fecha_pago,
              hora_pago: datos.hora_pago,
              sucursal: datos.sucursal,
              tipo_pago: datos.tipo_pago,
              monto: datos.monto,
              descuento: datos.descuento,
              total: datos.total,
              observaciones: datos.observaciones,
              institucion_bancaria: datos.institucion_bancaria,
              archivo_adjunto: archivo,
              isActive: true
            };
            _context5.next = 14;
            return db.collection("pagos").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $inc: {
                valor_cancelado: obj.total
              },
              $push: {
                pagos: obj
              }
            }, {
              returnOriginal: false
            });

          case 14:
            result = _context5.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace("PAG", "COB"); //--

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context5.next = 23;
              break;
            }

            _context5.next = 20;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 20:
            result = _context5.sent;
            _context5.next = 27;
            break;

          case 23:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context5.next = 27;
              break;
            }

            _context5.next = 26;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 26:
            result = _context5.sent;

          case 27:
            _context5.next = 29;
            return db.collection("cobranza").findOneAndUpdate({
              codigo: codigoCOB
            }, {
              $inc: {
                valor_deuda: -obj.total,
                valor_cancelado: obj.total
              }
            }, {
              returnOriginal: false
            });

          case 29:
            result = _context5.sent;

            if (!(result && ((_result$value = result.value) === null || _result$value === void 0 ? void 0 : _result$value.valor_deuda) === 0)) {
              _context5.next = 34;
              break;
            }

            _context5.next = 33;
            return db.collection("cobranza").updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 33:
            result = _context5.sent;

          case 34:
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Pago ingresado correctamente',
              res: result
            }));

          case 37:
            _context5.prev = 37;
            _context5.t0 = _context5["catch"](7);
            console.log(_context5.t0);
            return _context5.abrupt("return", res.status(500).json({
              err: String(_context5.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 41:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[7, 37]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //INGRESO MASIVO DE PAGOS

router.post("/many", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var db, datos, token, dataToken, archivo, new_array, result, codesCobranza;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context6.sent;
            datos = JSON.parse(req.body.data);
            token = req.headers['x-access-token'];

            if (token) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 7:
            _context6.next = 9;
            return (0, _jwt.verifyToken)(token);

          case 9:
            dataToken = _context6.sent;

            if (!(Object.entries(dataToken).length === 0)) {
              _context6.next = 12;
              break;
            }

            return _context6.abrupt("return", res.status(400).json({
              msg: _text_messages.ERROR_MESSAGE_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 12:
            archivo = {};
            new_array = [];
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

            _context6.prev = 16;
            _context6.next = 19;
            return db.collection("pagos").find({
              _id: {
                $in: new_array
              }
            }).forEach(function (c) {
              db.collection("pagos").updateOne({
                _id: c._id
              }, {
                $push: {
                  pagos: {
                    id: (0, _uuid.v4)(),
                    fecha_pago: datos[0].fecha_pago,
                    hora_pago: datos[0].hora_pago,
                    sucursal: datos[0].sucursal,
                    tipo_pago: datos[0].tipo_pago,
                    monto: c.valor_servicio - c.valor_cancelado,
                    descuento: datos[0].descuento,
                    total: c.valor_servicio - c.valor_cancelado,
                    observaciones: datos[0].observaciones,
                    institucion_bancaria: datos[0].institucion_bancaria,
                    archivo_adjunto: archivo,
                    isActive: true
                  }
                },
                $set: {
                  valor_cancelado: c.valor_servicio,
                  estado: "Pagado"
                }
              });
            });

          case 19:
            result = _context6.sent;
            //pasar los codigos de pago a cobranza
            codesCobranza = datos[2].codes;
            codesCobranza = codesCobranza.map(function (e) {
              return e = e.replace("PAG", "COB");
            });
            _context6.next = 24;
            return db.collection("cobranza").find({
              codigo: {
                $in: codesCobranza
              }
            }).forEach(function (c) {
              db.collection("cobranza").updateOne({
                codigo: c.codigo
              }, {
                $set: {
                  valor_cancelado: c.valor_servicio,
                  valor_deuda: 0,
                  estado: "Al Dia"
                }
              });
            });

          case 24:
            result = _context6.sent;
            return _context6.abrupt("return", res.json({
              message: "Pagos realizados satisfactoriamente",
              isOK: true
            }));

          case 28:
            _context6.prev = 28;
            _context6.t0 = _context6["catch"](16);
            return _context6.abrupt("return", res.json({
              message: "ha ocurrido un error",
              err: _context6.t0,
              isOK: false
            }));

          case 31:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[16, 28]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //EDIT PAGO

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, db, datos, token, dataToken, archivo, obj, coleccionPago, arrayPagos, pagos, sumPrices, total, deuda, result, codigoPAG, codigoCOB;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            _context7.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context7.sent;
            datos = JSON.parse(req.body.data);
            token = req.headers['x-access-token'];

            if (token) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 8:
            _context7.next = 10;
            return (0, _jwt.verifyToken)(token);

          case 10:
            dataToken = _context7.sent;

            if (!(Object.entries(dataToken).length === 0)) {
              _context7.next = 13;
              break;
            }

            return _context7.abrupt("return", res.status(400).json({
              msg: _text_messages.ERROR_MESSAGE_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 13:
            archivo = {};
            if (req.file) archivo = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path,
              type: req.file.mimetype
            };
            obj = {};
            obj.id = datos.id;
            obj.fecha_pago = datos.fecha_pago;
            obj.hora_pago = datos.hora_pago;
            obj.sucursal = datos.sucursal;
            obj.tipo_pago = datos.tipo_pago;
            obj.monto = datos.monto;
            obj.descuento = datos.descuento;
            obj.total = datos.total;
            obj.observaciones = datos.observaciones;
            obj.institucion_bancaria = datos.institucion_bancaria;
            obj.archivo_adjunto = archivo; //1.- traigo la coleccion

            _context7.next = 29;
            return db.collection("pagos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 29:
            coleccionPago = _context7.sent;

            if (!coleccionPago) {
              _context7.next = 59;
              break;
            }

            arrayPagos = coleccionPago.pagos;
            pagos = arrayPagos.map(function (e) {
              if (e.id === obj.id) {
                e.fecha_pago = obj.fecha_pago;
                e.hora_pago = obj.hora_pago;
                e.sucursal = obj.sucursal;
                e.tipo_pago = obj.tipo_pago;
                e.monto = obj.monto;
                e.descuento = obj.descuento;
                e.total = obj.total;
                e.observaciones = obj.observaciones;
                e.institucion_bancaria = obj.institucion_bancaria;
                e.archivo_adjunto = obj.archivo_adjunto;
              }

              return e;
            }); //3.- sumo los totales de los pagos nuevamente

            sumPrices = function sumPrices(sumador, nextItem) {
              return sumador + nextItem.total;
            };

            total = pagos.reduce(sumPrices, 0);
            deuda = coleccionPago.valor_servicio - total; //4.- edito la coleccion de pagos

            _context7.next = 38;
            return db.collection("pagos").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                valor_cancelado: total,
                pagos: pagos
              }
            }, {
              returnOriginal: false
            });

          case 38:
            result = _context7.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace("PAG", "COB"); //--

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context7.next = 47;
              break;
            }

            _context7.next = 44;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 44:
            result = _context7.sent;
            _context7.next = 51;
            break;

          case 47:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context7.next = 51;
              break;
            }

            _context7.next = 50;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 50:
            result = _context7.sent;

          case 51:
            _context7.next = 53;
            return db.collection("cobranza").findOneAndUpdate({
              codigo: codigoCOB
            }, {
              $set: {
                valor_deuda: deuda,
                valor_cancelado: total
              }
            }, {
              returnOriginal: false
            });

          case 53:
            result = _context7.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context7.next = 58;
              break;
            }

            _context7.next = 57;
            return db.collection("cobranza").updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 57:
            result = _context7.sent;

          case 58:
            return _context7.abrupt("return", res.json(result));

          case 59:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //DELETE PAGO

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, pago, db, token, dataToken, coleccionPago, pagos, index, element, sumPrices, total, deuda, result, codigoPAG, codigoCOB;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            pago = JSON.parse(req.query.data);
            _context8.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context8.sent;
            token = req.headers['x-access-token'];

            if (token) {
              _context8.next = 8;
              break;
            }

            return _context8.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 8:
            _context8.next = 10;
            return (0, _jwt.verifyToken)(token);

          case 10:
            dataToken = _context8.sent;

            if (!(Object.entries(dataToken).length === 0)) {
              _context8.next = 13;
              break;
            }

            return _context8.abrupt("return", res.status(400).json({
              msg: _text_messages.ERROR_MESSAGE_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 13:
            _context8.next = 15;
            return db.collection("pagos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 15:
            coleccionPago = _context8.sent;
            pagos = coleccionPago.pagos;

            if (coleccionPago) {
              for (index = 0; index < pagos.length; index++) {
                element = pagos[index];

                if (element.id === pago.id) {
                  pagos.splice(index, 1);
                }
              }
            } //sumo los totales de los pagos nuevamente


            sumPrices = function sumPrices(sumador, nextItem) {
              return sumador + nextItem.total;
            };

            total = pagos.reduce(sumPrices, 0);
            deuda = coleccionPago.valor_servicio - total; //edito la coleccion de pagos

            _context8.next = 23;
            return db.collection("pagos").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                valor_cancelado: total,
                pagos: pagos
              }
            }, {
              returnOriginal: false
            });

          case 23:
            result = _context8.sent;
            //-- sacamos el codigo de pagos y lo transformamos a cobranza para buscar si existe
            codigoPAG = result.value.codigo;
            codigoCOB = codigoPAG.replace("PAG", "COB"); //--

            if (!(result.value.valor_cancelado > 0 && result.value.valor_cancelado < result.value.valor_servicio)) {
              _context8.next = 32;
              break;
            }

            _context8.next = 29;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pago Parcial"
              }
            });

          case 29:
            result = _context8.sent;
            _context8.next = 36;
            break;

          case 32:
            if (!(result.value.valor_cancelado === result.value.valor_servicio)) {
              _context8.next = 36;
              break;
            }

            _context8.next = 35;
            return db.collection("pagos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Pagado"
              }
            });

          case 35:
            result = _context8.sent;

          case 36:
            _context8.next = 38;
            return db.collection("cobranza").findOneAndUpdate({
              codigo: codigoCOB
            }, {
              $set: {
                valor_deuda: deuda,
                valor_cancelado: total
              }
            }, {
              returnOriginal: false
            });

          case 38:
            result = _context8.sent;

            if (!(result.value.valor_deuda === 0)) {
              _context8.next = 43;
              break;
            }

            _context8.next = 42;
            return db.collection("cobranza").updateOne({
              codigo: codigoCOB
            }, {
              $set: {
                estado: "Al Dia"
              }
            });

          case 42:
            result = _context8.sent;

          case 43:
            ;
            return _context8.abrupt("return", res.json(result));

          case 45:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); // ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("pagos")
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