/*global jQuery:false, $:false, window:false */
/**
 * jQuery custom date picker
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.2.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.1.1 [2010-04-15] 增加了对Disable和Readonly的判断
 * 1.1.2 [2010-05-04] 增加发送Change事件
 * 1.1.3 [2010-05-05] 格式化日期，在月份和日期前加0
 * 1.1.4 [2010-06-11] 取消定时刷新更新数据，修改为监听update事件更新同步数据
 * 1.1.5 [2010-07-13] 增加是否显示Footer的选项
 * 1.1.6 [2011-02-22] 修改由原来的全局css：g-dp 修改为 gdp
 * 1.1.7 [2011-04-25] 增加属性con，可以根据con确定在哪里定位
 * 1.2.0 [2012-05-11] 修改按键和时间格式化问题，删除mod Class
**/

(function($){
var bd = $('body'), doc = $(document), win = $(window), o = $('<div></div>'), co, 
/*
con: $(dom)|| function, //弹出日期选择层在哪个容器生成，对于固定的坐标地址方式无效
*/
st = {
    cls: 'gdp',  //CSS样式
    own: document, //所属模块
    //btnShow: 0, //是否显示Footer的按键
    today: 1, //是否显示今天
    ln: $.ln.datepicker //语言包
},
cle = function(){
    co = 0;
    o[0].innerHTML = '';
};

//bd.append(o);

//设置默认参数
$.datepickerSetup = function(s){
    $.extend(st, s);
};

doc.click(cle);
win.resize(cle);

o.click(function(e){
    var t = e.target, m, a, b, c, d, w;
    if('A' === t.tagName){
        c = $(o[0].firstChild);
        w = c.data('own');
        switch(t.parentNode.className.substr(0, 2)){
            case 'hd':
            m = $('em', t.parentNode);
            a = parseInt(m[0].innerHTML, 10);
            b = parseInt(m[1].innerHTML, 10);
            switch(t.getAttribute('t')){
                case '0':
                    if(a>1){
                        a--;
                    }
                    m[0].innerHTML=a;
                    break;
                case '1':
                    if(a<9999){
                        a++;
                    }
                    m[0].innerHTML=a;
                    break;
                case '2':
                    if(b>1){
                        b--;
                    }else if(a > 1){
                        b = 12;
                        a--;
                        m[0].innerHTML = a;
                    }
                    m[1].innerHTML=b;
                    break;
                case '3':
                    if(b<12){
                        b++;
                    }else if(a<9999){
                        b = 1;
                        a++;
                        m[0].innerHTML = a;
                    }
                    m[1].innerHTML=b;
                    break;
            }
            o.find('div.bd').html(w[1]([], new Date(a, b-1, w[2]||1)).join(''));
            break;
            case 'bd':
            m = $('.hd>em', c);
            d = m[0].innerHTML + '-'+ m[1].innerHTML.replace(/^(\d)$/, "0$1") +'-'+ t.innerHTML.replace(/^(\d)$/, "0$1");
            if(w[0].val() !== d){
                w[0].val(d).trigger('change');
            }
            return;
        }
    }else if('INPUT' === t.tagName){
        c = $(o[0].firstChild);
        w = c.data('own');
        b = new Date();
        d = b.getFullYear()+ '-'+ (b.getMonth()+1).toString().replace(/^(\d)$/, "0$1") +'-'+ b.getDate().toString().replace(/^(\d)$/, "0$1");
        if(w[0].val() !== d){
            w[0].val(d).trigger('change');
        }
        return;
    }
    return false;
});

$.fn.datepicker = function(s) { //s: options
    s = $.extend({}, st, s);
    $(s.own).bind('empty', function(){
        cle();
    });
    return this.each(function(){
        if('text' !== this.type){return;}
        var t = this, $t = $(this),
        $a = $t.wrap('<em class="'+ s.cls +'"></em>').after('<a></a>').next('a').click(function(e){
            var h = [], td, f, u, i, j, k, n, m, x, a, b, c, d;
            if(co){
                cle();
            }else{
                if($a.is('.ds')){$a[0].blur();return false;}//已经禁用了
                //检验日期是否正确
                u = Date.parse($t.val());
                td = new Date();
                m = [td.getFullYear(), td.getMonth(), td.getDate()];
                if(!isNaN(u)){
                    td = new Date(u);
                }
                h.push('<div class="'+ s.cls +'">');
                h.push('<div class="hd"><a t="0" title="'+ s.ln.preYear +'"></a><em>'+ td.getFullYear() +'</em><a class="n" t="1" title="'+ s.ln.nexYear +'"></a><span></span><a t="2" title="'+ s.ln.preMon +'"></a><em class="m">'+ (td.getMonth() + 1) +'</em><a class="n" t="3" title="'+ s.ln.nexMon +'"></a></div>');
                h.push('<div class="bd fix">');
                x = function(h, f){
                    h.push('<em>'+ s.ln.week[0] +'</em><em>'+ s.ln.week[1] +'</em><em>'+ s.ln.week[2] +'</em><em>'+ s.ln.week[3] +'</em><em>'+ s.ln.week[4] +'</em><em>'+ s.ln.week[5] +'</em><em>'+ s.ln.week[6] +'</em>');
                    //当前选中
                    if(!isNaN(u) && f.getFullYear()=== td.getFullYear() && f.getMonth()===td.getMonth() && f.getDate()===td.getDate()){
                        n = td.getDate();
                    }else{
                        n = 0;
                    }
                    //设置今天
                    if(f.getFullYear()=== m[0] && f.getMonth()===m[1]){
                        c = m[2];
                    }else{
                        c = 0;
                    }
                    //设置前面空白
                    b = new Date(f);
                    b.setDate(1);
                    for(i=0,j=b.getDay(); i<j; i++){
                        h.push('<a class="k"></a>');
                    }
                    a = function(i){
                        if(n === i){//选中状态
                            h.push('<a class="s">'+ i +'</a>');
                        }else if(c === i){//今天
                            h.push('<a class="t">'+ i +'</a>');
                        }else{
                            h.push('<a>'+ i +'</a>');
                        }
                    };
                    for(i=1; i<29; i++){
                        a(i);
                    }
                    j = b.getMonth();
                    for(i=29; ;i++){
                        b.setDate(i);
                        if(j === b.getMonth()){
                            a(i);
                        }else{
                            break;
                        }
                    }
                    return h;
                };
                x(h, td);
                h.push('</div>');
                if(s.today){
                    h.push('<div class="ft"><input type="button" value="'+ s.ln.today +'"/></div>');
                }
                h.push('</div>');
                ($.isFunction(s.con)? s.con($t): (s.con || bd)).append(o);
                o[0].innerHTML = h.join('');
                //为弹出层定位
                f = $t.offset();
                a = win.height();
                b = win.scrollTop();
                co = o.children('div:first');
                c = co.outerHeight();
                d = $t.outerHeight();
                if(a + b - f.top - d - c >= 5){//全部可以显示的情况
                    m = f.top + d + 1;
                }else if(f.top - b >= c + 5){//顶上显示
                    m = f.top - c -1;
                }else{//自动往上偏
                    m = a + b - c - 1;
                }
                co.offset({
                    top: Math.round(m),
                    left: Math.round(f.left)
                }).data('own', [$t, x, td.getDate()]);
            }
            return false;
        });
        //绑定定时器
        var timedo = function(){
            if(t.disabled || t.readOnly){
                $a.addClass('ds');
            }else{
                $a.removeClass('ds');
            }
        };
        timedo();
        $t.bind('update', timedo);
        $(s.own).bind('reset', function(){//处理重置事件
            setTimeout(timedo, 1);
        });
    });
};

}(jQuery));
