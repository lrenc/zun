var fs         = require('fs');
var path       = require('path');
var init       = require('./init');
var util       = require('./util');
var codereview = require('../lib/code-review');

//获取token
function getToken() {
    //找到global文件
    var file = path.join(__dirname, '../lib/', 'global.json');
    var data = null;
    try {
        data = fs.readFileSync(file);
        data = JSON.parse(data.toString());
        if (data.token) {
            return data.token;
        }
        setTimeout(function() {
            console.log([
                'no token found.',
                'please use zun config --global token "your_token"'
            ].join(' '));
        });
    } catch (e) {
        console.error('error happended! >_<');
    }
    return '';
}
//cooder
exports.run  = function(options) {
    var p = './zun-conf.json';
    fs.exists(p, function(exists) {
        if (exists) {
            fs.readFile(p, function(err, data) {
                if (err) {
                    console.log('read zun conf error');
                    return;
                }
                try {
                    data = JSON.parse(data.toString());
                } catch (e) {
                    console.error('parse zun conf data error');
                    return;
                }
                if (!data.cooder) {
                    //data.cooder不存在
                    init.run(function(answer) {
                        var token = getToken();
                        if (!token) {
                            return;
                        }
                        answer.token = token;
                        codereview(answer);
                    });
                } else {
                    var token = getToken();
                    if (!token) {
                        return;
                    }
                    data.cooder.token = token;
                    codereview(data.cooder);
                }

            });
        } else {
            //文件不存在，引导用户依次填写
            init.run(function(answer) {
                var token = getToken();
                if (!token) {
                    return;
                }
                answer.token = token;
                codereview(answer);
            });
        }
    });
}