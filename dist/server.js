"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireWildcard(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cors = _interopRequireDefault(require("cors"));

var _path = _interopRequireDefault(require("path"));

var _index = _interopRequireDefault(require("./routes/index.routes"));

var _gi = _interopRequireDefault(require("./routes/GI/gi.routes"));

var _solicitudes = _interopRequireDefault(require("./routes/solicitudes/solicitudes.routes"));

var _reservas = _interopRequireDefault(require("./routes/Reservas/reservas.routes"));

var _calendario = _interopRequireDefault(require("./routes/Calendario/calendario.routes"));

var _evaluaciones = _interopRequireDefault(require("./routes/evaluaciones/evaluaciones.routes"));

var _resultados = _interopRequireDefault(require("./routes/resultados/resultados.routes"));

var _facturas = _interopRequireDefault(require("./routes/facturaciones/facturas.routes"));

var _pagos = _interopRequireDefault(require("./routes/pagos/pagos.routes"));

var _cobranza = _interopRequireDefault(require("./routes/cobranza/cobranza.routes"));

var _gastos = _interopRequireDefault(require("./routes/gastos/gastos.routes"));

var _salidas = _interopRequireDefault(require("./routes/salidas/salidas.routes"));

var _existencia = _interopRequireDefault(require("./routes/existencia/existencia.routes"));

var _categoriasGenerales = _interopRequireDefault(require("./routes/CategoriasGenerales/categoriasGenerales.routes"));

var _empleados = _interopRequireDefault(require("./routes/empleados/empleados.routes"));

var _empleados_ausencias = _interopRequireDefault(require("./routes/empleados_ausencias/empleados_ausencias.routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//---------------------IMPORTS ROUTES
var app = (0, _express["default"])(); //Settings

app.set('port', process.env.PORT || 3000); //Middlewares

app.use((0, _cors["default"])());
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use(_express["default"].json()); //Statics

app.use('/uploads', _express["default"]["static"](_path["default"].resolve('uploads'))); //Routes

app.use(_index["default"]);
app.use('/gi', _gi["default"]);
app.use('/solicitudes', _solicitudes["default"]);
app.use('/reservas', _reservas["default"]);
app.use('/calendario', _calendario["default"]);
app.use('/evaluaciones', _evaluaciones["default"]);
app.use('/resultados', _resultados["default"]);
app.use('/facturaciones', _facturas["default"]);
app.use('/pagos', _pagos["default"]);
app.use('/cobranza', _cobranza["default"]);
app.use('/gastos', _gastos["default"]);
app.use('/salidas', _salidas["default"]);
app.use('/existencia', _existencia["default"]);
app.use('/catgenerales', _categoriasGenerales["default"]);
app.use('/empleados', _empleados["default"]);
app.use('/ausencias', _empleados_ausencias["default"]);
var _default = app;
exports["default"] = _default;