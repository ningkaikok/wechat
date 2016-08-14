'use strict'

var sha1 = require('sha1');
var getRawBody = require('raw-body')
var Wechat = require('./wechat');
var util = require('./util');
// var bodyParser = require('body-parser');
// require('body-parser-xml')(bodyParser);

module.exports = function (opts) {
    var wechat = new Wechat(opts);
    return function *(next) {
        var that = this;
        var token = opts.token;
        var signature = this.query.signature;
        var echostr = this.query.echostr;
        var timestamp = this.query.timestamp;
        var nonce = this.query.nonce;
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);

        if (this.method === 'GET') {
            console.log('GET');
            if (sha == signature) {
                this.body = echostr + '';
            } else {
                this.body = 'wrong';
            }
        }
        else if (this.method === 'POST') {
            console.log('POST');
            if (sha !== signature) {
                this.body = 'wrong';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })

            var content = yield  util.parseXMLAsync(data);
            var message = util.formatMessage(content.xml);
            // var message = content.xml;
            // //设置返回数据header
            // res.writeHead(200, {'Content-Type': 'application/xml'});
            // //关注后回复
            // if (content.body.xml.event === 'subscribe') {
            //     var resMsg = autoReply('text', content.body.xml, '欢迎关注');
            //     res.end(resMsg);
            // } else {
            //     var info = encodeURI(req.body.xml.content);
            //     turingRobot(info).then(function (data) {
            //         var response = JSON.parse(data);
            //         var resMsg = autoReply('text', req.body.xml, response.text);
            //         res.end(resMsg);
            //     })
            // }

            if(message.MsgType === 'event'){
                if(message.Event ==='subscribe'){
                    var now = Date().getTime();
                    that.status = 200;
                    that.type = 'application/xml';
                    var reply = '<xml>'+
                                '<ToUserName><![CDATA['+message.FromUserName+']]></ToUserName>'+
                                '<FromUserName><![CDATA['+message.ToUserName+']]></FromUserName>'+
                                '<CreateTime>'+now+'</CreateTime>'+
                                '<MsgType><![CDATA[text]]></MsgType>'+
                                '<Content><![CDATA[感谢您的关注]]></Content>'+
                                '</xml>';
                    console.log(reply);
                    that.body = reply;
                    return;
                }
            }
        }
    }

}


