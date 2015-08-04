/**
 * 通过svn命令获取文件信息
 */

var fs   = require('fs');
var exec = require('child_process').exec;
var util = require('./util');

function trim(str) {
    return './' +  str.slice(1).replace(/^\s+/, '');
}

exports.changeFiles = function(callback) {

    //通过svn status命令获取发生变化的文件
    //
    exec('svn status', function(err, stdout, stderr) {
        if (err || stderr) {
            console.log('svn error, please make sure your directory is under the management of svn');
            return;
        }
        //console.log(stdout);
        var files    = stdout.split('\n');
        var newFiles = [];
        var modFiles = [];

        var i = 0,
            l = files.length;

        for (; i < l; i ++) {
            //对window下的表现进行修复
            var file = util.normalization(files[i]);
            //有问题的svn提交
            if (!file.indexOf('!')) {
                continue;
            }
            if (util.isFileSync(trim(file)) && util.isSuitable(trim(file))) {
                if (/^\?/.test(file) || /^A/i.test(file)) {                    
                    newFiles.push(trim(file));
                }
                if (/^M/i.test(file)) {
                    modFiles.push(trim(file));
                }
                continue;
            }
            //是一个新增文件
            if (util.isDirectorySync(trim(file)) && !file.indexOf('?')) {
                util.walkPath('./' + trim(file), newFiles);
            }
        }
        callback({
            newFiles: newFiles,
            modFiles: modFiles
        });
    });

}