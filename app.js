const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./log/logConfig');

// 路由的路径
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fileRouter = require('./routes/file');

const app = express();
const config = require('./config');
// 将配置文件信息保存到app.locals
app.locals.fsConfig = config;

// 跨域请求设置
// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//   res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
//   res.header('X-Powered-By',' 3.2.1');
//   res.header('Content-Type', 'application/json;charset=utf-8;multipart/form-data');
//   next();
// });
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 项目路由配置
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/file', fileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
