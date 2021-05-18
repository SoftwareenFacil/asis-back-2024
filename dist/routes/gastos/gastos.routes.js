"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _calculateExistencia = _interopRequireDefault(require("../../functions/calculateExistencia"));

var _getFinalToExistencia = _interopRequireDefault(require("../../functions/getFinalToExistencia"));

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _uuid = require("uuid");

var _aws = require("../../libs/aws");

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

var path = require("path");

var AWS = require('aws-sdk');

var fs = require("fs"); // SELECT


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
            return db.collection("gastos").find({}).toArray();

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
            return db.collection("gastos").findOne({
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
    var db, _req$body, pageNumber, nPerPage, skip_page, countGastos, _result;

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
            return db.collection("gastos").find().count();

          case 8:
            countGastos = _context3.sent;
            _context3.next = 11;
            return db.collection("gastos").find().skip(skip_page).limit(nPerPage).toArray();

          case 11:
            _result = _context3.sent;
            return _context3.abrupt("return", res.status(200).json({
              total_items: countGastos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGastos / nPerPage + 1),
              gastos: _result
            }));

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](5);
            return _context3.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              gastos: null,
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
}()); //SEARCH BY cateogy, subcategory 1 and subcategiry 2

router.post("/searchbycategory", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, _req$body2, category, subcategoryone, subcategorytwo, gasto;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            _req$body2 = req.body, category = _req$body2.category, subcategoryone = _req$body2.subcategoryone, subcategorytwo = _req$body2.subcategorytwo;
            _context4.prev = 4;
            _context4.next = 7;
            return db.collection("gastos").findOne({
              categoria_general: category,
              subcategoria_uno: subcategoryone,
              subcategoria_dos: subcategorytwo
            });

          case 7:
            gasto = _context4.sent;

            if (gasto) {
              _context4.next = 10;
              break;
            }

            return _context4.abrupt("return", res.status(200).json({
              err: 98,
              msg: 'Gasto no encontrado',
              res: []
            }));

          case 10:
            console.log(gasto);
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Gasto gasto encontrado',
              res: gasto
            }));

          case 14:
            _context4.prev = 14;
            _context4.t0 = _context4["catch"](4);
            console.log(_context4.t0);
            return _context4.abrupt("return", res.status(500).json({
              err: String(_context4.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[4, 14]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //GET FILE FROM AWS S3

router.get('/downloadfile/:id/', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, gasto, pathPdf, s3;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            id = req.params.id;
            _context5.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context5.sent;
            _context5.prev = 4;
            _context5.next = 7;
            return db.collection('gastos').findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 7:
            gasto = _context5.sent;

            if (gasto) {
              _context5.next = 10;
              break;
            }

            return _context5.abrupt("return", res.status(500).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 10:
            pathPdf = gasto.archivo_adjunto;
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
            _context5.next = 19;
            break;

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](4);
            console.log(_context5.t0);
            return _context5.abrupt("return", res.status(500).json({
              err: String(_context5.t0),
              msg: 'Error al obtener archivo',
              res: null
            }));

          case 19:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[4, 15]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //BUSCAR POR RUT O NOMBRE

router.post("/buscar", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var _req$body3, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countGastos;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _req$body3 = req.body, identificador = _req$body3.identificador, filtro = _req$body3.filtro, headFilter = _req$body3.headFilter, pageNumber = _req$body3.pageNumber, nPerPage = _req$body3.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context6.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context6.sent;
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context6.prev = 8;
            _context6.next = 11;
            return db.collection("gastos").find(_defineProperty({}, headFilter, rexExpresionFiltro)).count();

          case 11:
            countGastos = _context6.sent;
            _context6.next = 14;
            return db.collection("gastos").find(_defineProperty({}, headFilter, rexExpresionFiltro)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context6.sent;
            return _context6.abrupt("return", res.status(200).json({
              total_items: countGastos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGastos / nPerPage + 1),
              gastos: result
            }));

          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6["catch"](8);
            return _context6.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              gastos: null,
              err: String(_context6.t0)
            }));

          case 21:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[8, 18]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //INSERT GASTO

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var db, datos, newGasto, archivo, items, nombrePdf, _result2;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context7.sent;
            datos = JSON.parse(req.body.data);
            _context7.prev = 4;
            newGasto = {};
            archivo = '';
            _context7.next = 9;
            return db.collection("gastos").find({}).toArray();

          case 9:
            items = _context7.sent;

            if (items.length > 0) {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-00001");
            }

            ;

            if (req.file) {
              nombrePdf = _var.OTHER_NAME_PDF;
              archivo = "GASTO_".concat(newGasto.codigo, "_").concat((0, _uuid.v4)());
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
            newGasto.fecha = datos.fecha;
            newGasto.fecha_registro = datos.fecha_registro;
            newGasto.categoria_general = datos.categoria_general;
            newGasto.subcategoria_uno = datos.subcategoria_uno;
            newGasto.subcategoria_dos = datos.subcategoria_dos;
            newGasto.descripcion_gasto = datos.descripcion_gasto;
            newGasto.id_proveedor = datos.id_proveedor;
            newGasto.rut_proveedor = datos.rut_proveedor;
            newGasto.categoria_proveedor = datos.categoria_proveedor;
            newGasto.razon_social_proveedor = datos.razon_social_proveedor;
            newGasto.requiere_servicio = datos.requiere_servicio;
            newGasto.id_servicio = datos.id_servicio;
            newGasto.servicio = datos.servicio;
            newGasto.tipo_registro = datos.tipo_registro;
            newGasto.tipo_documento = datos.tipo_documento;
            newGasto.nro_documento = datos.nro_documento;
            newGasto.medio_pago = datos.medio_pago;
            newGasto.institucion_bancaria = datos.institucion_bancaria;
            newGasto.inventario = datos.inventario;
            newGasto.cantidad_factor = datos.cantidad_factor;
            newGasto.precio_unitario = datos.precio_unitario;
            newGasto.monto_neto = datos.monto_neto;
            newGasto.impuesto = datos.impuesto;
            newGasto.exento = datos.exento;
            newGasto.total = datos.total;
            newGasto.observaciones = datos.observaciones;
            newGasto.archivo_adjunto = archivo;
            newGasto.entradas = [];
            _context7.next = 44;
            return db.collection("gastos").insertOne(newGasto);

          case 44:
            _result2 = _context7.sent;

            if (!((datos.categoria_general === "Mano de Obra Directa" || datos.categoria_general === "Gastos Generales") && (datos.subcategoria_uno === "Personal" || datos.subcategoria_uno === "Gastos Indirectos"))) {
              _context7.next = 48;
              break;
            }

            _context7.next = 48;
            return db.collection("empleados").updateOne({
              rut: datos.rut_proveedor,
              categoria: datos.categoria
            }, {
              $push: {
                detalle_pagos: {
                  codigo: newGasto.codigo,
                  fecha: datos.fecha,
                  categoria_general: datos.categoria_general,
                  subcategoria_uno: datos.subcategoria_uno,
                  subcategoria_dos: datos.subcategoria_dos,
                  tipo_registro: datos.tipo_registro,
                  medio_pago: datos.medio_pago,
                  institucion_bancaria: datos.institucion_bancaria,
                  monto_total: datos.total,
                  archivo_adjunto: archivo
                }
              }
            });

          case 48:
            return _context7.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Gasto ingresado correctamente',
              res: _result2
            }));

          case 51:
            _context7.prev = 51;
            _context7.t0 = _context7["catch"](4);
            return _context7.abrupt("return", res.status(500).json({
              err: String(_context7.t0),
              msg: _text_messages.ERROR,
              res: result
            }));

          case 54:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[4, 51]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //INSERT ENTRADA AND EDIT PREXISTENCIA

router.post("/entrada/:id", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, db, data, result, objInsert;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _context8.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context8.sent;
            data = req.body;
            result = "";
            _context8.prev = 6;
            _context8.next = 9;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                entradas: data
              }
            });

          case 9:
            result = _context8.sent;
            _context8.next = 12;
            return db.collection("prexistencia").find({
              id: id
            }).toArray();

          case 12:
            result = _context8.sent;

            if (!(result.length > 0)) {
              _context8.next = 25;
              break;
            }

            if (!(data.length > 0)) {
              _context8.next = 20;
              break;
            }

            _context8.next = 17;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: data
              }
            });

          case 17:
            result = _context8.sent;
            _context8.next = 23;
            break;

          case 20:
            _context8.next = 22;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 22:
            result = _context8.sent;

          case 23:
            _context8.next = 30;
            break;

          case 25:
            if (!(data.length > 0)) {
              _context8.next = 30;
              break;
            }

            objInsert = {
              id: id,
              tipo: "entrada",
              datos: data
            };
            _context8.next = 29;
            return db.collection("prexistencia").insertOne(objInsert);

          case 29:
            result = _context8.sent;

          case 30:
            _context8.next = 32;
            return db.collection("prexistencia").find({}).toArray();

          case 32:
            result = _context8.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context8.next = 37;
            return db.collection("existencia").deleteMany({});

          case 37:
            _context8.next = 39;
            return db.collection("existencia").insertMany(result);

          case 39:
            result = _context8.sent;
            return _context8.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Entrada ingresada correctamente',
              res: result
            }));

          case 43:
            _context8.prev = 43;
            _context8.t0 = _context8["catch"](6);
            return _context8.abrupt("return", res.status(5001).json({
              err: String(err),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 46:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[6, 43]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //EDIT GASTO

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, gasto, db, _result3;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            gasto = JSON.parse(req.body.data);
            _context9.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context9.sent;

            if (req.file) {
              gasto.archivo_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context9.prev = 6;
            _context9.next = 9;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                fecha: gasto.fecha,
                categoria_general: gasto.categoria_general,
                subcategoria_uno: gasto.subcategoria_uno,
                subcategoria_dos: gasto.subcategoria_dos,
                descripcion_gasto: gasto.descripcion_gasto,
                id_proveedor: gasto.id_proveedor,
                rut_proveedor: gasto.rut_proveedor,
                razon_social_proveedor: gasto.razon_social_proveedor,
                requiere_servicio: gasto.requiere_servicio,
                id_servicio: gasto.id_servicio,
                servicio: gasto.servicio,
                tipo_registro: gasto.tipo_registro,
                tipo_documento: gasto.tipo_documento,
                nro_documento: gasto.nro_documento,
                medio_pago: gasto.medio_pago,
                institucion_bancaria: gasto.institucion_bancaria,
                inventario: gasto.inventario,
                cantidad_factor: gasto.cantidad_factor,
                precio_unitario: gasto.precio_unitario,
                monto_neto: gasto.monto_neto,
                impuesto: gasto.impuesto,
                monto_exento: gasto.monto_exento,
                monto_total: gasto.monto_total,
                observaciones: gasto.observaciones,
                archivo_adjunto: gasto.archivo_adjunto
              }
            });

          case 9:
            _result3 = _context9.sent;
            return _context9.abrupt("return", res.status(201).json({
              message: "Gasto modificado correctamente",
              result: _result3
            }));

          case 13:
            _context9.prev = 13;
            _context9.t0 = _context9["catch"](6);
            return _context9.abrupt("return", res.status(500).json({
              message: "ha ocurrido un error",
              error: _context9.t0
            }));

          case 16:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[6, 13]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //DELETE GASTO

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var id, db, result, coleccionGasto, entradas;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            id = req.params.id;
            _context10.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context10.sent;
            result = "";
            _context10.prev = 5;
            _context10.next = 8;
            return db.collection("gastos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 8:
            coleccionGasto = _context10.sent;
            entradas = coleccionGasto.entradas; //2.- elimino el gasto

            _context10.next = 12;
            return db.collection("gastos").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 12:
            result = _context10.sent;
            _context10.next = 15;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 15:
            result = _context10.sent;
            _context10.next = 18;
            return db.collection("prexistencia").find({}).toArray();

          case 18:
            result = _context10.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context10.next = 23;
            return db.collection("existencia").deleteMany({});

          case 23:
            _context10.next = 25;
            return db.collection("existencia").insertMany(result);

          case 25:
            result = _context10.sent;
            return _context10.abrupt("return", res.json(result));

          case 29:
            _context10.prev = 29;
            _context10.t0 = _context10["catch"](5);
            return _context10.abrupt("return", res.status(401).json({
              msg: "ha ocurrido un error",
              error: _context10.t0
            }));

          case 32:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[5, 29]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //DELETE ENTRADAS

router["delete"]("/entrada/:id", /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var id, entrada, db, result, coleccionGasto, entradas, index, element, datos, _index, _element;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            id = req.params.id;
            entrada = req.body;
            _context11.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context11.sent;
            result = ""; //1.- traigo la coleccion

            _context11.next = 8;
            return db.collection("gastos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 8:
            coleccionGasto = _context11.sent;
            entradas = coleccionGasto.entradas;

            if (coleccionGasto) {
              for (index = 0; index < entradas.length; index++) {
                element = entradas[index];

                if (element.id === entrada.id) {
                  entradas.splice(index, 1);
                }
              }
            }

            _context11.prev = 11;
            _context11.next = 14;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                entradas: entradas
              }
            });

          case 14:
            result = _context11.sent;
            _context11.next = 17;
            return db.collection("prexistencia").findOne({
              id: id
            });

          case 17:
            result = _context11.sent;

            if (!result) {
              _context11.next = 30;
              break;
            }

            datos = result.datos;

            for (_index = 0; _index < datos.length; _index++) {
              _element = datos[_index];

              if (_element.id === entrada.id) {
                datos.splice(_index, 1);
              }
            }

            if (!(datos.length > 0)) {
              _context11.next = 27;
              break;
            }

            _context11.next = 24;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: datos
              }
            });

          case 24:
            result = _context11.sent;
            _context11.next = 30;
            break;

          case 27:
            _context11.next = 29;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 29:
            result = _context11.sent;

          case 30:
            _context11.next = 32;
            return db.collection("prexistencia").find({}).toArray();

          case 32:
            result = _context11.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context11.next = 37;
            return db.collection("existencia").deleteMany({});

          case 37:
            _context11.next = 39;
            return db.collection("existencia").insertMany(result);

          case 39:
            result = _context11.sent;
            return _context11.abrupt("return", res.json(result));

          case 43:
            _context11.prev = 43;
            _context11.t0 = _context11["catch"](11);
            return _context11.abrupt("return", res.status(400).json(_context11.t0));

          case 46:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[11, 43]]);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;