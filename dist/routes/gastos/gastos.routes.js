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

var _database = require("../../database");

var _mongodb = require("mongodb");

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();
var YEAR = (0, _getYearActual.getYear)(); //database connection

// SELECT
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
            return db.collection("gastos").findOne({
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
    var db, _req$body, pageNumber, nPerPage, skip_page, countGastos, result;

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
            result = _context3.sent;
            res.json({
              total_items: countGastos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGastos / nPerPage + 1),
              gastos: result
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

router.post("/buscar", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var _req$body2, identificador, filtro, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countGastos;

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
            return db.collection("gastos").find({
              rut_proveedor: rexExpresionFiltro
            }).count();

          case 11:
            countGastos = _context4.sent;
            _context4.next = 14;
            return db.collection("gastos").find({
              rut_proveedor: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context4.sent;
            _context4.next = 23;
            break;

          case 17:
            _context4.next = 19;
            return db.collection("gastos").find({
              razon_social_proveedor: rexExpresionFiltro
            }).count();

          case 19:
            countGastos = _context4.sent;
            _context4.next = 22;
            return db.collection("gastos").find({
              razon_social_proveedor: rexExpresionFiltro
            }).skip(skip_page).limit(nPerPage).toArray();

          case 22:
            result = _context4.sent;

          case 23:
            res.json({
              total_items: countGastos,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countGastos / nPerPage + 1),
              gastos: result
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
}()); //INSERT GASTO

router.post("/", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var db, datos, newGasto, archivo, items, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context5.sent;
            datos = JSON.parse(req.body.data);
            newGasto = {};
            archivo = {};
            _context5.next = 8;
            return db.collection("gastos").find({}).toArray();

          case 8:
            items = _context5.sent;

            if (items.length > 0) {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-").concat((0, _NewCode.calculate)(items[items.length - 1]));
            } else {
              newGasto.codigo = "ASIS-GTS-".concat(YEAR, "-00001");
            }

            if (req.file) {
              archivo = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            newGasto.fecha = datos.fecha;
            newGasto.fecha_registro = datos.fecha_registro;
            newGasto.categoria_general = datos.categoria_general;
            newGasto.subcategoria_uno = datos.subcategoria_uno;
            newGasto.subcategoria_dos = datos.subcategoria_dos;
            newGasto.descripcion_gasto = datos.descripcion_gasto;
            newGasto.id_proveedor = datos.id_proveedor;
            newGasto.rut_proveedor = datos.rut_proveedor;
            newGasto.categoria_proveedor = datos.categoria;
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
            newGasto.monto_exento = datos.monto_exento;
            newGasto.monto_total = datos.monto_total;
            newGasto.observaciones = datos.observaciones;
            newGasto.archivo_adjunto = archivo;
            newGasto.entradas = [];
            _context5.next = 41;
            return db.collection("gastos").insertOne(newGasto);

          case 41:
            result = _context5.sent;

            if (!((datos.categoria_general === "Mano de Obra Directa" || datos.categoria_general === "Gastos Generales") && (datos.subcategoria_uno === "Personal" || datos.subcategoria_uno === "Gastos Indirectos"))) {
              _context5.next = 45;
              break;
            }

            _context5.next = 45;
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
                  monto_total: datos.monto_total,
                  archivo_adjunto: archivo
                }
              }
            });

          case 45:
            res.json(result);

          case 46:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //INSERT ENTRADA AND EDIT PREXISTENCIA

router.post("/entrada/:id", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, entrada, result, objInsert;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            entrada = req.body; // entrada.id = v4();

            result = "";
            _context6.prev = 6;
            _context6.next = 9;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                entradas: entrada.entradas // entradas: {
                //   id: entrada.id,
                //   nombre_proveedor: entrada.nombre_proveedor,
                //   categoria_general: entrada.categoria_general,
                //   subcategoria_uno: entrada.subcategoria_uno,
                //   subcategoria_dos: entrada.subcategoria_dos,
                //   subcategoria_tres: entrada.subcategoria_tres,
                //   codigo_categoria_tres: entrada.codigo_categoria_tres,
                //   cant_maxima_categoria_tres: entrada.cant_maxima_categoria_tres,
                //   detalle: entrada.detalle,
                //   cantidad: entrada.cantidad,
                //   porcentaje_impuesto: entrada.porcentaje_impuesto,
                //   valor_impuesto: entrada.valor_impuesto,
                //   costo_unitario: entrada.costo_unitario,
                //   costo_total: entrada.costo_total
                // },

              }
            });

          case 9:
            result = _context6.sent;
            _context6.next = 12;
            return db.collection("prexistencia").find({
              id: id
            }).toArray();

          case 12:
            result = _context6.sent;

            if (!(result.length > 0)) {
              _context6.next = 25;
              break;
            }

            if (!entrada.entradas) {
              _context6.next = 20;
              break;
            }

            _context6.next = 17;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: entrada.entradas
              }
            });

          case 17:
            result = _context6.sent;
            _context6.next = 23;
            break;

          case 20:
            _context6.next = 22;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 22:
            result = _context6.sent;

          case 23:
            _context6.next = 30;
            break;

          case 25:
            if (!entrada.entradas) {
              _context6.next = 30;
              break;
            }

            objInsert = {
              id: id,
              tipo: "entrada",
              datos: [entrada.entradas]
            };
            _context6.next = 29;
            return db.collection("prexistencia").insertOne(objInsert);

          case 29:
            result = _context6.sent;

          case 30:
            _context6.next = 32;
            return db.collection("prexistencia").find({}).toArray();

          case 32:
            result = _context6.sent;
            console.log("resultado", result);
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context6.next = 38;
            return db.collection("existencia").deleteMany({});

          case 38:
            _context6.next = 40;
            return db.collection("existencia").insertMany(result);

          case 40:
            result = _context6.sent;
            res.status(200).json(result);
            _context6.next = 47;
            break;

          case 44:
            _context6.prev = 44;
            _context6.t0 = _context6["catch"](6);
            res.status(400).json({
              msg: "ha ocurrido un error",
              error: _context6.t0
            });

          case 47:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[6, 44]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //EDIT GASTO

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var id, gasto, db, result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            gasto = JSON.parse(req.body.data);
            _context7.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context7.sent;

            if (req.file) {
              gasto.archivo_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context7.prev = 6;
            _context7.next = 9;
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
            result = _context7.sent;
            res.status(201).json({
              message: "Gasto modificado correctamente",
              result: result
            });
            _context7.next = 16;
            break;

          case 13:
            _context7.prev = 13;
            _context7.t0 = _context7["catch"](6);
            res.status(500).json({
              message: "ha ocurrido un error",
              error: _context7.t0
            });

          case 16:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[6, 13]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //EDIT ENTRADA AND EDIT PREXISTENCIA
// router.put("/entrada/:id", multer.single("archivo"), async (req, res) => {
//   const { id } = req.params;
//   const entrada = JSON.parse(req.body.data);
//   const db = await connect();
//   let result = "";
//   if (req.file) {
//     entrada.archivo = {
//       name: req.file.originalname,
//       size: req.file.size,
//       path: req.file.path,
//       type: req.file.mimetype,
//     };
//   }
//   try {
//     const gasto = await db.collection("gastos").findOne({ _id: ObjectID(id) });
//     const arrayEntradas = gasto.entradas;
//     const entradas = arrayEntradas.map(function (e) {
//       if (e.id === entrada.id) {
//         e.nombre_proveedor = entrada.nombre_proveedor;
//         e.categoria_general = entrada.categoria_general;
//         e.subcategoria_uno = entrada.subcategoria_uno;
//         e.subcategoria_dos = entrada.subcategoria_dos;
//         e.subcategoria_tres = entrada.subcategoria_tres;
//         e.codigo_categoria_tres = entrada.codigo_categoria_tres;
//         e.cant_maxima_categoria_tres = entrada.cant_maxima_categoria_tres;
//         e.detalle = entrada.detalle;
//         e.cantidad = entrada.cantidad;
//         e.porcentaje_impuesto = entrada.porcentaje_impuesto;
//         e.valor_impuesto = entrada.valor_impuesto;
//         e.costo_unitario = entrada.costo_unitario;
//         e.costo_total = entrada.costo_total;
//         e.archivo_adjunto = entrada.archivo;
//       }
//       return e;
//     });
//     result = await db.collection("gastos").findOneAndUpdate(
//       { _id: ObjectID(id) },
//       {
//         $set: {
//           entradas: entradas,
//         },
//       }
//     );
//     result = await db.collection("prexistencia").find({ id: id }).toArray();
//     if (result.length > 0) {
//       if (entrada) {
//         result = await db.collection("prexistencia").findOne({ id: id });
//         if (result) {
//           let datos = result.datos;
//           datos.map(function (e) {
//             if (e.id === entrada.id) {
//               e.nombre_proveedor = entrada.nombre_proveedor;
//               e.categoria_general = entrada.categoria_general;
//               e.subcategoria_uno = entrada.subcategoria_uno;
//               e.subcategoria_dos = entrada.subcategoria_dos;
//               e.subcategoria_tres = entrada.subcategoria_tres;
//               e.codigo_categoria_tres = entrada.codigo_categoria_tres;
//               e.cant_maxima_categoria_tres = entrada.cant_maxima_categoria_tres;
//               e.detalle = entrada.detalle;
//               e.cantidad = entrada.cantidad;
//               e.porcentaje_impuesto = entrada.porcentaje_impuesto;
//               e.valor_impuesto = entrada.valor_impuesto;
//               e.costo_unitario = entrada.costo_unitario;
//               e.costo_total = entrada.costo_total;
//             }
//           });
//           result = await db.collection("prexistencia").updateOne(
//             { id: id },
//             {
//               $set: {
//                 datos: datos,
//               },
//             }
//           );
//         }
//       } else {
//         result = await db.collection("prexistencia").deleteOne({ id: id });
//       }
//     }
//     // else {
//     //   if (entrada.length > 0) {
//     //     let objInsert = {
//     //       id: id,
//     //       tipo: "entrada",
//     //       datos: entrada.entradas,
//     //     };
//     //     result = await db.collection("prexistencia").insertOne(objInsert);
//     //   }
//     // }
//     result = await db.collection("prexistencia").find({}).toArray();
//     result = calculateExistencia(result);
//     result = getFinalExistencia(result);
//     //limpiar existencia a 0 para recargarla con los nuevos datos
//     await db.collection("existencia").deleteMany({});
//     //insertar cada objeto como document en collection existencia
//     result = await db.collection("existencia").insertMany(result);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(501).json({ msg: "Ha ocurrido un error", error });
//   }
// });
//DELETE GASTO

router["delete"]("/:id", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, db, result, coleccionGasto, entradas;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _context8.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context8.sent;
            result = "";
            _context8.prev = 5;
            _context8.next = 8;
            return db.collection("gastos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 8:
            coleccionGasto = _context8.sent;
            entradas = coleccionGasto.entradas; //2.- elimino el gasto

            _context8.next = 12;
            return db.collection("gastos").deleteOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 12:
            result = _context8.sent;
            _context8.next = 15;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 15:
            result = _context8.sent;
            _context8.next = 18;
            return db.collection("prexistencia").find({}).toArray();

          case 18:
            result = _context8.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context8.next = 23;
            return db.collection("existencia").deleteMany({});

          case 23:
            _context8.next = 25;
            return db.collection("existencia").insertMany(result);

          case 25:
            result = _context8.sent;
            res.json(result);
            _context8.next = 32;
            break;

          case 29:
            _context8.prev = 29;
            _context8.t0 = _context8["catch"](5);
            res.status(401).json({
              msg: "ha ocurrido un error",
              error: _context8.t0
            });

          case 32:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[5, 29]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //DELETE ENTRADAS

router["delete"]("/entrada/:id", /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, entrada, db, result, coleccionGasto, entradas, index, element, datos, _index, _element;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            entrada = req.body;
            _context9.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context9.sent;
            result = ""; //1.- traigo la coleccion

            _context9.next = 8;
            return db.collection("gastos").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 8:
            coleccionGasto = _context9.sent;
            entradas = coleccionGasto.entradas;

            if (coleccionGasto) {
              for (index = 0; index < entradas.length; index++) {
                element = entradas[index];

                if (element.id === entrada.id) {
                  entradas.splice(index, 1);
                }
              }
            }

            _context9.prev = 11;
            _context9.next = 14;
            return db.collection("gastos").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                entradas: entradas
              }
            });

          case 14:
            result = _context9.sent;
            _context9.next = 17;
            return db.collection("prexistencia").findOne({
              id: id
            });

          case 17:
            result = _context9.sent;

            if (!result) {
              _context9.next = 30;
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
              _context9.next = 27;
              break;
            }

            _context9.next = 24;
            return db.collection("prexistencia").updateOne({
              id: id
            }, {
              $set: {
                datos: datos
              }
            });

          case 24:
            result = _context9.sent;
            _context9.next = 30;
            break;

          case 27:
            _context9.next = 29;
            return db.collection("prexistencia").deleteOne({
              id: id
            });

          case 29:
            result = _context9.sent;

          case 30:
            _context9.next = 32;
            return db.collection("prexistencia").find({}).toArray();

          case 32:
            result = _context9.sent;
            result = (0, _calculateExistencia["default"])(result);
            result = (0, _getFinalToExistencia["default"])(result); //limpiar existencia a 0 para recargarla con los nuevos datos

            _context9.next = 37;
            return db.collection("existencia").deleteMany({});

          case 37:
            _context9.next = 39;
            return db.collection("existencia").insertMany(result);

          case 39:
            result = _context9.sent;
            res.json(result);
            _context9.next = 46;
            break;

          case 43:
            _context9.prev = 43;
            _context9.t0 = _context9["catch"](11);
            res.status(400).json(_context9.t0);

          case 46:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[11, 43]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;