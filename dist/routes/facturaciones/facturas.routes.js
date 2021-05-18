"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _changeToMiniscula = require("../../functions/changeToMiniscula");

var _getDateNow = require("../../functions/getDateNow");

var _calculateFechaPago = require("../../functions/calculateFechaPago");

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

var path = require("path");

var AWS = require('aws-sdk');

var fs = require("fs"); //database connection


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
            return db.collection("facturaciones").find({
              isActive: true
            }).toArray();

          case 5:
            result = _context.sent;
            _context.next = 8;
            return db.collection("empresa").findOne({});

          case 8:
            empresa = _context.sent;
            return _context.abrupt("return", res.json({
              datos: result,
              empresa: empresa
            }));

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
}());
router.get('/asis', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var db, empresa;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context2.sent;
            _context2.prev = 3;
            _context2.next = 6;
            return db.collection("empresa").findOne({});

          case 6:
            empresa = _context2.sent;
            return _context2.abrupt("return", res.status(200).json({
              empresa: empresa,
              err: null
            }));

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](3);
            return _context2.abrupt("return", res.status(500).json({
              empresa: null,
              err: String(_context2.t0)
            }));

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 10]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //-------------------------------------------------------MASSIVE LOAD

router.get("/getoc", /*#__PURE__*/function () {
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
            return db.collection('facturaciones').find({
              oc: 'Si',
              estado: 'Ingresado'
            }).toArray();

          case 6:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Facturaciones cargadas',
              res: result
            }));

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](0);
            console.log(_context3.t0);
            return _context3.abrupt("return", res.status(500).json({
              err: String(_context3.t0),
              msg: _text_messages.ERROR,
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
}());
router.get("/getconfirmoc", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context4.sent;
            _context4.next = 6;
            return db.collection('facturaciones').find({
              oc: 'Si',
              estado: 'En Revisión'
            }).toArray();

          case 6:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Facturaciones cargadas',
              res: result
            }));

          case 10:
            _context4.prev = 10;
            _context4.t0 = _context4["catch"](0);
            console.log(_context4.t0);
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
    }, _callee4, null, [[0, 10]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
router.get("/getinvoices", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            _context5.next = 6;
            return db.collection('facturaciones').find({
              estado: 'En Facturacion'
            }).toArray();

          case 6:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Facturaciones cargadas',
              res: result
            }));

          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);
            return _context5.abrupt("return", res.status(500).json({
              err: String(_context5.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 10]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //SELECT ONE 

router.get('/:id', /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, token, dataToken, result, empresa;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
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
            _context6.prev = 12;
            _context6.next = 15;
            return db.collection('facturaciones').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 15:
            result = _context6.sent;
            _context6.next = 18;
            return db.collection('empresa').findOne();

          case 18:
            empresa = _context6.sent;
            return _context6.abrupt("return", res.status(200).json({
              facturaciones: result,
              empresa: empresa
            }));

          case 22:
            _context6.prev = 22;
            _context6.t0 = _context6["catch"](12);
            return _context6.abrupt("return", res.status(500).json({
              msg: _text_messages.ERROR,
              error: _context6.t0
            }));

          case 25:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[12, 22]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countFac, empresa, result;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context7.sent;
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context7.prev = 5;
            _context7.next = 8;
            return db.collection("facturaciones").find({
              isActive: true
            }).count();

          case 8:
            countFac = _context7.sent;
            _context7.next = 11;
            return db.collection("empresa").findOne({});

          case 11:
            empresa = _context7.sent;
            _context7.next = 14;
            return db.collection("facturaciones").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context7.sent;
            return _context7.abrupt("return", res.status(200).json({
              // auth: AUTHORIZED,
              total_items: countFac,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countFac / nPerPage + 1),
              empresa: empresa,
              facturaciones: result
            }));

          case 18:
            _context7.prev = 18;
            _context7.t0 = _context7["catch"](5);
            return _context7.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              facturaciones: null,
              err: String(_context7.t0)
            }));

          case 21:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[5, 18]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //BUSCAR POR RUT O NOMBRE

router.post("/buscar", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countFac, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context8.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context8.sent;
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
            _context8.prev = 8;
            _context8.next = 11;
            return db.collection("facturaciones").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 11:
            countFac = _context8.sent;
            _context8.next = 14;
            return db.collection("facturaciones").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context8.sent;
            return _context8.abrupt("return", res.status(200).json({
              total_items: countFac,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countFac / nPerPage + 1),
              facturaciones: result
            }));

          case 18:
            _context8.prev = 18;
            _context8.t0 = _context8["catch"](8);
            return _context8.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              facturaciones: null
            }));

          case 21:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[8, 18]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //EDIT

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, db, factura, token, dataToken, result;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            _context9.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context9.sent;
            factura = JSON.parse(req.body.data);
            token = req.headers['x-access-token'];

            if (token) {
              _context9.next = 8;
              break;
            }

            return _context9.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 8:
            _context9.next = 10;
            return (0, _jwt.verifyToken)(token);

          case 10:
            dataToken = _context9.sent;

            if (!(Object.entries(dataToken).length === 0)) {
              _context9.next = 13;
              break;
            }

            return _context9.abrupt("return", res.status(400).json({
              msg: _text_messages.ERROR_MESSAGE_TOKEN,
              auth: _text_messages.UNAUTHOTIZED
            }));

          case 13:
            if (!(dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')) {
              _context9.next = 15;
              break;
            }

            return _context9.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN
            }));

          case 15:
            if (req.file) factura.url_file_adjunto = {
              name: req.file.originalname,
              size: req.file.size,
              path: req.file.path,
              type: req.file.mimetype
            };
            _context9.prev = 16;
            _context9.next = 19;
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

          case 19:
            result = _context9.sent;
            return _context9.abrupt("return", res.status(200).json({
              message: _text_messages.SUCCESSFULL_UPDATE,
              result: result
            }));

          case 23:
            _context9.prev = 23;
            _context9.t0 = _context9["catch"](16);
            return _context9.abrupt("return", res.status(500).json({
              msg: _text_messages.ERROR,
              error: _context9.t0
            }));

          case 26:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[16, 23]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //INSERTAR DATOS DE FACTURACION

router.post("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var id, db, datos, _archivo, obs, result, nombrePdf;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            id = req.params.id;
            _context10.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context10.sent;
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context10.prev = 5;
            _archivo = '';
            obs = {
              obs: datos.observacion_factura,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            };
            result = "";

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              _archivo = "Factura_".concat(datos.codigo, "_").concat((0, _uuid.v4)());
              setTimeout(function () {
                var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
                var params = {
                  Bucket: _var.AWS_BUCKET_NAME,
                  Body: fileContent,
                  Key: _archivo,
                  ContentType: 'application/pdf'
                };
                (0, _aws.uploadFileToS3)(params);
              }, 2000);
            }

            ;
            _context10.next = 13;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha_facturacion: datos.fecha_facturacion,
                estado_archivo: "Cargado",
                nro_factura: datos.nro_factura,
                archivo_factura: _archivo,
                monto_neto: datos.monto_neto,
                porcentaje_impuesto: datos.porcentaje_impuesto,
                valor_impuesto: datos.valor_impuesto,
                sub_total: datos.sub_total,
                exento: datos.exento,
                descuento: datos.descuento,
                total: datos.total,
                representante: datos.representante,
                razon_social_empresa: datos.razon_social_empresa,
                email_empresa: datos.email_empresa
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 13:
            result = _context10.sent;
            return _context10.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Factura cargada exitosamente',
              res: result
            }));

          case 17:
            _context10.prev = 17;
            _context10.t0 = _context10["catch"](5);
            return _context10.abrupt("return", res.status(500).json({
              err: String(_context10.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 20:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[5, 17]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //INSERTAR FACTURA MASIVO

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var db, datos, new_array, obs, result, _archivo2, nombrePdf;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context11.sent;
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context11.prev = 4;
            new_array = [];
            obs = {
              obs: datos[0].observacion_factura,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: 'Cargado'
            };
            result = "";
            datos[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _archivo2 = '';

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              _archivo2 = "INVOICE_GROUP_".concat(datos[0].nro_factura, "_").concat((0, _uuid.v4)());
              setTimeout(function () {
                var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
                var params = {
                  Bucket: _var.AWS_BUCKET_NAME,
                  Body: fileContent,
                  Key: _archivo2,
                  ContentType: 'application/pdf'
                };
                (0, _aws.uploadFileToS3)(params);
              }, 2000);
            }

            ;
            _context11.next = 14;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                fecha_facturacion: datos[0].fecha_facturacion,
                estado_archivo: "Cargado",
                nro_factura: datos[0].nro_factura,
                archivo_factura: _archivo2,
                monto_neto: datos[0].monto_neto,
                porcentaje_impuesto: datos[0].porcentaje_impuesto,
                valor_impuesto: datos[0].valor_impuesto,
                sub_total: datos[0].sub_total,
                exento: datos[0].exento,
                descuento: datos[0].descuento,
                total: datos[0].total,
                representante: datos[0].representante,
                razon_social_empresa: datos[0].razon_social_empresa,
                email_empresa: datos[0].email_empresa
              },
              $push: {
                observacion_factura: obs
              }
            });

          case 14:
            result = _context11.sent;
            return _context11.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Facturas cargas satisfactoriamente',
              res: result
            }));

          case 18:
            _context11.prev = 18;
            _context11.t0 = _context11["catch"](4);
            console.log(_context11.t0);
            return _context11.abrupt("return", res.status(500).json({
              err: String(_context11.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 22:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[4, 18]]);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}()); //SUBIR OC

router.post("/subiroc/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var id, db, datos, obs, _archivo3, nombrePdf, result;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            id = req.params.id;
            _context12.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context12.sent;
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            obs = {
              obs: datos.observacion_oc,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            }; // if (req.file) {
            //   archivo = {
            //     name: req.file.originalname,
            //     size: req.file.size,
            //     path: req.file.path,
            //     type: req.file.mimetype,
            //   };
            // }

            _context12.prev = 6;
            _archivo3 = '';

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              _archivo3 = "OC_".concat(datos.codigo, "_").concat((0, _uuid.v4)());
              setTimeout(function () {
                var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
                var params = {
                  Bucket: _var.AWS_BUCKET_NAME,
                  Body: fileContent,
                  Key: _archivo3,
                  ContentType: 'application/pdf'
                };
                (0, _aws.uploadFileToS3)(params);
              }, 2000);
            }

            ;
            _context12.next = 12;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                archivo_oc: _archivo3,
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

          case 12:
            result = _context12.sent;
            return _context12.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Orden de compra cargada',
              res: result
            }));

          case 16:
            _context12.prev = 16;
            _context12.t0 = _context12["catch"](6);
            console.log(_context12.t0);
            return _context12.abrupt("return", res.status(500).json({
              err: String(_context12.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 20:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[6, 16]]);
  }));

  return function (_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}()); //GET FILE FROM AWS S3

router.get('/downloadfile/:id/:type', /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(req, res) {
    var _req$params, id, type, db, evaluacion, pathPdf, s3;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _req$params = req.params, id = _req$params.id, type = _req$params.type;
            _context13.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context13.sent;
            _context13.prev = 4;
            _context13.next = 7;
            return db.collection('facturaciones').findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 7:
            evaluacion = _context13.sent;

            if (evaluacion) {
              _context13.next = 10;
              break;
            }

            return _context13.abrupt("return", res.status(500).json({
              err: 98,
              msg: NOT_EXISTS,
              res: null
            }));

          case 10:
            pathPdf = type === 'oc' ? evaluacion.archivo_oc : type === 'invoice' ? evaluacion.archivo_factura : '';
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
            _context13.next = 19;
            break;

          case 15:
            _context13.prev = 15;
            _context13.t0 = _context13["catch"](4);
            console.log(_context13.t0);
            return _context13.abrupt("return", res.status(500).json({
              err: String(_context13.t0),
              msg: 'Error al obtener archivo',
              res: null
            }));

          case 19:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[4, 15]]);
  }));

  return function (_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}()); //SUBIR OC MASIVO

router.post("/oc/subiroc/many", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(req, res) {
    var db, new_array, datos, obs, _archivo4, nombrePdf, result;

    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context14.sent;
            new_array = [];
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context14.prev = 5;
            obs = {};
            obs.obs = datos[0].observacion_oc;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";
            datos[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _archivo4 = '';

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              _archivo4 = "OC_GROUP_NRO_".concat(datos[0].nro_oc, "_").concat((0, _uuid.v4)());
              setTimeout(function () {
                var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
                var params = {
                  Bucket: _var.AWS_BUCKET_NAME,
                  Body: fileContent,
                  Key: _archivo4,
                  ContentType: 'application/pdf'
                };
                (0, _aws.uploadFileToS3)(params);
              }, 2000);
            }

            ;
            _context14.next = 16;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                archivo_oc: _archivo4,
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

          case 16:
            result = _context14.sent;
            return _context14.abrupt("return", res.status(200).json({
              err: null,
              msg: 'OC Subidas satisfactoriamente',
              res: result
            }));

          case 20:
            _context14.prev = 20;
            _context14.t0 = _context14["catch"](5);
            console.log(_context14.t0);
            return _context14.abrupt("return", res.status(500).json({
              err: String(_context14.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 24:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, null, [[5, 20]]);
  }));

  return function (_x27, _x28) {
    return _ref14.apply(this, arguments);
  };
}()); //CONFIRMAR OC

router.post("/confirmaroc/:id", /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(req, res) {
    var id, db, data, obs, estado, result;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            id = req.params.id;
            _context15.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context15.sent;
            data = req.body; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context15.prev = 5;
            obs = {
              obs: data.observacion_oc,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: data.estado_archivo
            };
            estado = "";
            data.estado_archivo == "Aprobado" ? estado = "En Facturacion" : estado = "Ingresado";
            _context15.next = 11;
            return db.collection("facturaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estado,
                estado_archivo: data.estado_archivo
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 11:
            result = _context15.sent;
            return _context15.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Orden de compra confirmada',
              res: result
            }));

          case 15:
            _context15.prev = 15;
            _context15.t0 = _context15["catch"](5);
            return _context15.abrupt("return", res.status(500).json({
              err: String(_context15.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 18:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[5, 15]]);
  }));

  return function (_x29, _x30) {
    return _ref15.apply(this, arguments);
  };
}()); //CONFIRMAR OC MASIVO

router.post("/oc/confirmaroc/many", /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(req, res) {
    var data, db, new_array, obs, estado, result;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            data = req.body; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context16.prev = 1;
            _context16.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context16.sent;
            new_array = [];
            obs = {
              obs: data[0].observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: data[0].estado_archivo
            };
            estado = data[0].estado_archivo == "Aprobado" ? 'En Facturacion' : 'Ingresado';
            data[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _context16.next = 11;
            return db.collection("facturaciones").updateMany({
              _id: {
                $in: new_array
              }
            }, {
              $set: {
                estado: estado,
                estado_archivo: data[0].estado_archivo
              },
              $push: {
                observacion_oc: obs
              }
            });

          case 11:
            result = _context16.sent;
            return _context16.abrupt("return", res.status(200).json({
              err: null,
              msg: 'OC confirmada satisfactoriamente',
              res: result
            }));

          case 15:
            _context16.prev = 15;
            _context16.t0 = _context16["catch"](1);
            console.log(_context16.t0);
            return _context16.abrupt("return", res.status(500).json({
              err: String(_context16.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 19:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[1, 15]]);
  }));

  return function (_x31, _x32) {
    return _ref16.apply(this, arguments);
  };
}()); // VALIDAR FACTURA

router.post("/validar/:id", /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(req, res) {
    var id, _req$body3, estado_archivo, observaciones, nro_nota_credito, fecha_nota_credito, monto_nota_credito, factura_anular, db, obs, estado, result, codAsis, gi, servicio, _db$collection$insert;

    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            id = req.params.id;
            _req$body3 = req.body, estado_archivo = _req$body3.estado_archivo, observaciones = _req$body3.observaciones, nro_nota_credito = _req$body3.nro_nota_credito, fecha_nota_credito = _req$body3.fecha_nota_credito, monto_nota_credito = _req$body3.monto_nota_credito, factura_anular = _req$body3.factura_anular;
            console.log(req.body);
            _context17.next = 5;
            return (0, _database.connect)();

          case 5:
            db = _context17.sent;
            _context17.prev = 6;
            obs = {
              obs: observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: estado_archivo
            };
            estado = "";
            estado_archivo == "Rechazado" ? estado = "En Facturacion" : estado = "Facturado";
            _context17.next = 12;
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

          case 12:
            result = _context17.sent;

            if (!(estado_archivo == "Aprobado")) {
              _context17.next = 27;
              break;
            }

            //insertar pago en modulo pago
            codAsis = result.value.codigo;
            _context17.next = 17;
            return db.collection("gi").findOne({
              rut: result.value.rut_cp,
              razon_social: result.value.razon_social_cp
            });

          case 17:
            gi = _context17.sent;
            _context17.next = 20;
            return db.collection("solicitudes").findOne({
              codigo: codAsis.replace("FAC", "SOL")
            });

          case 20:
            servicio = _context17.sent;
            _context17.next = 23;
            return db.collection("pagos").insertOne({
              codigo: codAsis.replace("FAC", "PAG"),
              nombre_servicio: result.value.nombre_servicio,
              id_GI_personalAsignado: result.value.id_GI_personalAsignado,
              faena_seleccionada_cp: result.value.faena_seleccionada_cp,
              // valor_servicio: result.value.valor_servicio,
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
              dias_credito: gi.dias_credito,
              valor_servicio: result.value.valor_servicio,
              valor_cancelado: 0,
              fecha_pago: (0, _calculateFechaPago.getFechaPago)(result.value.fecha_facturacion, Number(gi.dias_credito)),
              pagos: [],
              isActive: true
            });

          case 23:
            if (!((0, _changeToMiniscula.getMinusculas)(gi.credito) == "no")) {
              _context17.next = 27;
              break;
            }

            _context17.next = 26;
            return db.collection("cobranza").insertOne((_db$collection$insert = {
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
            }, _defineProperty(_db$collection$insert, "valor_servicio", result.value.valor_servicio), _defineProperty(_db$collection$insert, "valor_cancelado", 0), _defineProperty(_db$collection$insert, "valor_deuda", result.value.valor_servicio), _defineProperty(_db$collection$insert, "cartas_cobranza", []), _defineProperty(_db$collection$insert, "isActive", true), _db$collection$insert));

          case 26:
            result = _context17.sent;

          case 27:
            return _context17.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Factura confirmada',
              res: result
            }));

          case 30:
            _context17.prev = 30;
            _context17.t0 = _context17["catch"](6);
            return _context17.abrupt("return", res.status(500).json({
              err: String(_context17.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 33:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, null, [[6, 30]]);
  }));

  return function (_x33, _x34) {
    return _ref17.apply(this, arguments);
  };
}()); //VALIDAR FACTURA MASIVO

router.post("/validar/factura/asis/many", /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(req, res) {
    var db, estado, estadoArchivo, new_array, obs, result, resp, codigoAsis, arrayIDsCP, serviciosArray, arrayFacturaciones, GIs, gi, Servicios, servicio, resultPagos;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context18.sent;
            _context18.prev = 3;
            estado = "";
            estadoArchivo = "";
            new_array = [];
            estadoArchivo = req.body[0].estado_archivo;
            obs = {
              obs: req.body[0].observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: estadoArchivo
            };
            estadoArchivo == "Rechazado" ? estado = "En Facturacion" : estado = "Facturado";
            req.body[1].ids.forEach(function (element) {
              new_array.push((0, _mongodb.ObjectID)(element));
            });
            _context18.next = 13;
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

          case 13:
            result = _context18.sent;

            if (!(req.body[0].estado_archivo == "Aprobado")) {
              _context18.next = 44;
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
            _context18.next = 26;
            return db.collection("facturaciones").find({
              _id: {
                $in: new_array
              }
            }).toArray();

          case 26:
            resp = _context18.sent;
            resp.forEach(function (element) {
              arrayIDsCP.push(element.rut_cp.toString());
            });
            resp.forEach(function (element) {
              serviciosArray.push(element.codigo.replace("FAC", "SOL"));
            });
            _context18.next = 31;
            return db.collection("gi").find({
              rut: {
                $in: arrayIDsCP
              }
            }).toArray();

          case 31:
            GIs = _context18.sent;
            _context18.next = 34;
            return db.collection("solicitudes").find({
              codigo: {
                $in: serviciosArray
              }
            }).toArray();

          case 34:
            Servicios = _context18.sent;
            resp.forEach(function (element) {
              codigoAsis = element.codigo;
              codigoAsis = codigoAsis.replace("FAC", "PAG"); //- se busca el gi correspondiente

              gi = GIs.find(function (gi) {
                return gi.rut === element.rut_cp;
              }); //-
              //- se busca el servicio asociado

              servicio = Servicios.find(function (serv) {
                return serv.codigo.replace("SOL", "FAC").toString() === element.codigo;
              }); //-

              arrayFacturaciones.push({
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
                dias_credito: gi.dias_credito,
                // valor_servicio: Number(servicio.precio),
                valor_cancelado: 0,
                fecha_pago: (0, _calculateFechaPago.getFechaPago)(element.fecha_facturacion, Number(gi.dias_credito)),
                pagos: [],
                isActive: true
              });
            });
            _context18.next = 38;
            return db.collection("pagos").insertMany(arrayFacturaciones);

          case 38:
            resultPagos = _context18.sent;
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
                var _arrayFacturaciones$p;

                arrayFacturaciones.push((_arrayFacturaciones$p = {
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
                }, _defineProperty(_arrayFacturaciones$p, "valor_servicio", Number(servicio.precio)), _defineProperty(_arrayFacturaciones$p, "valor_cancelado", 0), _defineProperty(_arrayFacturaciones$p, "valor_deuda", Number(servicio.precio)), _defineProperty(_arrayFacturaciones$p, "cartas_cobranza", []), _defineProperty(_arrayFacturaciones$p, "isActive", true), _arrayFacturaciones$p));
              }
            });

            if (!(arrayFacturaciones.length > 0)) {
              _context18.next = 44;
              break;
            }

            _context18.next = 44;
            return db.collection("cobranza").insertMany(arrayFacturaciones);

          case 44:
            return _context18.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Facturas confirmadas satisfactoriamente',
              res: []
            }));

          case 47:
            _context18.prev = 47;
            _context18.t0 = _context18["catch"](3);
            console.log(_context18.t0);
            return _context18.abrupt("return", res.status(500).json({
              err: String(_context18.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 51:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[3, 47]]);
  }));

  return function (_x35, _x36) {
    return _ref18.apply(this, arguments);
  };
}()); // ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("facturaciones")
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