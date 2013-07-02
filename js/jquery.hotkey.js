/*global jQuery:false, $:false, window:false */
/**
 * jQuery hotkey 插件，只是简单地封装，没有提供什么高级的功能
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 * 
 *
 * @version 1.0.1
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2012-03-23] 初始化代码
 * 1.0.1 [2012-04-12] 增加使用方法说明
**/

//使用说明
// $(dom).hotkey('keydown.ctrl+shift+alt+meta+34,32,24-234', {disableInInput:1||0}, function(e){});

//disableInInput
(function($){//keydown.ctrl+shift+alt+meta+34,32,24-234
var ak = ['ctrl', 'shift', 'alt', 'meta'], al = ak.length;
$.fn.hotkey = function(t, s, fn) {
    var i, ko = {}, cl = 0,
    k = t.split('.')[1].split('+'),
    cc = k[k.length-1].split(',');
    for(i=0; i<k.length-1; i++){//格式化控制键
        ko[k[i]] = true;
    }
    for(i=0;i<cc.length;i++){
        if(-1 !== cc[i].indexOf('-')){
            cc[i] = cc[i].split('-');
            cc[i][0] = parseInt(cc[i][0], 10);
            cc[i][1] = parseInt(cc[i][1], 10);
        }else{
            cc[i] = parseInt(cc[i], 10);
        }
    }
    cl = cc.length;
    if($.isFunction(s)){
        fn = s;
        s = undefined;
    }
    this.bind(t, s, function(e){//a=65,z=90
        if(s && s.disableInInput && $(e.target).is(':input')){//判断是否在表单元素
            return;
        }
        for(i=0; i<al; i++){//判断控制键
            if(ko[ak[i]] ^ e[ak[i]+'Key']){
                return;
            }
        }
        var c = e.keyCode || e.which;
        for(i=0; i<cl; i++){//判断键码
            if(c === cc[i] || ($.isArray(cc[i]) && c>=cc[i][0] && c<=cc[i][1])){
                return fn.apply(this, arguments);
            }
        }
        //console.log(1);
    });
    return this;
};

}(jQuery));

