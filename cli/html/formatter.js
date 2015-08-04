var htmlcs       = require('htmlcs');
var through      = require('through2');
var colors       = require('colors');
var jsFormatter  = require('../js/formatter');
var cssFormatter = require('../css/formatter');
var util         = require('../util');
var conf         = require('./conf');

/**
 * 为htmlcs生成用于HTML内script与style标签内容的formatter
 * as fecs
 */

var build = function(path, options) {
    return {
        formatter: {
            //js
            script: function(content, node, opt, helper) {
                var type = node.getAttribute('type');
                // javascript content
                if (!type || type === 'text/javascript') {
                    var formatted = jsFormatter.format(content);
                    content = helper.indent(formatted);
                }
                return content.replace(/(^\s*\n)|(\n\s*$)/g, '');
            },
            //css
            style: function (content, node, opt, helper) {
                var type = node.getAttribute('type');
                // style content
                if (!type || type === 'text/css') {
                    var formatted = cssFormatter.format(content);
                    content = helper.indent(formatted);
                }
                return content.replace(/(^\s*\n)|(\n\s*$)/g, '');
            }
        }
    };
};

exports.format = function(content, config) {
    return htmlcs.format(content, config);
};

exports.exec = function(options) {
    return through({
        objectMode: true
    },
    function(file, enc, cb) {
        //添加配置
        conf.hs.format = util.extend(build(file.path, options), conf.hs.format);
        var content = file.contents.toString(enc);
        try {
            content = exports.format(content, conf.hs);
            console.log('success'.green, util.relativePath(file.path));
        } catch (e) {
            console.error('error'.red, util.relativePath(file.path));
            console.error(e);
        } finally {
            file.base     = process.cwd();
            file.contents = new Buffer(content);
            cb(null, file);
        }
    });
};