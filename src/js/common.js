/*global jQuery:false, $:false, window:false */
//定义共同函数和方法

//产生全局guid
//[20120308]原来是在ms里，为了统一性，移到这里来
(function($){
    var id = (new Date()).getTime();
    $.cm.guid = function(){
        return(id += 99);//为了方便数据库排序，中间空出一些数字
    };
}(jQuery));

$.extend($.cm, {

//为对应的DOM绑定JS
//[20110212] 增加传入全局语言包
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
//[20110505]修改把doc，body等这些系统全局变量放到s之上，方便查找
//[20110725]增加附加参数传入
//[20111213]增加co传入一个空对象，方便函数间函数共用数据
bjs: function(d){
    var i, j, k, l, m, o, t, bj = $.bj, f, ss = $.ss, ms = $.ms, cm = $.cm, ln = $.ln, xm = $.xm;
    o = $('div.mod[id]', d);
    for(i=0,j=o.length; i<j; i++){
        var oi = o[i], $o = $(oi), id = oi.id, g, co;
        k = bj[id];
        if(k && !$o.data('guid')){//[20120531] 增加guid的检查，避免重复绑定，因为重复绑定会引起内存和事情释放的问题
            k = k.split('|');
            g = id + cm.guid();
            $o.data('guid', g);//【2010-12-22】更新原来的id绑定方式为guid方式，避免id重复的问题，保存到这里是为ubj函数使用
            co = {};
            for(l=0, m=k.length; l<m; l++){
                t = k[l].split('/');
                f = $.xm[t[0]];
                if(f){
                    f(oi, $.extend({id: g, co: co, lncm: ln.cm, ms: ms, cm: cm, xm: xm}, ss, {ln: ln[t[1] || t[0]] || {}}), t[2]);
                }
            }
        }
    }
},

//取消Dom的JS绑定
ubj: function(d){
    var i, j, o, id, s = $.ss;
    o = $('div.mod[id]', d);
    for(i=0,j=o.length; i<j; i++){
        id = $(o[i]).data('guid');//【2010-12-22】统一采用guid的方式来取消绑定
        if(id){//[20120308] 增加是否有gid的判断
            id = '.'+id;
            $(o[i]).th('empty');//发送清除JS代码事件
            s.doc.unbind(id);//取消所有在Document上的对应命名空间的绑定
            s.win.unbind(id);//取消所有在Window上的对应命名空间的绑定
        }
    }
},

//得到URL连接符
ucode: function(s){
    return (/\?/.test(s)) ? "&" : "?";
},

//通用JSON处理, x--需要处理的JSON
act: function(x){
    if(!x){
        return false;
    }
    var dc = $.ss.doc;
    dc.th('act', [x]);//[2012-01-06]增加发送信息，因为有一部分是专用的动作
    $.each(x, function(i, n){
        switch(i){
            case '200':
            case 'msg':dc.th('msg', [n]);break;
            case '500':
            case '404': dc.th('msg', [n, 1]);break;
            case 'reset': $('form[name='+ n +']', dc).reset();break;
            case 'submit': $('form[name='+ n +']', dc).submit();break;
            case 'href': if($.isArray(n)){//【2011-06-09】增加判断的跳转
                setTimeout(function(){location.href = n[0];}, n[1]);
            }else if('string' === typeof n){
                location.href = n;
            }else{
                setTimeout(function(){location.reload(true);}, n||0);
            }
            break;
            case 'sdctrl':dc.th(i, n);break;
        }
    });
},

// 复制指定的属性
attr: function(o, t, v){
    var i, k, l = v.length;
    for(i=0; i<l; i++){
        k = t.attr(v[i]);
        if(k !== undefined){
            o.attr(v[i], k);
        }
    }
    return o;
},

//得到表单中:input的字段名，并加上粗体格式化
lab: function(j){
    return '<strong>'+ (j.attr('lab') || j.prev('label').text() || j.parent('td').prev().text() || j.closest('td').prev().text() || j.parent().contents(':first').text() || '').replace(/　|：|:/g, '') +'</strong> ';
},

//对表单进行有效性检查，并显示出来
//d--dom|$(dom)
//t--$(dom)
//bf--如果用错误调用的函数
valid: function(d, t, bf){
    var i, j, k, o,
    vrz = t.validator(d), 
    vt = vrz[0];
    $(vrz[1]).removeClass('wrg');
    for(i in vt){
        o = $(vt[i][0]);
        k = [];
        for(j=1; j<vt[i].length; j++){
            k.push(vt[i][j][1]);
        }
        o.addClass('wrg').attr('wtit', $.cm.lab(o) + k.join('<br/>'));
    }
    if((!bf || false !== bf(vt)) && vt[0]){
        $(vt[0][0]).trigger('wrongtip');//发送显示错误的信息, 定位在第一个错误的元素
    }
    return vt.length;
},

//显示服务器返回的对表单的有效性检查结果
svalid: function(f, x){
    var i, o, k, vw;
    if(x){
        for(i in x){
            o = $(':input[name='+ i +']:first', f);
            if(o[0]){
                vw = o.attr('vd');
                if(vw){
                    vw = vw.split('#')[1];
                    if(vw){//查找负责提示的DOM
                        o = $(((vw && $.isFunction(o[vw])) ? o[vw]()[0] : (vw && $('*[vw='+ vw +']', ('g' === vw.substr(0, 1) ? null: f))[0])) || o);
                    }
                }
                o.addClass('wrg').attr('wtit', $.cm.lab(o) + x[i]);
                if(!k){
                    k = 1;
                    o.trigger('wrongtip');//发送显示错误的信息, 定位在第一个错误的元素
                }
            }
        }
    }
},

// 加载圣经目录
getBibleNote: function(bi, cb, b){//加载圣经目录
    if($.ms.bibles){
        $.ss.tx('loadCatalog', {name: cb}, function(t, r){
            r = r.rows;
            if(r.length>0){
                bi.bx = r.item(0)['content'].split(',');
                bi.cb = cb;
                bi.cv = r.item(0)['version'];
                b();
            }
        });
    }else{
        $.get($.ms.biblePath + cb+ '/info.txt', function(x){
            x = x.split('|');
            bi.bx = x[3].split(',');
            bi.cb = cb;
            bi.cv = x[2];
            b();
        });
    }
},

//转换Input输入的特殊字符
filterHtml: function(s){
    return s.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
},

//把日期换算天数，计算距离有多少天，如果是同一天则为0
countDay: function(os, de){//os--原来的时间(int), de--date
    return Math.round(((new Date(de.getFullYear(), de.getMonth(), de.getDate()).getTime())-(os||0))/(1000*60*60*24));
}

});