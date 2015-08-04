var fs = require('fs');
// 将不需要加入检查的文件过滤掉

exports.ignoreFiles = function(callback) {
    //查找当前目录下是否有zun-conf.json文件
    var ignoreList = [];
    var path = './zun-conf.json';
    fs.exists(path, function(exists) {
        if (exists) {
            fs.readFile(path, function(err, data) {
                if (err) {
                    console.error('read zun conf error');
                    return;
                }
                try {
                    data = JSON.parse(data.toString());
                    if (data.ignore) {
                        //给每一项前添加!
                        var arr = data.ignore.map(function(item) {
                            return '!' + item;
                        });
                        callback(ignoreList.concat(arr));
                    } else {
                        callback(ignoreList);
                    }
                } catch (e) {
                    console.log(e, 'read zun conf error');
                }
            });
        } else {
            callback(ignoreList);
        }
    });
}