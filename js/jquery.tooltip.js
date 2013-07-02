/*global jQuery:false, $:false, window:false */
/**
 * jQuery tooltip
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 2.3.5
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 2.0.2 [2010-05-01] 修改显示方式为谈入谈出的效果
 * 2.0.3 [2010-05-04] 修改闪烁太厉害的问题，增加当鼠标移到上面时不隐藏的功能
 * 2.0.4 [2010-06-03] 增加显示Title的功能
 * 2.1.0 [2010-06-10] 增加延时显示的功能
 * 2.1.1 [2010-06-12] 修改在某些情况Tooltip不消失的Bug
 * 2.1.2 [2010-06-12] 增加对象拖动时Tooltip消失的功能
 * 2.1.3 [2010-07-06] 修改在页面模拟历史记录时Tooltip不会自动消失的Bug
 * 2.1.4 [2010-12-16] 采用jQuery 1.4.4，隐藏的元素可以定位。增加指定坐标位置的功能，格式：[left, top, width, height]
 * 2.1.5 [2010-12-20] 修改宽度固定的Bug，前一次有宽度设置，如果后面没有的话会沿用原来的宽度
 * 2.2.0 [2011-01-18] 增加Tooltip加载到哪个容器的功能，实现Tooltip随着滚动条的滚动而一起移动
 * 2.2.1 [2011-02-25] 修改控件得到焦点的方法，采用发送事件的方法
 * 2.2.2 [2011-03-03] 增加参数html传入dom或$(dom)的功能
 * 2.2.3 [2011-03-08] 修改参数html传入dom或$(dom)的功能引起的bug
 * 2.2.4 [2011-03-17] 修改sticky的方式，如果为2的话点击也不会隐藏
 * 2.2.5 [2011-03-19] 修改如果在同一个元素里切换没有定位的bug
 * 2.2.6 [2011-04-01] Tooltip容器增加Function方式
 * 2.3.0 [2011-04-13] Tooltip增加一个命名空间的功能
 * 2.3.1 [2011-04-19] 增加对象拖动时是否显示Tooltip的功能
 * 2.3.2 [2011-04-19] 修改mouseout有时监听不到，Tooltip没有自动消失的bug，增加了mousemove来监听
 * 2.3.3 [2011-04-25] 修改鼠标移到Tooltip之上还会消失的bug
 * 2.3.4 [2011-05-19] 修改绝对定位没有加载到对应的图层的bug
 * 2.3.5 [2011-11-24] 增加对应组件释放时隐藏Tooltip
**/

(function($){
//var d = $('<div style="display:none;"><div class="hd"></div><div class="bd"></div><div class="ft bb"></div></div>'),

/*{
position: 'auto', //定位 auto, top, right, bottom, left
sticky: false, //是否需要点击才隐藏
width: 'xxxpx', //宽度设置
html: 'xxxx'|| dom || $(dom), //要显示的Html
toFocus: false, //是否同时设置焦点
toSelect: false, //是否同时选中文本
title: false, //是否显示title的文本
con: $(dom)|| function, //Tooltip在哪个容器生成，对于固定的坐标地址方式无效
dragsh: 0 | 1, //是否在拖放过程中显示
}*/
var dc = $(document),
bod = $('body'),
st = {
    position: 'auto', //位置
    mod: 'mod',
    cls: 'gtl',
    queue: 'tooltip',
    dat: 'dragstatic', //拖动对象在拖动的时候数据为1
    delay: 0, //延时显示(毫秒)
    fixps: 0, //固定的坐标地址和大小，格式：[left, top, width, height]
    hide: 200, //隐藏延时(毫秒)
    sticky: 0, //0|1|2 是否需要点击才能隐藏，如果为2则点击不能隐藏
    own: dc
},
sq = {}, //命名空间

os = function(d, s){
    // s.using = function(x){//using选项是查看源代码时发现的，帮助文档里没有说明
        // $(this).animate(x);
    // };
    d.offset({top: Math.round(s.top), left: Math.round(s.left)});
}, gq = function(ns){//保存对应命名空间需要用到的变量
    if(!sq[ns]){
        var d = $('<div style="display:none;"><div class="hd"></div><div class="bd"></div><div class="ft bb"></div></div>');
        sq[ns] = {
            //ly, //延迟隐藏延时
            //sd,//Tooltip对象
            d: d,
            bd: $('.bd', d),
            ft: $('.ft', d),
            un: 1 //是否Unbind事件，用于鼠标再次移进来的情况
        };
    }
    return sq[ns];
};

//设置默认参数
$.tooltipSetup = function(s){
    $.extend(st, s);
};

$.fn.tooltip = function(s){
    var o = this[0], $o = $(o), tih;//定时器句柄
    s = $.extend({}, st, s);
    if(o && (s.dragsh || !$o.data(s.dat))){
        if(s.title){
            s.html = o.getAttribute('title');
        }
        if(s.html){
            if(s.title){
                o.removeAttribute('title');
                $o.one('mouseout', function(){
                    o.setAttribute('title', s.html);
                });
            }
            
            var ns = s.queue, q = gq(ns), //命名空间变量
            d = q.d, bd = q.bd, ft = q.ft, fx = s.fixps,
            ub = function(){
                var x = '.' + ns;
                dc.unbind(x);
                q.sd.unbind(x);
                bd.unbind(x);
                $o.unbind(x);
                $(s.own).unbind(x);
                q.sd = 0;
            },
            show = function(){
                //把View加载到浏览器的DOM中
                if(s.con){
                    if($.isFunction(s.con)){
                        s.con($o).append(d);
                    }else{
                        s.con.append(d);
                    }
                }else{
                    bod.append(d);
                }
                //处理隐藏Tooltip
                var hid = function(){
                    if(tih){
                        clearTimeout(tih);
                        tih = 0;
                        return;
                    }
                    if(q.ly){
                        clearTimeout(q.ly);
                    }
                    q.ly = setTimeout(function(){
                        q.ly = 0;
                        d.fadeOut(function(){
                            if(q.sd && q.un){//取消事件绑定
                                ub();
                            }else{
                                q.un = 1;
                            }
                        });
                    }, s.hide);
                },
                fps = function(){//定位位置
                    var dw = dc.width(), dh = dc.height(), fs,
                    pos = fx ? {left:fx[0], top:fx[1]} :$o.offset(),
                    w = bd.outerWidth(),
                    h = bd.outerHeight(),
                    fh = ft.height(),
                    fw = ft.width(),
                    ow = fx ? fx[2]: $o.outerWidth(),
                    oh = fx ? fx[3]: $o.outerHeight();
                    if('auto' === s.position){
                        ft[0].className = 'ft bb';
                        if(h + fh > pos.top){
                            s.position = 'bottom';
                        }else{
                            s.position = 'top';
                        }
                    }
                    switch(s.position){
                        case 'top':
                        ft[0].className = 'ft bb';
                        fs = pos.left + w - dw + 5;
                        if(fs > 0){
                            os(d, {left:pos.left - fs, top: pos.top - h - fh});
                            ft.css({left: Math.round(fs + 5)});
                        }else{
                            os(d, {left:pos.left, top: pos.top - h - fh});
                        }
                        break;
                        case 'bottom':
                        ft[0].className = 'ft bt';
                        fs = pos.left + w - dw + 5;
                        if(fs > 0){
                            os(d, {left:pos.left - fs, top: pos.top + oh + fh});
                            ft.css({left: Math.round(fs + 5)});
                        }else{
                            os(d, {left:pos.left, top: pos.top + oh + fh});
                        }
                        break;
                        case 'right':
                        ft[0].className = 'ft bl';
                        fs = pos.top + h - dh + 5;
                        if(fs > 0){
                            os(d, {left:pos.left + ow + fw, top: pos.top - fs});
                            ft.css({top: Math.round(fs + 5)});
                        }else{
                            os(d, {left:pos.left + ow + fw, top: pos.top});
                        }
                        break;
                        case 'left':
                        ft[0].className = 'ft br';
                        fs = pos.top + h - dh + 5;
                        if(fs > 0){
                            os(d, {left:pos.left - w - fw, top: pos.top - fs});
                            ft.css({top: Math.round(fs + 5)});
                        }else{
                            os(d, {left:pos.left - w - fw, top: pos.top});
                        }
                        break;
                        default: hid();return;
                    }
                }, bj = function(){
                    if(!s.sticky){
                        $o.bind('mouseout.' + ns, hid);
                        bd.bind('mouseover.' + ns, function(){//鼠标移到Tooltip
                            if(q.ly){
                                clearTimeout(q.ly);
                                q.ly = 0;
                            }else{
                                q.un = 0;
                                d.stop(true, true);
                            }
                        });
                        dc.bind('mousemove.' + ns, function(e){
                            var t = e.target;
                            if(t !== o && t !== d[0] && !$o.has(t)[0] && !d.has(t)[0]){//鼠标移出隐藏
                                hid();
                            }
                        });
                    }
                    if('number' !== typeof(s.sticky) || s.sticky < 2){//如果为2的话，点击也不能关闭
                        dc.bind('mousedown.'+ ns, function(e){
                            var t = e.target;
                            if(t !== o && !$o.has(t)[0]){
                                hid();
                            }
                        });
                    }
                    dc.bind('act.'+ ns, hid);
                    if(!s.dragsh){
                        $o.bind('drag.' + ns, function(e, x){
                            if('start' === x){
                                hid();
                            }
                        });
                    }
                    $o.bind('hidetip.'+ns, hid);//如果是hide事件，把tooltip隐藏
                    $(s.own).bind('empty.'+ns, hid);//当组件释放时隐藏
                };
                if(q.sd && q.sd[0] === o){//消除闪烁
                    if(fx){//如果是指定位置
                        fps();
                    }else{
                        if('string' === typeof s.html){
                            bd[0].innerHTML = s.html;
                        }else{
                            bd.empty().append($(s.html));
                        }
                    }
                    d[0].className = s.mod + ' ' + s.cls;
                    if(q.ly){//如果还没有隐藏
                        clearTimeout(q.ly);
                        q.ly = 0;
                        ub();
                    }else{//如果已经隐藏
                        q.un = 0;
                        d.stop(true, true).fadeIn();
                    }
                    bj();
                    if(!fx){
                        fps();
                    }
                    return;
                }
                
                //显示Tooltip，先增加延时
                tih = setTimeout(function(){
                    tih = 0;
                    d[0].className = s.mod + ' ' + s.cls;
                    //是否选中文本
                    if(s.toSelect){
                        o.select();
                    }
                    if(s.width){
                        d.css({width: s.width});
                    }else{
                        d.css({width: 'auto'});
                    }
                    if(q.ly){
                        clearTimeout(q.ly);
                        q.ly = 0;
                    }
                    d.stop(true, true).css({left:-99999, top:0}).hide().fadeIn();
                    
                    if('string' === typeof s.html){
                        bd[0].innerHTML = s.html;
                    }else{
                        bd.empty().append($(s.html));
                    }
                    ft.removeAttr('style');
                    if('left' === s.position || 'right' === s.position){
                        ft[0].className = 'ft bl';
                    }
                    fps();
                    q.sd = $o;
                    bj();
                }, s.delay);
            };
            //是否焦点定位
            if(s.toFocus){
                setTimeout(function(){o.focus();show();}, 9);
            }else{
                show();
            }
        }
    }
    return this;
};
}(jQuery));