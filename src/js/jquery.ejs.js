/*global jQuery:false, $:false, window:false, t:false*/
/**
 * jQuery ejs(embedded javascript snippet,嵌入式javascript代码片断)
 * 轻量级的JS模板，尽量提高运行效率和减少代码的大小
 * 感谢：http://www.cnblogs.com/rubylouvre/archive/2011/03/03/1969718.html
 *
 * Copyright (c) 2011-2013 Mike Chen (mike.cyc@gmail.com)
 *
 *
 *
 * @version 2.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
 **/
 
/**
 * 依赖t.js, https://github.com/jasonmoo/t.js
 **/

/**
 * 修改记录
 * 1.0.0 [2012-01-17] 初始化代码
 * 1.0.1 [2012-03-15] 增加注释，修改一些小Bug
 * 1.0.2 [2012-03-16] 修改模板已经存在时回调函数在同一线程而出现运行不正常的问题
 * 1.0.3 [2012-03-22] 增加模板加载队列的功能，为了避免同时Ajax请求
 * 1.0.4 [2012-03-23] 增加队列运行时间限制，避免上一个运行失败后面的都没有办法运行的问题
 * 1.0.5 [2012-05-02] 解决分割符侧边的空白被删除的问题
 * 2.0.0 [2013-07-16] 从安全方面考虑，为了避免用eval这个函数，采用了第三方模板解释t.js
 **/
 
/**
加载Template采用.分隔命令空间两种方法：
第一种是嵌入到网页上，直接用$.ejsTpl(name, value)或者$.ejsTpl({name: value})来设置
第二种是动态去加载，如果判断本地没有的话将加载服务器上的文件，采用path+name(before mark dot)+ext方式加载，如果模板加载错误提示错误信息。
*/

/**
<%# 这是注释 %>	 <%# 导入子模板 %>
<%: CSS选择符 %>	 <%: tds_tmpl %>，如果.开头表示继承当前的命名空间
*/

/** 应用举例
模板
<% template text %>
  <div>{{=name}}</div>Hello 1
  <p>测试</p>
  <%: .text2 %>
<%/template %>

<% template text2 %>
  <div>{{=id}}</div>Hello 2
<%/template %>

调用方式
$.ejs({name: 'test.text', data:{name: 'Hello world', id: '中文'}, back: function(x){
    console.log(x);
}});

输出
<div>Hello world</div>Hello 1
  <p>测试</p>
<div>中文</div>Hello 2
*/

(function ($) {
//定义一些针对这个插件的全局变量

var axl = 0,
queue = [], //队列
dequeue = function(){
    if(!axl){
        var f = queue.shift();
        if(f){
            f();
        }
    }
},

tps = {}, //原始模板文件或者缓存生成的Template

/*
tpl: '', //template string, 如果没有的话到服务器加载
*/
st = {//在版本2.0之后，因用了第三方的模板t.js，left和right只是匹配加载分割模板，生成HTML用t.js默认的{{和}}
    left : "<%",//左边匹配符
    right : "%>",//右边匹配符
    path: '/tpl/',//服务器加载模板路径
    name: 'main',//默认主要文件名
    ext: '.html',//文件后缀名
    cache: true, //是否缓存
    data: {}, //数据
    back: $.noop //回调函数
};

//设置默认参数
$.ejsSetup = function (s) {
    $.extend(st, s);
};

//设置原始模板
//$.ejsTpl(name, value)或者$.ejsTpl({name: value})
$.ejsTpl = function(n, v){
    if(v){
        var t = {};
        t[n] = v;
        n = t;
    }
    $.extend(tps, n);
};

$.ejs = function (s) {
    s = $.extend({}, st, s);
    if(!s.cache){
        delete(tps[s.name]);
    }
    if(s.tpl && !(tps[s.name] && s.cache)){
        tps[s.name] = s.tpl;
    }
    
    var rl = new RegExp(s.left+"[ \\t]*"),//得到指定的分隔符正则表达式
    rr = new RegExp("[ \\t]*"+ s.right),
    
    gtp = function(n, b){//得到服务器模板
        n = n.split('.', 1)[0];
        $.get(s.path+ n+ s.ext, function(x){
            var re = new RegExp(s.left+'[ \\t]*template[ \\t]*(\\w*?)[ \\t]*'+s.right+'\\s*([\\s\\S]*?)\\s*'+s.left+'/[ \\t]*template[ \\t]*'+s.right, "g"), 
            r;
            while((r = re.exec(x)) !== null){
                tps[n+'.'+r[1]] = r[2];
            }
            b();
        });
    },
    
    dtp = function(name, back){
        var bf, ar, i, l,
        et = function(){//解释模板语言
            var sm, el, lg, 
            nt = function(x){
                bf.push(x.join(''));
                //处理静态HTML片断
                if(el[1]){
                    bf.push(el[1]);
                }
                et();//再继续解释模板
            };
            if(!bf){
                bf = [];
                ar = tps[name].split(rl);
                i = 0;
                l = ar.length;
            }
            while(i < l){
                sm = ar[i++];
                el = sm.split(rr);
                if(el.length>1 || -1 !== sm.indexOf(rr)){//避开IE的split bug
                    switch(el[0].charAt(0)){
                        // case '='://处理后台返回的变量（输出到页面的)
                        // lg = el[0].substr(1);
                        // bf.push(sh, -1 !== lg.indexOf('@') ? lg.replace(at, "$1data."): lg, eh);
                        // break;
                        case ':': //处理插入新的代码片段，相当于插入还没有解释的模板代码
                        lg = $.trim(el[0].substr(1));
                        dtp(0 === lg.indexOf('.') ? name.split('.', 1)[0]+lg: lg, nt);//判断是否有前缀.
                        return;//在这里产生断点
                        case '#'://处理注释
                        break;
                        default:
                        bf.push(el[0]);
                    }
                    //处理静态HTML片断
                    if(el[1]){
                        bf.push(el[1]);
                    }
                }else{
                    //处理静态HTML片断
                    bf.push(el[0]);
                }
            }
            tps[name] = bf;
            back(bf);
        };
        if(tps[name]){
            setTimeout(function(){//产生断点，调用回调函数就不会在同一线程
                if($.isArray(tps[name])){
                    back(tps[name]);
                }else{
                    et();
                }
            }, 0);
        }else{
            gtp(name, et);
        }
    };
    
    queue.push(function(){
        axl = setTimeout(function(){//加锁并限制时间，这样可以避免后面的队列都没有办法运行
            axl = 0;
            dequeue();
        }, 5000);
        dtp(s.name, function(x){//返回的是数组
            var tpl = new t(x.join(''));
            s.back(tpl.render(s.data));
            if(axl){
                clearTimeout(axl);
                axl = 0;
            }
            dequeue();
        });
    });
    dequeue();
};
    
}(jQuery));
