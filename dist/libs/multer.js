"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _uuid = require("uuid");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var storage = _multer["default"].diskStorage({
  destination: 'uploads',
  filename: function filename(req, file, cb) {
    // cb(null, v4() + path.extname(file.originalname));
    cb(null, 'EXAMEN.pdf');
  }
});

var _default = (0, _multer["default"])({
  storage: storage
});

exports["default"] = _default;