/*global jQuery:false, $:false, window:false */
/* 模组JS处理实现 */
$.extend($.xm, {//d--dom, s.ln--lang, s.ms--commonsetting, s.cm--commonfunction, s.id--guid
//显示高亮列表
shis: function(d, s){
    var $d = $(d), rt = s.ms.runtime, ov = rt.highlighton, sl = [],
    po = $d.children('div.po'), //pop div
    bd = $d.children('div.bd'),
    nt = $d.children('div.gnt'),
    mtx = document.createElement('input'), //保存需要修改的input
    ovl, //保存原来的数据
    dc = s.doc, 
    ul,
    bh = function(dm, og, ag){//og为0表示不能拖动
        dm.each(function(){
            //生成热区和显示热区焦点
            $(this).append('<div class="dh dhu"></div><div class="hq hqu"></div><div class="dh dhd"></div><div class="hq hqd"></div>');
        }).children('div.hq').drop({groups:ag}).bind('drop', function(e, x, o){
            var t = $(e.target), p, dt, ot, mo;
            switch(x){
                case 'enter':
                    t.prev('div').addClass('sho');
                break;
                case 'exit':
                    t.prev('div').removeClass('sho');
                break;
                case 'hit':
                    p = t.parent();
                    if(!og){//移动到H3
                        if(o.tagName === 'LI'){
                            if(t.is('.hqu')){//前面加入
                                mo = p.prev('ul');
                                if(mo[0] && mo.children('li:last')[0] !== o){
                                    mo.append(o);
                                    //保存数据
                                    dt = {o: o, id:parseInt(o.getAttribute('i'), 10), cid: parseInt(mo.prev('h3').attr('i'), 10), to: o.getAttribute('to')};
                                    ot = $(o).prev('li');
                                    if(ot[0]){
                                        dt.up = parseInt(ot.attr('up'), 10)-99;
                                    }
                                    dc.th('savehighlight', ['update', dt]);
                                }
                            }else if(t.is('.hqd')){//后面加入
                                mo = p.next('ul');
                                if(mo[0] && mo.children('li:first')[0] !== o){
                                    mo.prepend(o);
                                    //保存数据
                                    dt = {o: o, id:parseInt(o.getAttribute('i'), 10), cid: parseInt(p.attr('i'), 10), to: o.getAttribute('to')};
                                    ot = $(o).next('li');
                                    if(ot[0]){
                                        dt.up = parseInt(ot.attr('up'), 10)+99;
                                    }
                                    dc.th('savehighlight', ['update', dt]);
                                }
                            }
                        }
                    }else{//LI移动到Li
                        if(t.is('.hqu') && p.prev('li')[0]!==o){
                            p.before(o);
                            //保存数据
                            dt = {o: o, id:parseInt(o.getAttribute('i'), 10), cid: parseInt(p.parent().prev().attr('i'), 10), to: o.getAttribute('to')};
                            ot = $(o).prev();
                            if(ot[0]){
                                dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                            }else{
                                dt.up = parseInt(p.attr('up'), 10) + 99;
                            }
                            dc.th('savehighlight', ['update', dt]);
                        }else if(t.is('.hqd') && p.next('li')[0]!==o){
                            p.after(o);
                            //保存数据
                            dt = {o: o, id:parseInt(o.getAttribute('i'), 10), cid: parseInt(p.parent().prev().attr('i'), 10), to: o.getAttribute('to')};
                            ot = $(o).next();
                            if(ot[0]){
                                dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                            }else{
                                dt.up = parseInt(p.attr('up'), 10) - 99;
                            }
                            dc.th('savehighlight', ['update', dt]);
                        }
                    }
                    bd.find('div.dh').removeClass('sho');//删除所有的加入标记
                break;
            }
        });
        if(og){
            dm.drag({own: d, moveOnEnd:0, dropTag:'div.hq', mousehit:1, groups:og, proxy: function(t){//拖动
                t = $(t);
                return $('<div class="gpy" style="width:'+ t.width() +'px;">'+ t[0].firstChild.nodeValue +'</div>');
            }}).bind('drag', function(e, x, o){
                var t = $(e.target);
                switch(x){
                    case 'start':
                    bd.addClass('shq');//显示鼠标检测热区
                    t.addClass('mv');
                    break;
                    case 'stop':
                    bd.removeClass('shq');
                    t.removeClass('mv');
                    break;
                }
            });
        }
    };
    
    mtx.type='text';

    //初始化代码
    var i, c = s.lncm.color, l = c.length, al = 0,
    os = function(i){
        s.tx('loadHighlight', {cid: i}, function(tx, dt){
            var j, dj;
            dt = dt.rows;
            sl.push('<h3 i="'+ i +'"'+ (ov[i]? ' class="on"':'') +'><span><span class="gc'+ i +'"></span></span>'+ c[i] +'</h3><ul'+ (ov[i]? '':' class="hid"') +'>');
            for(j=0; j<dt.length; j++){
                dj = dt.item(j);
                sl.push('<li to="'+ dj.bible +'-'+ dj.roll +'-'+ dj.chapter +'-'+ dj.verse +'"'+(dj.bible?'':' class="lb"')+' i="' + dj.id + '" up="'+ dj.up +'">'+ s.cm.filterHtml(dj.name) +'<em/></li>');
                al = 1;
            }
            sl.push('</ul>');
            
            //在数据循环结束把数据显示出来
            if(i >= l-1){
                if(!al){
                    bd.hide();
                    nt.show();
                }
                bd.html(sl.join(''));
                ul = bd.children('ul');
                //增加拖动编辑
                bh(bd.find('li'), ['highlist'], ['highlist']);
                bh(bd.find('h3'), 0, ['highlist']);
            }
        });
    }, os1 = function(i){
        s.tx('loadHighlight', {cid: i}, function(tx, dt){
            var j, dj, sl = [], ul = bd.children('h3[i='+i+']').next('ul');
            dt = dt.rows;
            for(j=0; j<dt.length; j++){
                dj = dt.item(j);
                sl.push('<li to="'+ dj.bible +'-'+ dj.roll +'-'+ dj.chapter +'-'+ dj.verse +'"'+(dj.bible?'':' class="lb"')+' i="' + dj.id + '" up="'+ dj.up +'">'+ dj.name +'<em/></li>');
            }
            ul.html(sl.join(''));
            //增加拖动编辑
            bh(ul.children('li'), ['highlist'], ['highlist']);
            if(!al){
                al = 1;
                bd.show();
                nt.hide();
            }
        });
    };
    for(i=0; i<l; i++){
        os(i);
    }
    
    $d.click(function(e){
        var t = $(e.target), v;
        if(t.is('span') || t.is('h3')){
            v = t.closest('h3', d);
            if(v[0]){
                t = v;
                if(t.is('.on')){
                    t.removeClass('on').next('ul').slideUp();
                    delete(ov[t.attr('i')]);
                }else{
                    t.addClass('on').next('ul').slideDown();
                    ov[t.attr('i')] = 1;
                }
            }
        }else if(t.is('li[to]')){//发送更换圣经事件
            v = t.attr('to').split('-');
            if(v[0]){
                if(rt.bible2 === v[0]){
                    rt.bible2 = rt.bible;//对调两种圣经
                }
                rt.bible = v[0];
            }
            rt.roll = parseInt(v[1], 10);
            rt.chapter = parseInt(v[2], 10);
            dc.th('viewbible', v[3]);
        }else if(t.is('em')){// 弹出菜单，显示修改和删除
            setTimeout(function(){
                t.after(po).parent().addClass('se');
                po.show();
            }, 9);
        }else if(t.is('li[t]')){//处理修改和删除
            v = t.attr('t');
            switch(v){
                case 'modify':
                setTimeout(function(){
                    if(!ovl){
                        v = t.closest('li[to]', d)[0];
                        ovl = v.firstChild.nodeValue;
                        mtx.value = ovl;
                        v.replaceChild(mtx, v.firstChild);
                        mtx.select();
                        mtx.focus();
                    }
                }, 9);
                break;
                case 'del':
                v = t.closest('li[to]', d);
                dc.th('savehighlight', ['del', {id:parseInt(v.attr('i'), 10), o:v, to:v.attr('to')}]);
                break;
            }
        }
    });
    
    // 更新高亮的名字
    var umk = function(e){
        var v = mtx.value || ovl, p = mtx.parentNode;
        dc.th('savehighlight', ['update', {o:p, id:parseInt(p.getAttribute('i'), 10), name:v}]);
        p.replaceChild(document.createTextNode(v), mtx);
        ovl = '';
        if(e){
            e.target.blur();
        }
    };
    
    dc.bind('click.'+s.id, function(e){//关闭菜单
        if(po.is(':visible')){
            po.hide().parent().removeClass('se');
        }
        if(ovl && e.target !== mtx){
            umk();
        }
    });
    
    //监听回车键
    $(mtx).hotkey('keydown.13', umk);
    
    // 监控事件，把数据保存到数据库
    dc.bind('savehighlight.'+s.id, function(e, w, dx){
        switch(w){
        case 'del'://删除单一高亮
            if(dx.o){//操作Dom
                dx.o.remove();
                s.tx('deleteHighlight', dx);
                if(al){
                    if(!bd.find('li[to]:first')[0]){
                        al = 0;
                        bd.hide();
                        nt.show();
                    }
                }
            }else{
                setTimeout(function(){//延时是为了等待数据 
                    for(i=0; i<l; i++){//更新所有的数据
                        os1(i);
                    }
                }, 200);
            }
            break;
        case 'add'://增加高亮
            setTimeout(function(){//延时是为了等待数据 
                for(i=0; i<l; i++){//更新所有的数据
                    os1(i);
                }
            }, 200);
            break;
        case 'update'://修改书签名字和文件夹
            if(dx.o){
                s.tx('updateHighlight', dx);
                if(dx.up){
                    $(dx.o).attr('up', dx.up);
                }
            }
            break;
        }
    });
    
}

});

/* 绑定对应的模块JS到对应的HTML，JS模板会根据ID自动进行绑定 */
// Object的索引为HTML ID，后面是要运行的JS名字
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
$.extend($.bj, {
    shis: 'shis'
});


