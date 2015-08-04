/*
 * 引导用户填写zun cooder 的各个参数
 */

var fs       = require('fs');
var path     = require('path');
var inquirer = require('inquirer');
var util     = require('./util');

var prompts  = [
    {
        'type'   : 'input',
        'name'   : 'subject',
        'message': 'subject: ',
        'default': 'zun cooder'
    },
    {
        'type'    : 'input',
        'name'    : 'owner',
        'message' : 'owner: ',
        'default' : '',
        'validate': function(owner) {
            if (!owner) {
                return "please input the owner";
            }
            return true;
        }
    },
    {
        'type'    : 'input',
        'message' : 'reviewers: ',
        'name'    : "reviewers",
        'default' : '',
        'validate': function(reviewers) {
            if (!reviewers) {
                return "please input the reviewers";
            }
            return true;
        }
    },
    {
        'type'   : 'input',
        'name'   : 'description',
        'message': 'description: ',
        'default': '',
    },
    {
        'type'   : 'confirm',
        'name'   : 'send_mail',
        'message': 'send email: ',
        'default': false
    }
];

function trim(str) {
    return str.replace(/^\s+/, '').replace(/\r\n$/, '');
}

exports.run = function(callback) {
    //引导用户生成zun-conf.json

    inquirer.prompt(prompts, function(answers) {
        //无论是改写还是新增
        var p = './zun-conf.json';
        var exists = fs.existsSync(p);
        if (exists) {
            //如果已经存在
            try {
                var content = JSON.parse(fs.readFileSync(p).toString());
            } catch (e) {
                console.error('read zun conf error', e);
                return;
            }
            if (content.cooder) {
                //已经有cooder了
                util.extend(content.cooder, answers);
            } else {
                content.cooder = answers;
            }
        } else {
            //文件不存在
            var content = {};
            content.cooder = answers;
        }
        fs.writeFile(p, JSON.stringify(content), function(err) {
            if (err) {
                console.log(err);
            }
            console.log('ok');
        });
        callback && callback(answers);
    });
}