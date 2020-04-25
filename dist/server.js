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
var _default = app;
exports["default"] = _default;