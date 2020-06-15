"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = validateFechaInicio;

var _isValidateDate = _interopRequireDefault(require("./isValidateDate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function validateFechaInicio(data) {
  var regExpresion = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/;
  var result = data.map(function (obj) {
    if (obj.FechaInicio != null && obj.FechaInicio != "" && pattern.test(obj.FechaInicio)) {
      return obj;
    }
  });
  return result;
}