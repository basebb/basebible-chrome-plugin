/*global jQuery:false, $:false, window:false*/
/**
 * jQuery 日期和时间格式插件
 * 感谢：Steven Levithan <stevenlevithan.com>
 *
 * Copyright (c) 2012 Mike Chen (mike.cyc@gmail.com)
 *
 *
 *
 * @version 2.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
 **/

/**
 * 修改记录
 * 1.0.0 [2012-05-03] 初始化代码，增加Date的快捷方式
 * 1.0.1 [2012-05-07] 增加设置初始化函数：dateFormatSetup
 * 2.0.0 [2012-05-21] 把插件名字dateFormat修改为date，增加parse方法
 **/
 


(function ($) {
//定义一些针对这个插件的全局变量
var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-+]\d{4})?)\b/g,
timezoneClip = /[^\-+\dA-Z]/g,
pad = function (val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len){
        val = "0" + val;
    }
    return val;
},
st = {
    masks: {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    },
    i18n: $.ln.date
};

$.dateSetup = function(s){
    $.extend(st, s);
};

$.dateFormat = function (date, mask, utc) {
    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length === 1 && $.type(date) === "string" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date();

    mask = st.masks[mask] || mask || st.masks["default"];

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) === "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }

    var	u = utc ? "getUTC" : "get",
        d = date[u + "Date"](),
        D = date[u + "Day"](),
        m = date[u + "Month"](),
        y = date[u + "FullYear"](),
        H = date[u + "Hours"](),
        M = date[u + "Minutes"](),
        s = date[u + "Seconds"](),
        L = date[u + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
            d:    d,
            dd:   pad(d),
            ddd:  st.i18n.dayNs[D],
            dddd: st.i18n.dayNames[D],
            m:    m + 1,
            mm:   pad(m + 1),
            mmm:  st.i18n.monthNs[m],
            mmmm: st.i18n.monthNames[m],
            yy:   String(y).slice(2),
            yyyy: y,
            h:    H % 12 || 12,
            hh:   pad(H % 12 || 12),
            H:    H,
            HH:   pad(H),
            M:    M,
            MM:   pad(M),
            s:    s,
            ss:   pad(s),
            l:    pad(L, 3),
            L:    pad(L > 99 ? Math.round(L / 10) : L),
            t:    H < 12 ? "a"  : "p",
            tt:   H < 12 ? "am" : "pm",
            T:    H < 12 ? "A"  : "P",
            TT:   H < 12 ? "AM" : "PM",
            Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
        };

    return mask.replace(token, function ($0) {
        return flags[$0] !== undefined ? flags[$0] : $0.slice(1, -1);//删除单引号或者双引号
    });
};

Date.prototype.format = function (mask, utc) {
	return $.dateFormat(this, mask, utc);
};

//================================================分隔线==================================================
var dps = Date.parse,
regz = /(\\|\^|\$|\*|\+|\?|\{|\}|\.|\|)/g,//给正则的字符转义
regs ={//匹配字典
    d:    '(\\d)',
    dd:   '(\\d{2})',
    ddd:  '([^0-9 \\f\\n\\r\\t\\v]+)',
    dddd: '([^0-9 \\f\\n\\r\\t\\v]+)',
    m:    '(\\d\\d?)',
    mm:   '(\\d{2})',
    mmm:  '([^0-9 \\f\\n\\r\\t\\v]+)',
    mmmm: '([^0-9 \\f\\n\\r\\t\\v]+)',
    yy:   '(\\d{2})',
    yyyy: '(\\d{4})',
    h:    '(\\d\\d?)',
    hh:   '(\\d{2})',
    H:    '(\\d\\d?)',
    HH:   '(\\d{2})',
    M:    '(\\d\\d?)',
    MM:   '(\\d{2})',
    s:    '(\\d\\d?)',
    ss:   '(\\d{2})',
    l:    '(\\d{3})',
    L:    '(\\d{2})',
    t:    '([ap])',
    tt:   '([apm]{2})',
    T:    '([AP])',
    TT:   '([APM]{2})',
    Z:    '([A-Z]+(?:[\\-+]\\d{4})?)',//e.g. UTC or GMT-0500
    o:    '([\\-\\+]\\d{4})',// e.g. -0500 or +0230.
    S:    '([a-z]{2})'
};
$.dateParse = function(str, mask, utc){
    if(!mask){
        return dps(str);
    }
    var li = 0, rg = ['^'], o, i, ma;
    mask = st.masks[mask] || mask || st.masks["default"];
    if (mask.slice(0, 4) === "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }
    ma = mask.match(token);
    token.lastIndex = 0;
    while((o = token.exec(mask)) !== null){//采用正则表达式匹配，转化为数字或者非数字匹配
        if(li >= 0){
            rg.push(mask.substring(li, o.index).replace(regz, "\\$1"));
        }
        li = token.lastIndex;
        i = regs[o[0]];
        if(i){
            rg.push(i);
        }else{
            rg.push('('+o[0].slice(1, -1).replace(regz, "\\$1")+')');//注释的字符
        }
    }
    rg.push('.*$');
    o = new RegExp(rg.join('')).exec(str);
    var dm = {}, v, mv, ui;
    if(o){//把字符串转化为日期
        for(i=0; i<ma.length; i++){
            v = o[i+1];
            mv = ma[i];
            ui = mv.slice(-1);
            if(v && dm[ui] === undefined){
                switch(mv){
                case 'd':
                case 'dd':
                case 'm':
                case 'mm':
                case 'yyyy':
                case 'H':
                case 'HH':
                case 'M':
                case 'MM':
                case 's':
                case 'ss':
                case 'l':
                case 'L':
                    dm[ui] = parseInt(v, 10);
                break;
                case 'mmm':
                    dm[ui] = $.inArray(v, st.i18n.monthNs)+1;
                break;
                case 'mmmm':
                    dm[ui] = $.inArray(v, st.i18n.monthNames)+1;
                break;
                case 'yy'://省略的年份
                    v = parseInt(v, 10);
                    dm[ui] = v<50 ? v+2000: v+1900;
                break;
                case 'h':
                case 'hh':
                    dm[ui] = parseInt(v, 10)%12;
                break;
                case 't':
                case 'tt':
                case 'T':
                case 'TT'://上午或者下午
                    ui = ui.toLowerCase();
                    dm[ui] = v.slice(0, 1).toLowerCase() === 'p'? 12: 0;
                break;
                case 'Z'://世界时间
                case 'o':
                    dm[ui] = v;
                break;
                }
            }
        }
        //整理数组
        if(dm.Z || dm.o){
            utc = true;
        }
        v = new Date();
        ui = utc ? "getUTC" : "get";
        if(!dm.H){
            dm.H = (dm.h||0) + (dm.t||0);
        }
        o = dps((dm.m||(v[ui+'Month']()+1))+'/'+ (dm.d||v[ui+'Date']()) +'/'+(dm.y||v[ui+'FullYear']())+' '+ dm.H +':'+ (dm.M||0) +':'+ (dm.s||0)+ (utc ? ' '+(dm.o||dm.Z||'UTC'):''));
        if(o && (dm.l || dm.L)){//调整毫秒值
            o += (dm.l || dm.L);
        }
    }else{
        o = NaN;//无效的时间
    }
    return o;
};

Date.parse = $.dateParse;

}(jQuery));
