"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var router = (0, _express.Router)();
router.get('/', function (req, res) {
  try {
    return res.send('Welcome to REST API ASIS System');
  } catch (error) {
    return res.send('error al cargar la api');
  }
});
var _default = router;
exports["default"] = _default;