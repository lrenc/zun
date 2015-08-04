var fs       = require('fs');
var pkg      = require('../package');
var readline = require('readline');


var util = {
    //后缀列表
    postfix: pkg.filter,
    //扩展
    extend: function() {
        var args = Array.prototype.slice.call(arguments);
        var i = 1,
            l = args.length;
        for (; i < l; i ++) {
            for (var idx in args[i]) {
                if (!args[i].hasOwnProperty(idx)) {
                    continue;
                }
                //浅拷贝
                args[0][idx] = args[i][idx];
            }
        }
        return args[0];
    },
    normalization: function(str) {
        return str.replace(/\\/g, '/').replace(/\r$/, '');
    },
    //逆序一个字符串
    reverse: function(str) {
        if (str.length === 0) {
            return;
        }
        var res = [];
        var i   = str.length - 1;
        for (; i >= 0; i --) {
            res.push(str[i]);
        }
        return res.join('');
    },
    //获取文件名的后缀
    getPostfix: function(filename) {
        var type = filename.match(/\.\w+$/);
        if (!type) {
            return '';
        }
        return type[0].slice(1);
    },

    //对文件类型进行过滤
    filter: function(fileList, postfixList) {
        if (!postfixList) {
            //如果没有指定后缀，则取所有合法的后缀
            postfixList = this.postfix;
        }
        var res = [];
        //转换成数组的形式
        if (!Array.isArray(postfixList)) {
            postfixList = [postfixList];
        }
        fileList.forEach(function(item) {
            if (~postfixList.indexOf(this.getPostfix(item))) {
                res.push(item);
            }
        }.bind(this));

        return res;
    },

    //文件是否是合理的后缀
    isSuitable: function(filename) {
        var postfixList = this.postfix;
        //如果后缀名合法，返回true
        if (~postfixList.indexOf(this.getPostfix(filename))) {
            return true;
        }
        return false;
    },

    //返回当前目录树下的所有过滤后的文件全路径
    walkPath: function(path, fileList) {
        var dirList = fs.readdirSync(path);

        dirList.forEach(function(item) {
            var now = path + '/' + item;
            if (fs.statSync(now).isFile() && this.isSuitable(now)) {
                fileList.push(now);
            }

        }.bind(this));

        dirList.forEach(function(item) {
            var now = path + '/' + item;
            if (fs.statSync(now).isDirectory()) {
                this.walkPath(now, fileList);
            }
        }.bind(this));
        
    },

    //返回文件相对路径
    relativePath: function(path) {
        path = this.normalization(path);
        return '.' + path.slice(this.normalization(process.cwd()).length);
    },

    // 文件名和文件路径进行匹配
    matchFile: function(fileList, pathList) {
        var i = 0,
            l = pathList.length;

        var res = {};

        fileList.forEach(function(file) {
            //给每一个文件产生一个列表
            res[file] = [];
            for (i = 0; i < l; i ++) {
                var path = pathList[i];
                var last = path.length - file.length;
                //对字符串长度进行限制
                if (last >= 0 && path.indexOf(file) === last) {
                    res[file].push(path);
                }
            }
        });
        return res;
    },
    //输入
    input: (function() {
        
        return function(msg, callback) {
            var rl = readline.createInterface({
                input : process.stdin,
                output: process.stdout
            });
            rl.question(msg, function(answer) {
                //console.log(answer);
                callback(answer);
                rl.close();
            });
        }
    })(),

    //是一个目录
    isDirectorySync: function(file) {
        return fs.statSync(file).isDirectory();
    },
    //是一个文件
    isFileSync: function(file) {
        return fs.statSync(file).isFile();
    }
};

module.exports = util;