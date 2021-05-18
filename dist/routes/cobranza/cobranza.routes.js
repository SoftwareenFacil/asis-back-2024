"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _carta_cobranza = _interopRequireDefault(require("../../libs/html-pdf/carta_cobranza.js"));

var _qrcode = _interopRequireDefault(require("qrcode"));

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
            return db.collection("cobranza").find({
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
            return db.collection('cobranza').findOne({
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
}()); //TEST CREACION DE PDF PARA ENVIO POR CORREO

router.get("/pdf", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var fs, pdf, options, generateQR, body, completeText;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            fs = require("fs");
            pdf = require("html-pdf"); // var html = fs.readFileSync(TextoCarta('ASIS-2020-SOL-00001 MARIO CASANOVA RAMIREZ'), 'utf8');

            options = {
              format: "Letter"
            };
            _context3.prev = 3;
            _context3.next = 6;
            return _qrcode["default"].toDataURL('text');

          case 6:
            generateQR = _context3.sent;
            body = (0, _carta_cobranza["default"])();
            completeText = "".concat(body, "<img src=\"").concat(generateQR, "\" width=\"150\" height=\"150\" align=\"center\">");
            pdf.create(completeText, options).toFile("uploads/salida.pdf", function (err, res) {
              if (err) {
                console.log(err);
              } else {
                console.log(res);
              }
            });
            return _context3.abrupt("return", res.status(201).json({
              msg: 'Codigo creado satisfactoriamente',
              code: codeQR
            }));

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](3);
            return _context3.abrupt("return", res.status(400).json({
              msg: _context3.t0
            }));

          case 16:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 13]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //SELECT WITH PAGINATION

router.post('/pagination', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, countCobranza, result;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context4.prev = 5;
            _context4.next = 8;
            return db.collection("cobranza").find({
              isActive: true
            }).count();

          case 8:
            countCobranza = _context4.sent;
            _context4.next = 11;
            return db.collection("cobranza").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).toArray();

          case 11:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              total_items: countCobranza,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countCobranza / nPerPage + 1),
              cobranzas: result
            }));

          case 15:
            _context4.prev = 15;
            _context4.t0 = _context4["catch"](5);
            return _context4.abrupt("return", res.status(500).status(501).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 1,
              cobranzas: null,
              err: String(_context4.t0)
            }));

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[5, 15]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //SELECT POR RUT Y RAZONS SOCIAL

router.post('/buscar', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countCobranza, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context5.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context5.sent;
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            }

            ;
            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context5.prev = 9;
            _context5.next = 12;
            return db.collection("cobranza").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 12:
            countCobranza = _context5.sent;
            _context5.next = 15;
            return db.collection("cobranza").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 15:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).json({
              total_items: countCobranza,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countCobranza / nPerPage + 1),
              cobranzas: result
            }));

          case 19:
            _context5.prev = 19;
            _context5.t0 = _context5["catch"](9);
            return _context5.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              cobranzas: null,
              err: String(_context5.t0)
            }));

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[9, 19]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); // router.post("/buscar", async (req, res) => {
//   const { rutcp, tipocliente } = req.body;
//   const db = await connect();
//   const result = await db
//     .collection("cobranza")
//     .find({ rut_cp: rutcp, categoria_cliente: tipocliente })
//     .toArray();
//   res.json(result);
// });

router.post("/envio/:id", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var id, db, obj, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            _context6.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context6.sent;
            obj = {};
            obj.fecha_creacion_carta = req.body.fecha_creacion_carta;
            obj.hora_creacion_carta = req.body.hora_creacion_carta;
            obj.fecha_envio_carta = req.body.fecha_envio_carta;
            obj.hora_envio_carta = req.body.hora_envio_carta;
            obj.observacion = req.body.observacion;
            obj.estado = "Enviado";
            _context6.next = 13;
            return db.collection("cobranza").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "En Cobranza"
              },
              $push: {
                cartas_cobranza: obj
              }
            });

          case 13:
            result = _context6.sent;
            return _context6.abrupt("return", res.json(result));

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); // router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("cobranza")
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