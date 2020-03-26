/**
 * User access, app run and error log.
 *
 * @module Logger
 */


// import
const fs = require('fs');
const util = require('util');
const winston = require('winston');
const mkdirp = require('mkdirp');
const moment = require('moment');
require('winston-daily-rotate-file');
const config = require('../config');
 
const { logPath } = config;
if (!fs.existsSync(logPath)){
    mkdirp.sync(logPath);
    console.log(util.format('Log Path: %s', logPath));
}

const dateFormat = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
};

function createLogger (fileName, level){
    var logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({
            timestamp: dateFormat,
            colorize: true,
          }),
          new (winston.transports.DailyRotateFile)({ 
            level: level,
            encoding: 'utf-8',
            filename: util.format('%s/%s%s%s', logPath, fileName,'_%DATE%','.log'),
            datePattern: 'YYYY-MM-DD',
            maxsize: 1024 * 1024 * 10, // 10MB 
            timestamp: dateFormat,
            prettyPrint: true,
            handleException:true,
            humanReadableUnhandledException:true
          })
        ]
    });
    winston.addColors({
        error: 'red',
        warn: 'yellow',
        info: 'cyan',
        debug: 'green'
    });
    return logger;
}
 
/**
 * Create an logger.
 *
 * @class Logger
 * @constructor
 */
function Logger (){
    this.appLog = createLogger('all','info');
    this.errorLog = createLogger('error','error');
    this.accessLog = createLogger('info','info');
}
 
/**
 * Info Logger
 *
 * @method info
 * @param {message}
 *          log info message.
 */
Logger.prototype.info = function (message){
    this.appLog.info(message);
};
 
/**
 * Error Logger
 *
 * @method error
 * @param {message}
 *          error message.
 */
Logger.prototype.error = function (message){
    var msg = '';
    if (typeof(message) == 'string')
        msg = message;
    else if (typeof(message) == 'object'){
        if (typeof(message.toString) == 'function')
            msg = message.toString();
        else
            msg = JSON.stringify(message);
    }
    this.errorLog.error(msg);
};
 
module.exports = new Logger();