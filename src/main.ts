import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import { appId, appSecret } from './private';

type ErrorMap = {
    [k: string]: string
}
const errorMap: ErrorMap = {
    52001: "请求超时",
    52002: "系统错误",
    52003: "未授权用户",
    54000: "必填参数为空",
    54001: "签名错误",
    54003: "访问频率受限",
    54004: "账户余额不足",
    54005: "长query请求频繁",
    58000: "客户端IP非法",
    58001: "译文语言方向不支持",
    58002: "服务当前已关闭",
    90107: "认证未通过或未生效",
}

export const translate = (word: string) => {
    const salt = Math.random();
    const sign = md5(appId + word + salt + appSecret);
    let from: string, to: string;
    if (/[a-zA-Z]/.test(word[0])) {
        // en -> zh
        from = "en";
        to = "zh";
    } else {
        // zh -> en
        from = "zh";
        to = "en"
    }
    const query: string = querystring.stringify({
        q: word, appid: appId, from, to, salt, sign
    });

    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        let chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString();
            type BaiduResult = {
                error_code?: string,
                error_msg?: string,
                form: string,
                to: string,
                trans_result: { scr: string, dst: string }[],

            }
            const object: BaiduResult = JSON.parse(string);
            if (object.error_code) {
                console.error(errorMap[object.error_code] || object.error_msg);
                process.exit(2);
            } else {
                object.trans_result.map(obj => {
                    console.log(obj.dst);
                })
                process.exit(0);
            }
        })
    });

    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
}