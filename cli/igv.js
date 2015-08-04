/**
 * 生成一个对全局变量豁免的注释，全局变量需要自己输入
 */
var through = require('through2');
var colors  = require('colors');
var util    = require('./util');

exports.exec = function(opts) {
    return through({
        objectMode: true
    },

    function(file, enc, cb) {
        var content = file.contents.toString(enc);
        var variate = opts.variate.split(',').join(' ');

        var key = '/*global '+ variate +'*/';
        if (~~content.indexOf('/*global ')) {
            content = key + '\n' + content;
        }
        file.base = process.cwd();
        file.contents = new Buffer(content);
        console.log('success'.green, util.relativePath(file.path));
        cb(null, file);
    });
};