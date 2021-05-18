"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _mongodb = _interopRequireDefault(require("mongodb"));

var _var = require("./constant/var");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function connect() {
  return _connect.apply(this, arguments);
}

function _connect() {
  _connect = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var mongoUri, client, db;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // const mongoUri = 'mongodb://localhost/local-db-asis';
            // const connextionMongodb = process.env.MONGODB_CONNECTION_PROD || MONGODB_CONNECTION_DEV;
            mongoUri = 'mongodb+srv://admin:Karla2021@cluster0.3pzmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
            _context.next = 4;
            return _mongodb["default"].connect(mongoUri, {
              useNewUrlParser: true,
              useUnifiedTopology: true
            });

          case 4:
            client = _context.sent;
            db = client.db('asis-db');
            console.log('DB connected');
            return _context.abrupt("return", db);

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);
            return _context.abrupt("return", null);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 10]]);
  }));
  return _connect.apply(this, arguments);
}