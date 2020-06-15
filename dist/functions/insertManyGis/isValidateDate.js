"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isValidateDate;

var _validateFormatDate = _interopRequireDefault(require("./validateFormatDate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function isValidateDate(fecha) {
  var rFecha = fecha.replace("-", "/");

  if ((0, _validateFormatDate["default"])(rFecha)) {
    var fechsSplit = rFecha.split("/");
    var day = fechsSplit[0];
    var month = fechsSplit[1];
    var year = fechsSplit[2];
    var date = new Date(year, month, "0");

    if (day - 0 > date.getDate() - 0) {
      return false;
    }

    return true;
  } else {
    return false;
  }
}