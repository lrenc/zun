var fs   = require('fs');
var path = require('path');

var setter = {
    setToken: function(token) {
        var data = {
            token: token
        };

        var file = path.join(__dirname, '../lib/', 'global.json');
        fs.writeFile(file, JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
};
module.exports = setter;