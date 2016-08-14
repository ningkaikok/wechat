'use strict'

var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var util = require('./libs/util.js');

var config = {
    wechat: {
        appID: 'wx7034c721756bf9c3',
        appSecret: 'c8767f9085aeec9a3d5622dcb895cad4',
        token: 'kikitest',
        getAccessToken: function () {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        }
    }
}
var app = new Koa();
app.use(wechat(config.wechat));
app.listen(1234);
console.log('Listenging: 1234');
