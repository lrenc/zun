var colors   = require('colors');
var minimist = require('minimist');

var pkg      = require('../package');

//获取命令行参数
exports.getOptions = function(argv) {
    return minimist(argv, {
        'alias': {
            h: 'help',
            v: 'version',
            d: 'directory',
            f: 'file',
            a: 'all',
            n: 'nomodify',
            g: 'global'
        }
    });
};

//help
var help = (function() {

    var format = [
        '',
        '  Command:',
        '',
        '    '+ 'format(f)'.green +'    format your code',
        '',
        '  Options:',
        '',
        '    -a,  --all'.green +'         format all files',
        '    -d,  --directory'.green +'   specifies the output directory',
        '    -f,  --file'.green +'        specifies the files',
        '    -n,  --nomodify'.green +'    modified files are not included',
        '         --icc'.green +'         ignore camelcase',
        '         --igv'.green +'         ignore global variate' 
    ].join('\n');

    var cooder = [
        '',
        '  Command:',
        '',
        '    '+ 'cooder(c)'.green +'    push code review'
    ].join('\n');

    var whole  = [
        '',
        '  Usage: '+ pkg.name.red +' <command>',
        '  Info & Help:',
        '',
        '    -v,  --version'.green +'     output the version number',
        '    -h,  --help'.green +'        output usage information',
        format,
        cooder
    ].join('\n');

    return {
        format: format,
        cooder: cooder,
        whole : whole
    }
})();

/*
 * 去掉init操作，直接在zun c中引导操作
 */

var strategy = {
    //执行format操作
    format: function(opts) {
        if (opts.help) {
            //显示帮助文档
            console.log(help.format);
            return;
        }
        require('../cli/format').run(opts);
        //执行命令
    },
    cooder: function(opts) {
        if (opts.help) {
            console.log(help.cooder);
            return;
        }
        require('../cli/cooder').run(opts);
    },
    //配置全局变量
    config: function(opts) {
        //目前只支持全局变量配置
        if (!opts.global) {
            return;
        }
        var value  = opts._[1];
        if (!value) {
            return;
        }
        var global = opts.global;
        var setter = require('../cli/setter');

        if (global === 'token') {
            //设置token全局变量
            setter.setToken(value);
            return;
        }
        if (global === 'user') {
            setter.setUser(value);
        }
    },
    init: function() {
        require('../cli/init').run();
    },
    f: function(opts) {
        this.format(opts);
    },
    c: function(opts) {
        this.cooder(opts);
    }
};

exports.parse = function() {
    var argv    = process.argv.slice(2);
    var options = exports.getOptions(argv);

    //console.log(options);
    var cmd = options._[0];
    //如果没有输入任何命令
    if (argv.length === 0) {
        options.help = true;
    }
    if (options.version) {
        console.log('\n   v%s'.green, pkg.version);
        return;
    }
    if (options.help && !cmd) {
        //输出所有帮助文档
        console.log(help.whole);
        return;
    }
    //接下来是命令输入
    if (!cmd) {
        return;
    }
    if (strategy[cmd]) {
        strategy[cmd](options);
        return;
    }
    console.log('cmd error. please use zun --help to get more information');
};