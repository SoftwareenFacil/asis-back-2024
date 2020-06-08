"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cors = _interopRequireDefault(require("cors"));

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//---------------------IMPORTS ROUTES
var app = (0, _express["default"])(); //Settings

app.set('port', process.env.PORT || 3000); //Middlewares

app.use((0, _cors["default"])());
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].json()); //Routes

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
var _default = app;
exports["default"] = _default;