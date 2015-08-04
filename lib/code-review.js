var Q        = require('q');
var svn      = require('svn-interface');
var request  = require('request');
var svnInfo  = require('svn-info');
var opener   = require("opener");

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
        svn.diff(config.path, {
            'xml': false
        }, function (error, data) {
            if (error) {
                reject(data);
            } else {
                resolve(data);
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
                console.log(dataRaw);
                var data = JSON.parse(dataRaw);
                if (data.status == 1) {
                    //自动打开浏览器
                    opener('http://cooder.baidu.com/' + data.data);
                } else {
                    console.log('push code review error', data);
                    //process.exit();
                }
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