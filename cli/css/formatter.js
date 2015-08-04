/*
 * 对css文件进行格式化
 */
var Comb        = require('csscomb');
var colors      = require('colors');
var cssbeautify = require('cssbeautify');
var through     = require('through2');
var util        = require('../util');
var conf        = require('./conf');

var csscomb = new Comb('csscomb', 'css', 'less', 'scss', 'sass');

exports.format = function(content) {
    csscomb.configure(conf.cb);
    //beautify
    return csscomb.processString(cssbeautify(content), {syntax: 'css'});
}

exports.exec = function(options) {
    return through({
        objectMode: true
    },
    function(file, enc, cb) {
        var content = file.contents.toString(enc);
        try {
            content = exports.format(content);
            console.log('success'.green, util.relativePath(file.path));
        } catch (e) {
            console.log('error'.red, util.relativePath(file.path));
        } finally {
            file.base     = process.cwd();
            file.contents = new Buffer(content);
            cb(null, file);
        }
    });
}