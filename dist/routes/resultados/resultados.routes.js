"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _NewCode = require("../../functions/NewCode");

var _getYearActual = require("../../functions/getYearActual");

var _fechaVencExamen = require("../../functions/fechaVencExamen");

var _getDateNow = require("../../functions/getDateNow");

var _getEspecificDate = require("../../functions/getEspecificDate");

var _database = require("../../database");

var _mongodb = require("mongodb");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)(); //database connection

//SELECT
router.get('/', /*#__PURE__*/function () {
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
            return db.collection('resultados').find({}).toArray();

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
}()); //SUBIR ARCHIVO RESUILTADO

router.post('/subir/:id', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var id, db, obs, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            id = req.params.id;
            _context2.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context2.sent;
            obs = {};
            obs.obs = req.body.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date());
            obs.estado = "Cargado";
            _context2.next = 10;
            return db.collection('resultados').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado_archivo: "Cargado",
                archivo_resultado: req.body.archivo_resultado
              },
              $push: {
                observaciones: obs
              }
            });

          case 10:
            result = _context2.sent;
            res.json(result);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //confirmar resultado

router.post('/confirmar/:id', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var id, db, result, obs, codAsis, gi, isOC, estado_archivo, estado;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            _context3.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context3.sent;
            result = "";
            obs = {};
            obs.obs = req.body.observaciones;
            obs.fecha = (0, _getDateNow.getDate)(new Date()); // console.log('datos chalo', req.body)

            if (!(req.body.estado_resultado == 'Aprobado')) {
              _context3.next = 33;
              break;
            }

            obs.estado = req.body.estado_archivo;

            if (!(req.body.estado_resultado == 'Aprobado con Obs' || req.body.estado_resultado == 'Aprobado')) {
              _context3.next = 16;
              break;
            }

            _context3.next = 13;
            return db.collection('resultados').findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Revisado",
                estado_archivo: req.body.estado_archivo,
                estado_resultado: req.body.estado_resultado,
                vigencia_examen: req.body.vigencia_examen,
                fecha_resultado: req.body.fecha_resultado,
                hora_resultado: req.body.hora_resultado,
                condicionantes: req.body.condicionantes,
                fecha_vencimiento_examen: (0, _getEspecificDate.getDateEspecific)((0, _fechaVencExamen.getFechaVencExam)(req.body.fecha_resultado, req.body.vigencia_examen)).substr(0, 10)
              },
              $push: {
                observaciones: obs
              }
            });

          case 13:
            result = _context3.sent;
            _context3.next = 19;
            break;

          case 16:
            _context3.next = 18;
            return db.collection('resultados').findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "Revisado",
                estado_archivo: req.body.estado_archivo,
                estado_resultado: req.body.estado_resultado,
                fecha_resultado: req.body.fecha_resultado,
                hora_resultado: req.body.hora_resultado
              },
              $push: {
                observaciones: obs
              }
            });

          case 18:
            result = _context3.sent;

          case 19:
            //insercion de la facturación
            // console.log('result para sacar cod', result)
            codAsis = result.value.codigo;
            _context3.next = 22;
            return db.collection('gi').findOne({
              rut: result.value.rut_cp,
              "categoria": "Empresa/Organización"
            });

          case 22:
            gi = _context3.sent;
            isOC = '';
            estado_archivo = '';
            estado = ''; // console.log('gi', gi.orden_compra)
            // if(gi){
            //     isOC = gi.orden_compra;
            //     (isOC == 'Si') ? estado_archivo = 'Sin Documento' : estado_archivo = 'No Requiere OC';
            // }
            // else{
            //     isOC = "No"
            //     estado_archivo = 'No Requiere OC'
            // }

            if (gi) {
              isOC = gi.orden_compra;

              if (isOC == 'Si') {
                estado_archivo = 'Sin Documento', estado = 'Ingresado';
              } else {
                estado = 'En Facturacion', estado_archivo = 'Sin Documento';
              } // (isOC == 'Si') ? estado_archivo = 'Sin Documento' : estado_archivo = 'No Requiere OC';

            } else {
              isOC = "No";
              estado = 'En Facturacion', estado_archivo = 'Sin Documento';
            } // console.log('resultado', result)


            if (!result) {
              _context3.next = 31;
              break;
            }

            _context3.next = 30;
            return db.collection('facturaciones').insertOne({
              codigo: codAsis.replace('RES', 'FAC'),
              nombre_servicio: result.value.nombre_servicio,
              id_GI_personalAsignado: result.value.id_GI_personalAsignado,
              rut_cp: result.value.rut_cp,
              razon_social_cp: result.value.razon_social_cp,
              rut_cs: result.value.rut_cs,
              razon_social_cs: result.value.razon_social_cs,
              lugar_servicio: result.value.lugar_servicio,
              sucursal: result.value.sucursal,
              condicionantes: result.value.condicionantes,
              vigencia_examen: result.value.vigencia_examen,
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

          case 30:
            result = _context3.sent;

          case 31:
            _context3.next = 37;
            break;

          case 33:
            obs.estado = req.body.estado_archivo;
            _context3.next = 36;
            return db.collection('resultados').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado_archivo: req.body.estado_archivo
              },
              $push: {
                observaciones: obs
              }
            });

          case 36:
            result = _context3.sent;

          case 37:
            res.json(result);

          case 38:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;