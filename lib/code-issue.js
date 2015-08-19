var Q        = require('q');
var svn      = require('svn-interface');
var request  = require('request');
var svnInfo  = require('svn-info');
var opener   = require("opener");
var colors   = require('colors');

//默认配置
var defaultConf = {
    path: './',
    card: '',
    send_mail: false,
    confirmParam: true
};

//对象扩展
function extend() {
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
}

function trim(str) {
    return str.replace(/^\s+/, '').replace(/$\s+/, '');
}


var exports = function(config, callback) {
    //扩展conf
    config = extend({}, defaultConf, config);
    var token = "";
    if (config.token) {
        token = config.token;
    }
    //当前路径
    var infoPromise = Q.nfcall(svnInfo, './', 'HEAD');
    var diffPromise = Q.promise(function (resolve, reject) {
        //首先获取info信息
        
        svn.info(config.path, {
            'xml': false
        }, function(error, data) {
            if (error) {
                //reject(error)
            } else {
                var revision = /Revision:\s*\d+/.exec(data)
                if (!revision || !revision.length) {
                    console.log('error happened');
                }
                revision = revision[0];
                revision = trim(revision.split(':')[1]);
                var res = [
                    'Index: build.sh',
                    '===================================================================',
                    '--- build.sh    (revision ' + revision + ')',
                    '+++ build.sh    (working copy)',
                    '@@ -33,4 +33,5 @@',
                    ' rm -rf webserver',
                    ' rm -rf temp',
                    '',
                    '-echo "build end"',
                    '\\ No newline at end of file',
                    '+echo "build end"',
                    '+# test',
                    '\\ No newline at end of file'
                ].join('\n');
                
                resolve(res)
            }
        });
    });

    //获取svn diff信息
    Q.all([infoPromise, diffPromise]).spread(function(info, result) {
        var reviewers;
        //reviewer可以单写
        if (Array.isArray(config.reviewers)) {
            reviewers = config.reviewers.join(',');
        } else {
            reviewers = config.reviewers;
        }

        var urlBase = info.url.replace(/\/\/[^@]*@/g,'//');
        
        //获取svn diff信息成功，准备发起code review
        request.post('http://elk.baidu.com:80/esb/api/cooder/createIssue/v1/createIssueByDiff?elk_token=' + token, {
            formData: {
                subject: config.subject,
                owner  : config.owner,
                data   : {
                    value: result,
                    options: {
                        filename: 'upload.diff',
                        contentType: 'application/octet-stream',
                    }
                },
                base: urlBase,
                reviewers: reviewers,
                cc: config.owner + ',' + reviewers,
                description: config.description,
                send_mail: config.send_mail.toString()
            }
        }, function(error, response, dataRaw) {
            try {
                //console.log(dataRaw);
                var data = JSON.parse(dataRaw);
                if (data.status != 1) {
                    console.log('push code review error', data);
                }
                console.log('ISSUE='.green, data.data);
                callback && callback(data, null);
            } catch (e) {
                console.log('push code review error', e);
                //process.exit();
                callback && callback(dataRaw, null);
            }
        });

    }).catch(function (error) {

        error = error || 'network error';
        console.log(error);
        callback && callback(error, null);
        //process.exit();
    });
}
module.exports = exports;
// If we're being called from the command line, just execute, using the command-line arguments.
if (require.main && require.main.id === module.id) {
    exports();
}