/*global jQuery:false, $:false, window:false */
/**
 * jQuery validator
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 * requir jquery.print
 * requir language packgage
 *
 * @version 1.3.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-03-18] 建立，初始化代码。
 * 1.0.1 [2011-03-21] 修改:submit被认为Button的问题
 * 1.0.2 [2011-03-22] 修改扩展规则找不到语言的bug，统一把语言包传过去
 * 1.0.3 [2011-03-23] 修改调用规则时把范围也传递过去
 * 1.0.4 [2011-03-23] 过滤没有vd的Radio和Checkbox，把回车也加到是空为否的检查中
 * 1.1.0 [2011-04-02] 增加自定义得到Input值的功能
 * 1.1.1 [2011-04-21] 修改hidden等如果有vd的属性也进行验证
 * 1.2.0 [2011-04-22] 增加验证显示Tooltip的替换者，如验证:hidden，这时需要有一个可见区域来显示Tooltip，在vd后面加上#gxxx，对应的元素属性加上vw=gxxx，前面有g代表全局，如果没有的话只在模块范围
 * 1.2.1 [2011-04-25] 增加Date类型的数据验证
 * 1.2.2 [2011-05-19] 增加vd的#后面搜索的方法，先是用jquery的方法搜索，如果没有该方法，用搜索dom的方法，如果是g开头搜索整个个DOM，如果不是只搜索own里面的元素
 * 1.3.0 [2011-05-19] 增加验证正确通过的元素也返回，用于去掉一些验证不通过时的设置
**/

/**
输入：
传入Input，检查这里面的Input
直接传入规则和参数进行验证

输出：
Input方式返回错误的元素数组[[[dom(wrong dom), [state, msg], [state, msg]...], ...], [dom(right dom), dom...]]
直接传入规则的方式返回undefind 或者 [state, msg]

组织形式：
fn.validator();//对应属性vd="验证方法/附加值|验证方法/附加值|...#寄居显示vw"
$.validator(dt, [value, param,...], msg);//dataType 缩写为 dt
*/

(function($){
var ad, //验证附加数据，用于显示出来
ln = ($.ln && $.ln.validator) || {},
r = {
    require : /.|\n+/,
    email : /^\w+([\-+.]\w+)*@\w+([\-.]\w+)*\.\w+([\-.]\w+)*$/,
    phone : /^(?:\(?[0\+]\d{2,3}\)?)[\s\-]?(?:(?:\(0{1,3}\))?\d{0,4})[\s\-](?:[\d]{7,8}|[\d]{3,4}[\s\-][\d]{3,4})(?:\-\d{1,4})?$/,
    mobile : /^(?:\(?[0\+]?\d{1,3}\)?)[\s\-]?(?:0|\d{1,4})[\s\-]?(?:(?:1\d{10})|(?:\d{7,8}))$/,
    phonecode: /(?:^\(?[0\+]\d{2,3}\)$)|(?:^(?:\(0{1,3}\))?\d{0,4}$)/,
    phonenum: /(?:^[\d]{7,8}$)|(?:^[\d]{3,4}[\s\-][\d]{3,4}$)/,
    phoneext: /^\d{1,4}$/,
    url : /^https?:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@\[\]\':+!]*([^<>\"\"])*$/,
    currency : /^[\-\+]?\d+(\.\d\d?)?$/,
    than0cur : /^\d+(\.\d\d?)?$/,
    number : /^\d+$/,
    than0num: /^[1-9]\d*$/,
    than0double: /^[1-9]\d*(\.\d+)?$/,
    zip : /^\d{6}$/,
    integer : /^[\-\+]?\d+$/,
    'double' : /^[\-\+]?\d+(\.\d+)?$/,
    english : /^[A-Za-z]+$/,
    chinese :  /^[\u0391-\uFFE5]+$/,
    unsafe : /^(([A-Z]*|[a-z]*|\d*|[\-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,
    limit: function(len, min, max){
        var c, si, sa;
        len = ('' === len) ? NaN : Number(len);
        if(isNaN(len)){
            return 3;
        }
        min = ('' === min) ? NaN : Number(min);
        max = ('' === max) ? NaN : Number(max);
        si = isNaN(min);
        sa = isNaN(max);
        c = (si && sa) ? false: (si? 1: (sa? 0: 2));//选择用哪一组语言
        min = min || 0;
        max = max || Number.MAX_VALUE;
        ad  = [len, min, max];//附加的数据
        return (min <= len && len <= max) || c;
    },
    compare: function(op1, op, op2){
        switch(op){
            case "!=":return op1 !== op2;
            case ">":return op1 > op2;
            case ">=":return op1 >= op2;
            case "<":return op1 < op2;
            case "<=":return op1 <= op2;
            default:return op1 === op2;
        }
    },
    date: function(v, min, max){//验证日期
        var r = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/, u = $.trim(v).match(r), f, i, j, k, t;
        if(!u){
            return 0;
        }
        f = new Date();
        i = parseInt(u[1], 10);
        j = parseInt(u[3], 10) - 1;
        k = parseInt(u[4], 10);
        f.setFullYear(i, j, k);
        if(f.getFullYear() !== i || f.getMonth()!==j || f.getDate()!==k){
            return 0;
        }
        ad  = [v, min, max];//附加的数据
        if(min){
            u = min.match(r);
            if(u){
                t = new Date();
                i = parseInt(u[1], 10);
                j = parseInt(u[3], 10) - 1;
                k = parseInt(u[4], 10);
                t.setFullYear(i, j, k);
                if(f.getTime() < t.getTime()){
                    return 1;
                }
            }
        }
        if(max){
            u = max.match(r);
            if(u){
                t = new Date();
                i = parseInt(u[1], 10);
                j = parseInt(u[3], 10) - 1;
                k = parseInt(u[4], 10);
                t.setFullYear(i, j, k);
                if(f.getTime() > t.getTime()){
                    return 2;
                }
            }
        }
        return true;
    }
}, f = {//只在fn.validator里使用，用于特殊化处理，最终的比较判断还是在r里面
    //d--dom模块，t--检验的元素，s--规则，ln--语言
    limit: function(d, t, s, ln){//字符串长度范围检查
        s[0] = s[0].length;
        return ['limit', s, ln.limit];
    },
    limitb: function(d, t, s, ln){//字节长度范围检查，一个汉字两字节
        s[0] = s[0].replace(/[^\x00-\xff]/g,'xx').length;
        return ['limit', s, ln.limitb];
    },
    range: function(d, t, s, ln){//数值范围检查
        return ['limit', s, ln.range];
    },
    repeat: function(d, t, s, ln){//重复性检查
        var o = $(':input[name='+ s[1] +']', d);
        s[2] = o.attr('val') || o.val();
        s[1] = '==';
        return ['compare', s, ln.repeat];
    },
    group: function(d, t, s, ln){//检查Checkbox选中的数量
        s[0] = $(':checkbox[name='+ t[0].name +']:checked', d).length;
        return ['limit', s, ln.group];
    }
}, v = { //得到value的方式

};

$.validatorSetup = function(s){//{rule:{xx}, func:{xx}, lang:{xx}}
    if(s.rule){
        $.extend(r, s.rule);
    }
    if(s.val){
        $.extend(v, s.val);
    }
    if(s.func){
        $.extend(f, s.func);
    }
    if(s.lang){
        $.extend(ln, s.lang);
    }
};

//总的验证函数
$.validator = function(dt, s, m){//s为数组,s[0] = value, m为要显示的文字
    var i = r[dt], x = -1;//如果没有对应的检查项，返回-1
    ad = [];
    if(i){
        if($.isFunction(i)){
            x = i.apply(i, s);
        }else{
            x = i.test(s[0]);
        }
    }
    if(-1 === x){
        return [-1, ln.unknow];
    }else if(true !== x){
        return [false, $.print($.isArray(m) && m[x] ? m[x]: (m || ln.wrong), ad)];
    }
    return true;//如果验证通过返回true
};

//属性表示方式：
//vd="dataType/param|..."
//req="false|0", require默认为true
$.fn.validator = function(d){
    var r = [], z = [];//保存要返回的数据, 分别是验证通过和不通过的数据
    this.each(function(){
        var ts = this, t = $(ts), vd = t.attr('vd'), vl, //先拿属性val的值，如果没有值再取value，这是为了方便js在非标准的Input下使用
        dt, i, u, vw, w, s, m, l, gd;
        if(!t.is(':input[name]') || (t.is(':hidden,:disabled,input:submit,:radio,:checkbox') && !vd)){//要求有名字的Input才有检查
            z.push(ts);
            return;
        }
        u = (vd||'').split('#');
        vw = u[1];//搜索字符串，先是用jquery的方法搜索，如果没有该方法，用搜索dom的方法，如果是g开头搜索整个个DOM，如果不是只搜索own里面的元素
        u = (u[0]||'').split('|');
        gd = function(){
            return ((vw && $.isFunction(t[vw])) ? t[vw]()[0] : (vw && $('*[vw='+ vw +']', ('g' === vw.substr(0, 1) ? null: d))[0])) || ts;
        };
        for(i=0; i<u.length; i++){
            s = (u[i] || '').split('/');
            dt = s[0] || 'require';
            vl = v[dt]? v[dt](t): (t.attr('val') || t.val());
            if('0'===t.attr('req') && !vl){//允许为空
                z.push(ts);
                return;
            }
            if(!vl){//如果值为空直接显示不能为空
                r.push([gd(), [false, ln.require]]);//[dom, [fasle|-1(unkown), lang], [fasle|-1(unkown), lang]...]
                return;
            }
            s[0] = vl;
            if(f[dt]){
                m = f[dt](d, t, s, ln);//d--dom模块，t--检验的元素，s--规则(s[0]为值)，ln--语言
                dt = m[0];
                s = m[1];
                l = m[2];
            }else{
                l = ln[dt];
            }
            s = $.validator(dt, s, l);
            if(true !== s){
                if(!w){
                    w = [gd()];
                }
                w.push(s);//[dom, [fasle|-1(unkown), lang], [fasle|-1(unkown), lang]...]
            }
        }
        if(w){
            r.push(w);
        }else{
            z.push(gd());
        }
    });
    return [r, z];
};

}(jQuery));