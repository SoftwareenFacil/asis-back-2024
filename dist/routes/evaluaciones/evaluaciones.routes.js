"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _getDateNow = require("../../functions/getDateNow");

var _multer = _interopRequireDefault(require("../../libs/multer"));

var _moment = _interopRequireDefault(require("moment"));

var _createPdf = _interopRequireDefault(require("../../functions/createPdf/aversionRiesgo/createPdf"));

var _createpdf = _interopRequireDefault(require("../../functions/createPdf/psicosensotecnico/createpdf"));

var _constant = require("../../functions/createPdf/aversionRiesgo/constant");

var _isRol = require("../../functions/isRol");

var _jwt = require("../../libs/jwt");

var _uuid = require("uuid");

var _text_messages = require("../../constant/text_messages");

var _database = require("../../database");

var _mongodb = require("mongodb");

var _uppercaseRutWithLetter = require("../../functions/uppercaseRutWithLetter");

var _var = require("../../constant/var");

var _aws = require("../../libs/aws");

var _pdfkit = require("pdfkit");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var path = require("path");

var AWS = require('aws-sdk');

var fs = require("fs");

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
            return db.collection("evaluaciones").find({
              isActive: true
            }).sort({
              codigo: -1
            }).toArray();

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
            return db.collection("evaluaciones").findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            result = _context2.sent;
            console.log(result);

            if (result) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return", res.status(400).json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 11:
            return _context2.abrupt("return", res.status(200).json({
              err: null,
              msg: '',
              res: result
            }));

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](4);
            return _context2.abrupt("return", res.status(500).json({
              err: String(_context2.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[4, 14]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //GENERAR PDF DE PSICOSENSOTECNICO

router.post('/evaluacionpsico', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var db, data, resultado, restricciones, vencimiento, licencia, obs, nombrePdf, nombreQR, nameFIle, rutClienteSecundario, rutClientePrincipal, conclusion_recomendaciones, idProfesionalAsignado, e_psicotecnicos, e_sensometricos, evaluaciones, test_espe_vel_anticipacion, examen_somnolencia, test_psicologico, test_espe_tol_monotonia, test_espe_reac_multiples, test_conocimiento_ley_nacional, objFile, cp, cs, pa, informacionPersonal, signPerson, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context3.sent;
            data = req.body; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            resultado = data.resultado;
            restricciones = data.restricciones || 'Sin Restricciones';
            vencimiento = (0, _moment["default"])().add(data.meses_vigencia, 'M').format('DD-MM-YYYY');
            licencia = data.licencia_a_acreditar;
            obs = {
              obs: data.conclusion_recomendacion,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            }; // obs.obs = datos.observaciones;
            // obs.fecha = getDate(new Date());
            // obs.estado = "Cargado";
            // const nombrePdf = `RESULTADO_${data.codigo}_PSICOSENSOTECNICO.pdf`;
            // const nombrePdf = NAME_PSICO_PDF;

            nombrePdf = _var.OTHER_NAME_PDF;
            nombreQR = "".concat(path.resolve("./"), "/uploads/qr_").concat(data.codigo, "_psicosensotecnico.png");
            nameFIle = "psico_".concat(data.codigo, "_").concat((0, _uuid.v4)());
            rutClienteSecundario = data.rut_cs;
            rutClientePrincipal = data.rut_cp;
            conclusion_recomendaciones = data.conclusion_recomendacion;
            idProfesionalAsignado = data.id_GI_personalAsignado;
            e_psicotecnicos = [{
              resultado: data.tiempo_reaccion,
              promedio: data.promedio_tiempo_reaccion
            }, {
              resultado: data.coordinacion_bimanual,
              promedio: data.promedio_coordinacion_bimanual
            }, {
              resultado: data.precision_coordinacion_visomotriz,
              promedio: data.promedio_precision_coordinacion_vis
            }];
            e_sensometricos = [{
              resultado: data.monocular_derecha
            }, {
              resultado: data.monocular_izquierda
            }, {
              resultado: data.vision_binocular
            }, {
              resultado: data.perimetria
            }, {
              resultado: data.profundidad
            }, {
              resultado: data.discriminacion_colores
            }, {
              resultado: data.vision_nocturna
            }, {
              resultado: data.phoria_vertical
            }, {
              resultado: data.phoria_horizontal
            }, {
              resultado: data.recuperacion_encandilamiento
            }, {
              resultado: data.audiometria
            }];
            evaluaciones = [{
              active: true,
              resultado: data.examen_sensometrico,
              obs: data.obs_examen_sensometrico
            }, {
              active: true,
              resultado: data.examen_psicotecnico,
              obs: data.obs_examen_psicotecnico
            }, {
              active: true,
              resultado: data.evaluacion_somnolencia,
              obs: data.obs_evaluacion_somnolencia
            }, {
              active: true,
              resultado: data.evaluacion_psicologica,
              obs: data.obs_evaluacion_psicologica
            }, {
              active: data.is_anticipacion,
              resultado: data.test_velocidad_anticipacion,
              obs: data.obs_test_velocidad_anticipacion
            }, {
              active: data.is_monotonia,
              resultado: data.test_tolerancia_monotonia,
              obs: data.obs_test_tolerancia_monotonia
            }, {
              active: data.is_reacciones_multiples,
              resultado: data.test_reacciones_multiples,
              obs: data.obs_test_reacciones_multiples
            }, {
              active: data.is_ley_transito,
              resultado: data.evaluacion_transito_nacional,
              obs: data.obs_evaluacion_transito_nacional
            }];
            test_espe_vel_anticipacion = {
              active: data.is_anticipacion,
              resultado: data.test_velocidad_anticipacion
            };
            examen_somnolencia = {
              active: data.is_somnolencia,
              probabilidad: data.probabilidad_somnolencia,
              punto: data.punto,
              epworth: data.test_epworth
            };
            test_psicologico = {
              active: data.is_psicologico,
              obs: data.observacion_psicologica
            };
            test_espe_tol_monotonia = {
              active: data.is_monotonia,
              resultado: data.test_tolerancia_monotonia,
              aciertos: data.test_aciertos_tolerancia,
              errores: data.test_errores_tolerancia,
              promedio_reaccion_monotonia: data.promedio_reaccion_monotonia,
              obs: data.obs_test_tolerancia_monotonia
            };
            test_espe_reac_multiples = {
              active: data.is_reacciones_multiples,
              resultado: data.test_reacciones_multiples
            };
            test_conocimiento_ley_nacional = {
              active: data.is_ley_transito,
              resultado: data.test_estado_ley_transito,
              porce_conocimientos_legales: data.porcentaje_legales,
              porce_conocimientos_reglamentarios: data.porcentaje_reglamentarios,
              porce_conocimientos_mecanica: data.porcentaje_mecanica,
              porce_conocimientos_senales_viales: data.porcentaje_señales_viales,
              porce_conducta_vial: data.porcentaje_conducta_vial
            };
            (0, _constant.generateQR)(nombreQR, "Empresa: ".concat(rutClientePrincipal, " Evaluado: ").concat(rutClienteSecundario, " Cod ASIS: ").concat(data.codigo, " Vencimiento: ").concat(vencimiento, " Resultado: ").concat(resultado));
            _context3.prev = 26;
            objFile = {};
            _context3.next = 30;
            return db.collection('gi').findOne({
              rut: (0, _uppercaseRutWithLetter.upperRutWithLetter)(rutClientePrincipal),
              categoria: 'Empresa/Organizacion'
            });

          case 30:
            cp = _context3.sent;
            _context3.next = 33;
            return db.collection('gi').findOne({
              rut: (0, _uppercaseRutWithLetter.upperRutWithLetter)(rutClienteSecundario),
              categoria: 'Persona Natural'
            });

          case 33:
            cs = _context3.sent;
            _context3.next = 36;
            return db.collection('gi').findOne({
              _id: (0, _mongodb.ObjectId)(idProfesionalAsignado)
            });

          case 36:
            pa = _context3.sent;
            console.log('cp', rutClientePrincipal);
            console.log('variables', [cp, cs, pa]);

            if (!(cp && cs)) {
              _context3.next = 52;
              break;
            }

            informacionPersonal = {
              evaluador: pa.razon_social || '',
              empresa: cp.razon_social || '',
              rut_evaluador: pa.rut || '',
              cargo_evaluador: pa.cargo || '',
              nombre: cs.razon_social || '',
              rut: cs.rut || '',
              fecha_nacimiento: cs.fecha_inic_mac ? (0, _moment["default"])(cs.fecha_inic_mac, _var.FORMAT_DATE).format(_var.FORMAT_DATE) : '',
              cargo: cs.cargo || '',
              licencia_acreditar: licencia || '',
              ley: cs.ley_aplicable || '',
              vencimiento_licencia: cs.fecha_venc_licencia ? (0, _moment["default"])(cs.fecha_venc_licencia, _var.FORMAT_DATE).format(_var.FORMAT_DATE) : '',
              observaciones_licencia: cs.estado_licencia || '',
              fecha_examen: (0, _moment["default"])().format(_var.FORMAT_DATE) || '',
              resultado: resultado || '',
              restricciones: restricciones || '',
              vencimiento: vencimiento || '',
              codigo: data.codigo || '',
              nameFile: nameFIle
            }; // console.log(informacionPersonal);

            _context3.next = 43;
            return db.collection('gi').findOne({
              rut: '12398638-5',
              categoria: 'Persona Natural'
            });

          case 43:
            signPerson = _context3.sent;
            // console.log('sign person', signPerson)
            (0, _createpdf["default"])(informacionPersonal, evaluaciones, conclusion_recomendaciones, e_sensometricos, e_psicotecnicos, test_espe_vel_anticipacion, examen_somnolencia, test_psicologico, test_espe_tol_monotonia, test_espe_reac_multiples, test_conocimiento_ley_nacional, nombrePdf, nombreQR, signPerson || null); // objFile = {
            //   name: `psico_${data.codigo}`,
            //   size: 0,
            //   path: nameFIle,
            //   type: "application/pdf",
            //   option: "online"
            // };

            setTimeout(function () {
              var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
              var params = {
                Bucket: _var.AWS_BUCKET_NAME,
                Body: fileContent,
                Key: nameFIle,
                ContentType: 'application/pdf'
              };
              (0, _aws.uploadFileToS3)(params);
            }, 2000);
            _context3.next = 48;
            return db.collection("evaluaciones").updateOne({
              codigo: data.codigo,
              isActive: true
            }, {
              $set: {
                estado: "En Evaluacion",
                estado_archivo: "Cargado",
                archivo_examen: null,
                fecha_carga_examen: (0, _moment["default"])().format('DD-MM-YYYY'),
                hora_carga_examen: (0, _moment["default"])().format('HH:mm'),
                meses_vigencia: data.meses_vigencia,
                url_file_adjunto_EE: nameFIle
              },
              $push: {
                observaciones: obs
              }
            });

          case 48:
            result = _context3.sent;
            return _context3.abrupt("return", res.status(201).json({
              err: null,
              msg: 'Examen creado satisfactoriamente',
              res: result
            }));

          case 52:
            return _context3.abrupt("return", res.json({
              err: 98,
              msg: _var.NOT_EXISTS,
              res: null
            }));

          case 53:
            _context3.next = 59;
            break;

          case 55:
            _context3.prev = 55;
            _context3.t0 = _context3["catch"](26);
            console.log(_context3.t0);
            return _context3.abrupt("return", res.json({
              err: String(_context3.t0),
              msg: 'Error al crear el examen',
              res: null
            }));

          case 59:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[26, 55]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); //GENERAR PDF DE AVERSION AL RIESGO

router.post('/evaluacionaversion', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var db, data, I, AN, EE, APR, MC, TOTAL_I, TOTAL_AN, TOTAL_EE, TOTAL_APR, TOTAL_MC, obs, conclusionRiesgos, rutClienteSecundario, rutClientePrincipal, maquinariasConducir, observacionConclusion, nombrePdf, nombreQR, nameFIle, fecha_vigencia, resultado, cp, cs, pa, informacionPersonal, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context4.sent;
            data = req.body; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            I = {
              razonamiento_abstracto: data.razonamiento_abstracto,
              percepcion_concentracion: data.percepcion_concentracion,
              comprension_instrucciones: data.comprension_instrucciones
            };
            AN = {
              acato_autoridad: data.acato_autoridad,
              relacion_grupo_pares: data.relacion_grupo_pares,
              comportamiento_social: data.comportamiento_social
            };
            EE = {
              locus_control_impulsividad: data.locus_control_impulsividad,
              manejo_frustracion: data.manejo_frustracion,
              empatia: data.empatia,
              grado_ansiedad: data.grado_ansiedad
            };
            APR = {
              actitud_prevencion_accidentes: data.actitud_prevencion_accidentes,
              confianza_acciones_realizadas: data.confianza_acciones_realizadas,
              capacidad_modificar_ambiente_seguridad: data.capacidad_modificar_ambiente_seguridad
            };
            MC = {
              orientacion_tarea: data.orientacion_tarea,
              energia_vital: data.energia_vital
            }; //-------

            TOTAL_I = [data.total_razonamiento_abstracto || 0, data.total_percepcion_concentracion || 0, data.total_comprension_instrucciones || 0];
            TOTAL_AN = [data.total_acato_autoridad || 0, data.total_relacion_grupo_pares || 0, data.total_comportamiento_social || 0];
            TOTAL_EE = [data.total_locus_control_impulsividad || 0, data.total_manejo_frustracion || 0, data.total_empatia || 0, data.total_grado_ansiedad || 0];
            TOTAL_APR = [data.total_actitud_prevencion_accidentes || 0, data.total_confianza_acciones_realizadas || 0, data.total_capacidad_modificar_ambiente_seguridad || 0];
            TOTAL_MC = [data.total_orientacion_tarea || 0, data.total_energia_vital || 0];
            obs = {
              obs: data.observaciones_conclusion,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            }; // const fortalezas = data.fortalezas;
            // const areas_mejorar = data.area_mejora;

            conclusionRiesgos = data.conclusion;
            rutClienteSecundario = data.rut_cs;
            rutClientePrincipal = data.rut_cp;
            maquinariasConducir = data.maquinaria;
            observacionConclusion = data.observaciones_conclusion; // const nombre_servicio = data.nombre_servicio;
            // const nombrePdf = NAME_AVERSION_PDF;

            nombrePdf = _var.OTHER_NAME_PDF;
            nombreQR = "".concat(path.resolve("./"), "/uploads/qr_").concat(data.codigo, "_aversionriesgo.png");
            nameFIle = "aversion_".concat(data.codigo, "_").concat((0, _uuid.v4)());
            fecha_vigencia = (0, _moment["default"])().add(data.meses_vigencia, 'M').format('DD-MM-YYYY');
            resultado = '';

            if (conclusionRiesgos === 1) {
              resultado = 'No presenta conductas de riesgos';
            } else if (conclusionRiesgos === 2) {
              resultado = 'Presenta bajas conductas de riesgos';
            } else {
              resultado = 'Presenta altas conductas de riesgos';
            }

            ;
            (0, _constant.generateQR)(nombreQR, "Empresa: ".concat(rutClientePrincipal, " Evaluado: ").concat(rutClienteSecundario, " Cod ASIS: ").concat(data.codigo, " Fecha vigencia: ").concat(fecha_vigencia, " Resultado: ").concat(resultado));
            _context4.next = 30;
            return db.collection('gi').findOne({
              rut: rutClientePrincipal,
              categoria: 'Empresa/Organizacion'
            });

          case 30:
            cp = _context4.sent;
            _context4.next = 33;
            return db.collection('gi').findOne({
              rut: rutClienteSecundario,
              categoria: 'Persona Natural'
            });

          case 33:
            cs = _context4.sent;
            _context4.next = 36;
            return db.collection('gi').findOne({
              _id: (0, _mongodb.ObjectId)(data.id_GI_personalAsignado)
            });

          case 36:
            pa = _context4.sent;

            if (!(cp && cs && pa)) {
              _context4.next = 55;
              break;
            }

            informacionPersonal = {
              empresa: cp.razon_social,
              evaluador: pa.razon_social,
              rut_evaluador: pa.rut,
              cargo_evaluador: pa.cargo || '',
              nombre: cs.razon_social,
              edad: cs.edad_gi,
              rut: cs.rut,
              educacion: cs.nivel_educacional,
              cargo: cs.cargo,
              ciudad: cs.localidad,
              maquinarias_conducir: maquinariasConducir,
              fecha_evaluacion: data.fecha_actual_examen || (0, _moment["default"])().format('DD-MM-YYYY')
            };
            _context4.prev = 39;
            // objFile = {
            //   name: nombrePdf,
            //   size: 0,
            //   path: "uploads/" + nombrePdf,
            //   type: "application/pdf",
            //   option: "online"
            // }
            (0, _createPdf["default"])(I, AN, EE, APR, MC, conclusionRiesgos, informacionPersonal, nombrePdf, nombreQR, fecha_vigencia, observacionConclusion, TOTAL_I, TOTAL_AN, TOTAL_EE, TOTAL_APR, TOTAL_MC); // objFile = {
            //   name: `aversion_${data.codigo}`,
            //   size: 0,
            //   path: nameFIle,
            //   type: "application/pdf",
            //   option: "online"
            // };

            setTimeout(function () {
              var fileContent = fs.readFileSync("uploads/".concat(nombrePdf));
              var params = {
                Bucket: _var.AWS_BUCKET_NAME,
                Body: fileContent,
                Key: nameFIle,
                ContentType: 'application/pdf'
              };
              (0, _aws.uploadFileToS3)(params);
            }, 2000);
            console.log('sdsdssdsdsds', data);
            _context4.next = 45;
            return db.collection("evaluaciones").updateOne({
              codigo: data.codigo,
              isActive: true
            }, {
              $set: {
                estado: "En Evaluacion",
                estado_archivo: "Cargado",
                archivo_examen: null,
                fecha_carga_examen: (0, _moment["default"])().format('DD-MM-YYYY'),
                hora_carga_examen: (0, _moment["default"])().format('HH:mm'),
                meses_vigencia: data.meses_vigencia,
                url_file_adjunto_EE: nameFIle
              },
              $push: {
                observaciones: obs
              }
            });

          case 45:
            result = _context4.sent;
            return _context4.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Examen creado exitosamente',
              res: result
            }));

          case 49:
            _context4.prev = 49;
            _context4.t0 = _context4["catch"](39);
            console.log(_context4.t0);
            return _context4.abrupt("return", res.json({
              err: 97,
              msg: _var.ERROR_PDF,
              res: null
            }));

          case 53:
            _context4.next = 56;
            break;

          case 55:
            return _context4.abrupt("return", res.json({
              err: 98,
              msg: 'Cliente secundario no encontrado',
              res: null
            }));

          case 56:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[39, 49]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); //GET FILE FROM AWS S3

router.get('/downloadfile/:id', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var id, db, evaluacion, pathPdf, s3;
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
            return db.collection('evaluaciones').findOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            });

          case 7:
            evaluacion = _context5.sent;
            // const { path: pathPdf, name } = evaluacion.url_file_adjunto_EE;
            pathPdf = evaluacion.url_file_adjunto_EE;
            console.log(pathPdf);
            s3 = new AWS.S3({
              accessKeyId: _var.AWS_ACCESS_KEY,
              secretAccessKey: _var.AWS_SECRET_KEY
            });
            s3.getObject({
              Bucket: _var.AWS_BUCKET_NAME,
              Key: pathPdf
            }, function (error, data) {
              if (error) {
                return res.json({
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
            _context5.next = 17;
            break;

          case 14:
            _context5.prev = 14;
            _context5.t0 = _context5["catch"](4);
            return _context5.abrupt("return", res.json({
              err: String(_context5.t0),
              msg: 'Error al obtener archivo',
              res: null
            }));

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[4, 14]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()); //SELECT WITH PAGINATION

router.post("/pagination", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var db, _req$body, pageNumber, nPerPage, skip_page, mergedEvaluaciones, countEva, result;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _database.connect)();

          case 2:
            db = _context6.sent;
            _req$body = req.body, pageNumber = _req$body.pageNumber, nPerPage = _req$body.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0; // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            _context6.prev = 5;
            _context6.next = 8;
            return db.collection('evaluaciones').aggregate([{
              $lookup: {
                from: "gi",
                localField: "id_GI_personalAsignado",
                foreignField: "ObjectId(_id)",
                as: "evaluador"
              }
            }, {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [{
                    $arrayElemAt: ["$evaluador", 0]
                  }, "$$ROOT"]
                }
              }
            }, {
              $project: {
                id_GI_personalAsignado: 1,
                valor_servicio: 1,
                faena_seleccionada_cp: 1,
                fecha_evaluacion: 1,
                fecha_evaluacion_fin: 1,
                hora_inicio_evaluacion: 1,
                hora_termino_evaluacion: 1,
                mes: 1,
                anio: 1,
                nombre_servicio: 1,
                rut_cp: 1,
                razon_social_cp: 1,
                rut_cs: 1,
                razon_social_cs: 1,
                lugar_servicio: 1,
                sucursal: 1,
                observaciones: 1,
                estado_archivo: 1,
                estado: 1,
                razon_social: 1
              }
            }, {
              $match: {
                isActive: true
              }
            } // {
            //   $match: { ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }
            // },
            ]).toArray();

          case 8:
            mergedEvaluaciones = _context6.sent;
            console.log('agregate', mergedEvaluaciones); // const countEva = await db.collection("evaluaciones").find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true }).count();
            // const result = await db
            //   .collection("evaluaciones")
            //   .find({ ...isRolEvaluaciones(dataToken.rol, dataToken.rut, dataToken.id), isActive: true })
            //   .skip(skip_page)
            //   .limit(nPerPage)
            //   .sort({ codigo: -1 })
            //   .toArray();

            _context6.next = 12;
            return db.collection("evaluaciones").find({
              isActive: true
            }).count();

          case 12:
            countEva = _context6.sent;
            _context6.next = 15;
            return db.collection("evaluaciones").find({
              isActive: true
            }).skip(skip_page).limit(nPerPage).sort({
              codigo: -1
            }).toArray();

          case 15:
            result = _context6.sent;
            return _context6.abrupt("return", res.json({
              // auth: AUTHORIZED,
              total_items: countEva,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEva / nPerPage + 1),
              evaluaciones: result
            }));

          case 19:
            _context6.prev = 19;
            _context6.t0 = _context6["catch"](5);
            console.log(_context6.t0);
            return _context6.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              evaluaciones: null,
              err: String(_context6.t0)
            }));

          case 23:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[5, 19]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()); //BUSCAR POR NOMBRE O RUT

router.post("/buscar", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var _req$body2, identificador, filtro, headFilter, pageNumber, nPerPage, skip_page, db, rutFiltrado, rexExpresionFiltro, result, countEva, _db$collection$find, _db$collection$find2;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _req$body2 = req.body, identificador = _req$body2.identificador, filtro = _req$body2.filtro, headFilter = _req$body2.headFilter, pageNumber = _req$body2.pageNumber, nPerPage = _req$body2.nPerPage;
            skip_page = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
            _context7.next = 4;
            return (0, _database.connect)();

          case 4:
            db = _context7.sent;
            rutFiltrado = filtro;

            if (identificador === 1 && filtro.includes("k")) {
              rutFiltrado.replace("k", "K");
            } // else {
            //   rutFiltrado = filtro;
            // }


            rexExpresionFiltro = new RegExp(rutFiltrado, "i");
            _context7.prev = 8;
            _context7.next = 11;
            return db.collection("evaluaciones").find((_db$collection$find = {}, _defineProperty(_db$collection$find, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find, "isActive", true), _db$collection$find)).count();

          case 11:
            countEva = _context7.sent;
            _context7.next = 14;
            return db.collection("evaluaciones").find((_db$collection$find2 = {}, _defineProperty(_db$collection$find2, headFilter, rexExpresionFiltro), _defineProperty(_db$collection$find2, "isActive", true), _db$collection$find2)).skip(skip_page).limit(nPerPage).toArray();

          case 14:
            result = _context7.sent;
            return _context7.abrupt("return", res.status(200).json({
              total_items: countEva,
              pagina_actual: pageNumber,
              nro_paginas: parseInt(countEva / nPerPage + 1),
              evaluaciones: result
            }));

          case 18:
            _context7.prev = 18;
            _context7.t0 = _context7["catch"](8);
            return _context7.abrupt("return", res.status(500).json({
              total_items: 0,
              pagina_actual: 1,
              nro_paginas: 0,
              evaluaciones: null,
              err: String(_context7.t0)
            }));

          case 21:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[8, 18]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()); //EDITAR EVALUACION -----------> PENDIENTE

router.put("/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var id, evaluacion, db, token, dataToken;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            evaluacion = JSON.parse(req.body.data);
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
            if (!(dataToken.rol === 'Clientes' || dataToken.rol === 'Colaboradores')) {
              _context8.next = 15;
              break;
            }

            return _context8.abrupt("return", res.status(401).json({
              msg: _text_messages.MESSAGE_UNAUTHORIZED_TOKEN
            }));

          case 15:
            if (req.file) {
              evaluacion.url_file_adjunto = {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                type: req.file.mimetype
              };
            }

            _context8.prev = 16;
            _context8.next = 19;
            return db.collection("evaluaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id),
              isActive: true
            }, {
              $set: {}
            });

          case 19:
            return _context8.abrupt("return", res.status(201).json({
              message: "Evaluacion modificada correctamente"
            }));

          case 22:
            _context8.prev = 22;
            _context8.t0 = _context8["catch"](16);
            return _context8.abrupt("return", res.status(501).json({
              message: "ha ocurrido un error",
              error: _context8.t0
            }));

          case 25:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[16, 22]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()); //PASAR A EN EVALUACION

router.post("/evaluar/:id", _multer["default"].single("archivo"), /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var id, db, datos, archivo, obs, nombrePdf, result;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = req.params.id;
            _context9.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context9.sent;
            datos = JSON.parse(req.body.data); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            archivo = '';
            obs = {
              obs: datos.observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: "Cargado"
            }; // if (req.file) archivo = {
            //   name: req.file.originalname,
            //   size: req.file.size,
            //   path: req.file.path,
            //   type: req.file.mimetype,
            //   option: "file"
            // };

            _context9.prev = 7;

            if (req.file) {
              // const nombrePdf = datos.nombre_servicio === 'Psicosensotécnico Riguroso'
              //   ? NAME_PSICO_PDF : datos.nombre_servicio === 'Aversión al Riesgo' ? NAME_AVERSION_PDF : OTHER_NAME_PDF;
              nombrePdf = _var.OTHER_NAME_PDF; // const nombreQR = `${path.resolve("./")}/uploads/qr_${data.codigo}_psicosensotecnico.png`;

              archivo = datos.nombre_servicio === 'Psicosensotécnico Riguroso' ? "psico_".concat(datos.codigo, "_").concat((0, _uuid.v4)()) : datos.nombre_servicio === 'Aversión al Riesgo' ? "aversion_".concat(datos.codigo, "_").concat((0, _uuid.v4)()) : "".concat(datos.codigo, "_").concat((0, _uuid.v4)());
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

            _context9.next = 11;
            return db.collection("evaluaciones").updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: "En Evaluacion",
                estado_archivo: "Cargado",
                fecha_carga_examen: datos.fecha_carga_examen,
                hora_carga_examen: datos.hora_carga_examen,
                url_file_adjunto_EE: archivo
              },
              $push: {
                observaciones: obs
              }
            });

          case 11:
            result = _context9.sent;
            return _context9.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Examen cargado',
              res: result
            }));

          case 15:
            _context9.prev = 15;
            _context9.t0 = _context9["catch"](7);
            return _context9.abrupt("return", res.status(500).json({
              err: String(_context9.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 18:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[7, 15]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()); //PASAR A EVALUADO

router.post("/evaluado/:id", /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var id, db, datos, estadoEvaluacion, obs, result, codAsis, resultinsert;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            id = req.params.id;
            _context10.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context10.sent;
            datos = req.body;
            console.log(datos); // const token = req.headers['x-access-token'];
            // if (!token) return res.status(401).json({ msg: MESSAGE_UNAUTHORIZED_TOKEN, auth: UNAUTHOTIZED });
            // const dataToken = await verifyToken(token);
            // if (Object.entries(dataToken).length === 0) return res.status(400).json({ msg: ERROR_MESSAGE_TOKEN, auth: UNAUTHOTIZED });

            estadoEvaluacion = "";
            obs = {
              obs: datos.observaciones,
              fecha: (0, _getDateNow.getDate)(new Date()),
              estado: datos.estado_archivo
            };
            _context10.prev = 8;

            if (datos.estado_archivo == "Aprobado" || datos.estado_archivo == "Aprobado con Obs") {
              estadoEvaluacion = "Evaluado";
            } else {
              estadoEvaluacion = "Ingresado";
            }

            _context10.next = 12;
            return db.collection("evaluaciones").findOneAndUpdate({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                estado: estadoEvaluacion,
                estado_archivo: datos.estado_archivo,
                fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
                hora_confirmacion_examen: datos.hora_confirmacion_examen
              },
              $push: {
                observaciones: obs
              }
            }, {
              sort: {
                codigo: 1
              },
              returnNewDocument: true
            });

          case 12:
            result = _context10.sent;

            if (!(result.ok == 1 && (datos.estado_archivo == "Aprobado" || datos.estado_archivo == "Aprobado con Obs"))) {
              _context10.next = 20;
              break;
            }

            // const isOnline = result.value.url_file_adjunto_EE.option = "online" ? true : false;
            codAsis = result.value.codigo;
            codAsis = codAsis.replace("EVA", "RES");
            _context10.next = 18;
            return db.collection("resultados").insertOne({
              codigo: codAsis,
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
              condicionantes: [],
              vigencia_examen: result.value.meses_vigencia || null,
              observaciones: [],
              fecha_confirmacion_examen: datos.fecha_confirmacion_examen,
              hora_confirmacion_examen: datos.hora_confirmacion_examen,
              estado: "En Revisión",
              url_file_adjunto_res: result.value.url_file_adjunto_EE,
              // estado_archivo: isOnline ? "Cargado" : "Sin Documento",
              // estado_archivo: 'Sin Documento',
              estado_archivo: 'Cargado',
              estado_resultado: '',
              isActive: true
            });

          case 18:
            resultinsert = _context10.sent;
            result = resultinsert;

          case 20:
            return _context10.abrupt("return", res.status(200).json({
              err: null,
              msg: 'Evaluacion realizada',
              res: result
            }));

          case 23:
            _context10.prev = 23;
            _context10.t0 = _context10["catch"](8);
            return _context10.abrupt("return", res.status(500).json({
              err: String(_context10.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 26:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[8, 23]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}()); //DELETE / ANULAR

router["delete"]('/:id', /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var id, db, existEvaluacion, codeReserva, existReserva, codeSolicitud, existSolicitud;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            id = req.params.id;
            _context11.next = 3;
            return (0, _database.connect)();

          case 3:
            db = _context11.sent;
            _context11.prev = 4;
            _context11.next = 7;
            return db.collection('evaluaciones').findOne({
              _id: (0, _mongodb.ObjectID)(id)
            });

          case 7:
            existEvaluacion = _context11.sent;

            if (existEvaluacion) {
              _context11.next = 10;
              break;
            }

            return _context11.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'evaluacion no existe'
            }));

          case 10:
            codeReserva = existEvaluacion.codigo.replace('EVA', 'AGE');
            _context11.next = 13;
            return db.collection('reservas').findOne({
              codigo: codeReserva
            });

          case 13:
            existReserva = _context11.sent;

            if (existReserva) {
              _context11.next = 16;
              break;
            }

            return _context11.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'reserva no existe'
            }));

          case 16:
            codeSolicitud = existReserva.codigo.replace('AGE', 'SOL');
            _context11.next = 19;
            return db.collection('solicitudes').findOne({
              codigo: codeSolicitud
            });

          case 19:
            existSolicitud = _context11.sent;

            if (existSolicitud) {
              _context11.next = 22;
              break;
            }

            return _context11.abrupt("return", res.status(200).json({
              msg: _text_messages.DELETE_SUCCESSFULL,
              status: 'solicitud no existe no existe'
            }));

          case 22:
            _context11.next = 24;
            return db.collection('evaluaciones').updateOne({
              _id: (0, _mongodb.ObjectID)(id)
            }, {
              $set: {
                isActive: false
              }
            });

          case 24:
            _context11.next = 26;
            return db.collection('reservas').updateOne({
              codigo: codeReserva
            }, {
              $set: {
                isActive: false
              }
            });

          case 26:
            _context11.next = 28;
            return db.collection('solicitudes').updateOne({
              codigo: codeSolicitud
            }, {
              $set: {
                isActive: false
              }
            });

          case 28:
            return _context11.abrupt("return", res.status(200).json({
              err: null,
              msg: _text_messages.DELETE_SUCCESSFULL,
              res: []
            }));

          case 31:
            _context11.prev = 31;
            _context11.t0 = _context11["catch"](4);
            console.log(_context11.t0);
            return _context11.abrupt("return", res.status(500).json({
              err: String(_context11.t0),
              msg: _text_messages.ERROR,
              res: null
            }));

          case 35:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[4, 31]]);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}()); // ADD IsActive
// router.get('/addisactive/sdsdsd', async (req, res) => {
//   const db = await connect();
//   try {
//     const result = await db
//       .collection("evaluaciones")
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