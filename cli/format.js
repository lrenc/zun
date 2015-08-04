var vfs    = require('vinyl-fs');
var colors = require('colors');

var util   = require('./util');
var ignore = require('./ignore');
var passer = require('./passer');


function getOutput(opts) {
    var dir = './';
    if (opts.directory === true) {
        dir = './output';
    } else if (!!opts.directory) {
        dir = opts.directory;
    }
    return dir;
}
//文件分类放到这里来做
function format(filter, opts) {
    /*
     * 合并过滤文件
     * 按文件类型拆分
     */
    var dir = getOutput(opts);

    ignore.ignoreFiles(function(ifls) {
        util.postfix.forEach(function(type) {
            var res = util
            .filter(filter.concat(util.filter(ifls, type)), type);
            //如果所有都是!，则return
            var flag = false;
            for (var i = 0, l = res.length; i < l; i ++) {
                if (!!res[i].indexOf('!')) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                return;
            }

            vfs
            .src(res)
            .pipe(require('./'+ type + '/formatter').exec(opts))
            .pipe(vfs.dest(dir));
        });
    });
}

//豁免变量命名规范
function ignoreCamelcase(filter, opts) {
    var dir = getOutput(opts);
    vfs
    .src(filter)
    .pipe(require('./icc').exec())
    .pipe(vfs.dest(dir));
}

//豁免全局变量检查
function ignoreGlobalVariate(filter, opts) {
    var dir = getOutput(opts);
    vfs
    .src(filter)
    .pipe(require('./igv').exec(opts))
    .pipe(vfs.dest(dir));
}

function group(opts, property, cmd) {
    var fileList = opts[property].split(',');
    //文件真正的路径
    var pathList = [];
    //首先过滤一遍文件类型
    var res  = [];
    fileList.forEach(function(file) {
        //如果文件类型不合法
        if (!util.isSuitable(file)) {
            fileList.splice(fileList.indexOf(file), 1);
        }
    });
    if (fileList.length === 0) {
        //输入的所有文件都不合法
        console.log('only support', util.postfix.join('/'), 'files');
        return;
    }
    //找出这个文件真正的路径
    util.walkPath('.', pathList);
    res = util.matchFile(fileList, pathList);
    //对res进行遍历
    var mult = [];
    var none = [];
    for (var f in res) {
        if (!res.hasOwnProperty(f)) {
            continue;
        }
        if (res[f].length > 1) {
            mult.push(f);
        } else if (!res[f].length) {
            none.push(f);
        }
    }
    //优先提示mult
    if (mult.length) {
        var tip = [
            'there are more than one files named ' + mult.join('/') + ':',
            ''
        ];
        var i = 0,
            l = mult.length;
        for (; i < l; i ++) {
            tip.push([
                mult[i].cyan,
                res[mult[i]].join('\n')
            ].join('\n'));
        }
        //输出一个空行
        console.log(tip.join('\n'));

        util.input('\ndo you want to format them all? (y/n): ',
            function(answer) {
            if (answer === 'y') {
                cmd(changeToList(res), opts);
            }
        });
    } else {
        //每个文件都是唯一的
        cmd(changeToList(res), opts);
    }
}

//把matchfile对象转换成数组
function changeToList(map) {
    var res = [];
    for (var f in map) {
        if (!map.hasOwnProperty(f)) {
            continue;
        }
        res = res.concat(map[f]);
    }
    return res;
}

exports.run = function(opts) {
    if (opts.icc) {
        //对非驼峰变量忽略
        if (opts.icc === true) {
            console.log('please use like this. zun f --icc file1,file2...');
            return;
        }
        //必须指定文件
        group(opts, 'icc', ignoreCamelcase);
        return;
    }
    if (opts.igv) {
        //对全局变量忽略
        if (opts.igv === true) {
            console.log('please use like this. zun f --igv file1,file2...');
            return;
        }
        if (!opts.variate || opts.variate === true) {
            console.log('please input the variate');
            return;
        }
        group(opts, 'igv', ignoreGlobalVariate);
        return;
    }
    if (opts.file) {
        if (opts.file === true) {
            console.log('please use like this. zun f --file file1,file2...');
            return;
        }
        //指定了文件
        group(opts, 'file', format);
    } else {
        var res = [];
        if (opts.all) {
            //对所有文件进行格式化
            util.postfix.forEach(function(item) {
                res.push('./**/*.' + item);
            });
            format(res, opts);
            return;
        }
        passer.changeFiles(function(files) {
            if (opts.nomodify) {
                //只对新增文件进行格式化
                if (!files.newFiles.length) {
                    console.wran('no new files found');
                    return;
                }
                format(
                    res.concat(files.newFiles),
                    opts
                );
                return;
            }
            //对svn status 的文件进行格式化
            if (!files.newFiles.length 
                && !files.modFiles.length) {
                console.wran('no changed files found');
                return;
            }
            format(
                res.concat(
                    files.newFiles,
                    files.modFiles
                ),
                opts
            );
        });
    }
}