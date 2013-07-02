/*global jQuery:false, $:false, window:false */
/* 模组JS处理实现 */
$.extend($.xm, {//d--dom, s.ln--lang, s.ms--commonsetting, s.cm--commonfunction, s.id--guid
// 设置字体大小操作命令
smeu: function(d, s){
    var $d = $(d);
    $d.find('input[type=range]').change(function(){
        s.ms.runtime.fontsize = this.value;
        s.doc.th('fontsize');
    });
    
    //发送菜单命令
    $('ul.gmu', d).click(function(e){
        var t = e.target.getAttribute('t');
        if(t){
            s.doc.th('command', t);
        }
        $d.trigger('close');
    });
},

// 列表切换
tals: function(d, s){
    var $d = $(d),
    ul = $d.find('ul:first'),
    ct = ul.next(),
    dv = ct.children('div'),
    
    li = ul.children('li').each(function(i){
        $(this).data('inx', i);
        if(!dv[i]){
            $('<div/>').appendTo(ct).data('inx', i);
        }else{
            $(dv[i]).data('inx', i);
        }
    });
    dv = ct.children('div');//重新加载包含的内容框
    ul.click(function(e){
        var t = $(e.target), i, o;
        if(t.is('li:not(.on)')){
            li.removeClass('on');
            t.addClass('on');
            i = t.data('inx');
            o = $(dv[i]);
            if(o.is(':empty')){
                $.ejs({name: t.attr('t'), data:s.ms.htmlData, back: function(x){
                    o.html(x);
                    s.cm.bjs(o);
                }});
            }
            dv.hide();
            o.show();
            $d.th('tagindex', i);
        }
    });
},

// 对已经安装的圣经列表管理
have: function(d, s){
    var $d = $(d), dl = $d.children('dl'), st = [];
    s.tx('loadCatalog', function(tx, re){
        var i, ct, dd, on;
        re = re.rows;
        for(i=0;i<re.length;i++){
            ct = re.item(i);
            st.push('<dd n="'+ ct.name +'"><input type="checkbox"'+ (ct.isuse ? ' checked="true"': '') +'/> '+ ct.name +' - ('+ ct.lang +') '+ ct.version +'<div><input type="button" value="'+ s.lncm.del +'"/></div></dd>');
        }
        dl.html(st.join(''));
        dd = dl.children('dd');
        on = $(dd[0]).addClass('on');
        dd.click(function(e){
            var t = $(e.target);
            if(t.is('input:button')){
                t.closest('dd', d).hide();
                return;
            }
            t = $(this);
            if(!t.is('.on')){
                on.removeClass('on');
                on = t.addClass('on');
            }
        }).dblclick(function(e){
            s.doc.th('command', 'copyright|'+ this.getAttribute('n'));
            return false;
        });
        $d.children('div.hd').click(function(e){
            var t = $(e.target), a = t.attr('t');
            switch(a){
                case 'top':
                dl.prepend(on);
                break;
                case 'up':
                on.prev().before(on);
                break;
                case 'down':
                on.next().after(on);
                break;
                case 'bottom':
                dl.append(on);
                break;
                case 'attr':
                s.doc.th('command', 'copyright|'+ on.attr('n'));
                break;
            }
        });
        //提交数据
        $d.children('div.ft').click(function(e){
            var t = $(e.target);
            if(t.is('input:submit')){
                dl.children('dd').each(function(i){
                    s.tx('updateCatalog', {isuse:this.firstChild.checked, up:i, name:this.getAttribute('n')}, $.noop);
                });
                $d.trigger('close');
            }else if(t.is('input:button')){//取消按钮
                $d.trigger('close');
            }
        });
    });
},

// 增加Form表单中Label与Input的关联
lab: function(d, s){
    $('label', d).each(function(){
        var t = $(this), n = t.children(':input'), i;
        if(!n[0]){
            n = t.next(':input');
        }
        if(!n[0]){
            n = t.parent().next().children(':input:first');
        }
        if(n[0]){
            i = 'f' + s.ms.guid();
            n.attr('id', i);
            t.attr('for', i);
        }
    });
},

//显示必填项和设置焦点
must: function(d, s){
    $(':input[name]:not([req],:radio,:checkbox,input:submit,[type=hidden])', d).each(function(){
        $(this).parent().prev().append('<em class="ms"></em>');
    });
},

//设置焦点
foc: function(d, s){
    //设置焦点
    setTimeout(function(){
        $(':text:enabled:not([readonly]):first', d).focus().select();
    }, 99);
},

//表单验证，显示Tooltip
ftip: function(d, s){
    $(d).mouseover(function(e){
        var t = $(e.target).closest('.wrg', d);
        if(t[0]){
            t.tooltip({html: t.attr('wmsg') || t.attr('wtit'), cls: 'gt4', position: 'left'});//显示错误信息
        }
    }).bind('wrongtip', function(e){
        var t = $(e.target).focus().select();//选中
        t.tooltip({html: t.attr('wmsg') || t.attr('wtit'), cls: 'gt4', sticky: 1, position: 'left'});
    }).bind('focusin focus', function(e){
        var r = $(e.target), t = r.closest('.wrg', d);
        if(t[0]){
            setTimeout(function(){
                t.tooltip({html: t.attr('wmsg') || t.attr('wtit'), cls: 'gt4', sticky: 1, position: 'left'});
            },99);
        }
        t = r.closest('[tit]', d);
        if(t[0]){
            setTimeout(function(){
                t.tooltip({html: t.attr('tit'), cls: 'gtl', sticky:1, position:'right', queue: 'tooltip' + d.id});
            }, 500);
        }
    }).bind('focusout keyup change', function(e){
        var t = $(e.target);
        if(t.is(':input[name]')){
            s.cm.valid(d, t, function(vt){
                if(!vt[0]){
                    t.th('hidetip');
                }
                return false;
            });
        }
    });
},

// 添加到收藏弹出框
sbom: function(d, s){
    var $d = $(d), bm, rt = s.ms.runtime, dc = s.doc,
    o = $d.parent().data('tag'),//得到传递过来的对象
    te = $d.find('input:text'),
    se = $d.find('select');
    //初始化书签数据
    if(o.is('.bmon')){
        //已经有数据的情况
        bm = o.data('bmdata');
    }else{
        bm = {
            up: s.cm.guid(),
            name: '['+ rt.bible + '] ' + s.ms.rolls[rt.roll-1]+ ' '+ rt.chapter,
            bible: rt.bible,
            roll: rt.roll,
            chapter: rt.chapter
        };
    }
    te.val(bm.name);
    
    //处理新增文件夹按钮
    var fb = $d.find('div.ft>input:first').click(function(){
        se.hide().next().show().val('').focus();
        $(this).hide();
    });
    
    s.tx('loadBookmarkFolder', function(tx, ds){
        ds = ds.rows;
        var i, sl = [], di;
        for(i=0; i<ds.length; i++){
            di = ds.item(i);
            if(!bm.fid && 0===i){
                bm.fid = di.id;
            }
            sl.push('<option value="'+ di.id +'"'+ (di.id === bm.fid ? ' selected="true"': '') +'>'+ di.name +'</option>');
        }
        if(i){
            se.html(sl.join(''));
            te.focus().select();
            $d.children('h3,em').show();
            if(!bm.id){//如果没有id说明数据库里没有数据
                s.tx('addBookmark', bm, function(tx, ds){
                    bm.id = ds.insertId;//返回填入的id
                    o.addClass('bmon').data('bmdata', bm);
                    dc.th('bookmark', ['add', bm]);
                });
            }
        }else{
            fb.click();
        }
    });
    
    
    //提交数据
    s.cm.form($d.find('form'), function(x){
        //更新数据到数据库
        if(x.fname){
            var fd = {up:s.cm.guid(), name: x.fname};
            s.tx('addBookmarkFolder', fd, function(tx, ds){
                bm.fid = ds.insertId;
                bm.name = x.name;
                fd.id = bm.fid;
                rt.bookmarkon[fd.id] = 1;//展开新增的文件夹
                dc.th('bookmark', ['addFolder', fd]);
                if(bm.id){
                    s.tx('updateBookmark', bm);
                    //o.data('bmdata', bm);//把数据更新回按钮
                    dc.th('bookmark', ['update', bm]);
                }else{
                    s.tx('addBookmark', bm, function(tx, ds){
                        bm.id = ds.insertId;//返回填入的id
                        o.addClass('bmon').data('bmdata', bm);
                        dc.th('bookmark', ['add', bm]);
                    });
                }
            });
        }else{
            bm.fid = parseInt(x.fid, 10);
            bm.name = x.name;
            s.tx('updateBookmark', bm);
            o.data('bmdata', bm);
            dc.th('bookmark', ['update', bm]);
        }
        $d.trigger('close');
    });
    
    //绑定删除书签的功能
    $d.children('em').click(function(){
        s.tx('deleteBookmark', bm);
        dc.th('bookmark', ['del', {id:bm.id}]);
        $d.trigger('close');
    });
},

//针对左侧标记书签功能
mak: function(d, s){
    var rs = s.ms.runtime.side;
    $(d).bind('tagindex', function(e, i){
        rs[2] = i;
    }).find('ul>li:eq('+ (rs[2]||0) +')').click();
},

//显示书签列表
smal: function(d, s){
    var $d = $(d), rt = s.ms.runtime, ov = rt.bookmarkon, sl = [],
    po = $d.children('div.po'), //pop div
    bd = $d.children('div.bd'),
    nt = $d.children('div.gnt'),
    mtx = document.createElement('input'), //保存需要修改的input
    ovl, //保存原来的数据
    //编辑列出的书签
    dc = s.doc, 
    ul,
    bh = function(dm, og, ag, ts){
        dm.each(function(){
            //生成热区和显示热区焦点
            $(this).append('<div class="dh dhu"></div><div class="hq hqu"></div><div class="dh dhd"></div><div class="hq hqd"></div>');
        }).drag({own: d, moveOnEnd:0, dropTag:'div.hq', mousehit:1, groups:og, proxy: function(t){//拖动
            t = $(t);
            return $('<div class="'+ (ts? 'gph': 'gpy') +'" style="width:'+ t.width() +'px;">'+ t[0].firstChild.nodeValue +'</div>');
        }}).bind('drag', function(e, x, o){
            var t = $(e.target);
            switch(x){
                case 'start':
                bd.addClass('shq');//显示鼠标检测热区
                t.addClass('mv');
                if(ts){
                    ul.filter(':visible').slideUp();
                }
                break;
                case 'stop':
                bd.removeClass('shq');
                t.removeClass('mv');
                if(ts){
                    bd.children('h3.on').next('ul:hidden,ul:animated').slideDown();
                }
                break;
            }
        }).children('div.hq').drop({groups:ag}).bind('drop', function(e, x, o){
            var t = $(e.target), p, mo, dt, ot;
            switch(x){
                case 'enter':
                    t.prev('div').addClass('sho');
                break;
                case 'exit':
                    t.prev('div').removeClass('sho');
                break;
                case 'hit':
                    p = t.parent();
                    if(ts){//移动到H3
                        if(o.tagName === 'LI'){
                            if(t.is('.hqu')){//前面加入
                                mo = p.prev('ul');
                                if(mo.children('li:last')[0] !== o){
                                    mo.append(o);
                                    //保存数据
                                    dt = {o: o, id:parseInt(o.getAttribute('i'), 10), fid: parseInt(mo.prev('h3').attr('i'), 10)};
                                    ot = $(o).prev('li');
                                    if(ot[0]){
                                        dt.up = parseInt(ot.attr('up'), 10)-99;
                                    }
                                    dc.th('bookmark', ['update', dt]);
                                }
                            }else if(t.is('.hqd')){//后面加入
                                mo = p.next('ul');
                                if(mo.children('li:first')[0] !== o){
                                    mo.prepend(o);
                                    //保存数据
                                    dt = {o: o, id:parseInt(o.getAttribute('i'), 10), fid: parseInt(p.attr('i'), 10)};
                                    ot = $(o).next('li');
                                    if(ot[0]){
                                        dt.up = parseInt(ot.attr('up'), 10)+99;
                                    }
                                    dc.th('bookmark', ['update', dt]);
                                }
                            }
                        }else{//移动的是h3
                            if(t.is('.hqu') && p.prev().prev()[0]!==o){
                                mo = $(o).next();//get ul
                                p.before(o).before(mo);
                                //保存数据
                                dt = {o: o, id:parseInt(o.getAttribute('i'), 10)};
                                ot = $(o).prev();
                                if(ot[0]){
                                    dt.up = Math.round((parseInt(ot.prev().attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                                }else{
                                    dt.up = parseInt(p.attr('up'), 10) + 99;
                                }
                                dc.th('bookmark', ['updateFolder', dt]);
                            }else if(t.is('.hqd') && p.next().next()[0]!==o){
                                mo = $(o).next();
                                p.next().after(mo).after(o);
                                //保存数据
                                dt = {o: o, id:parseInt(o.getAttribute('i'), 10)};
                                ot = mo.next();
                                if(ot[0]){
                                    dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                                }else{
                                    dt.up = parseInt(p.attr('up'), 10) - 99;
                                }
                                dc.th('bookmark', ['updateFolder', dt]);
                            }
                        }
                    }else{//LI移动到Li
                        if(t.is('.hqu') && p.prev('li')[0]!==o){
                            p.before(o);
                            //保存数据
                            dt = {o: o, id:parseInt(o.getAttribute('i'), 10), fid: parseInt(p.parent().prev().attr('i'), 10)};
                            ot = $(o).prev();
                            if(ot[0]){
                                dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                            }else{
                                dt.up = parseInt(p.attr('up'), 10) + 99;
                            }
                            dc.th('bookmark', ['update', dt]);
                        }else if(t.is('.hqd') && p.next('li')[0]!==o){
                            p.after(o);
                            //保存数据
                            dt = {o: o, id:parseInt(o.getAttribute('i'), 10), fid: parseInt(p.parent().prev().attr('i'), 10)};
                            ot = $(o).next();
                            if(ot[0]){
                                dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                            }else{
                                dt.up = parseInt(p.attr('up'), 10) - 99;
                            }
                            dc.th('bookmark', ['update', dt]);
                        }
                    }
                    bd.find('div.dh').removeClass('sho');//删除所有的加入标记
                break;
            }
        });
    },
    
    //显示书签高亮
    hbm, bx = function(){
        if(hbm){
            $(hbm).removeClass('on');
        }
        hbm = bd.find('li[to='+ rt.bible +'-'+ rt.roll +'-'+ rt.chapter +']').addClass('on')[0];
    };
    dc.bind('viewbible.'+s.id, bx);
    
    mtx.type='text';

    //初始化代码
    s.tx('loadBookmarkFolder', function(tx, ds){
        ds = ds.rows;
        if(ds.length>0){
            $.each(ds, function(i){
                var di = ds.item(i);
                s.tx('loadBookmark', {fid: di.id}, function(tx, dt){
                    var j, dj;
                    dt = dt.rows;
                    sl.push('<h3 i="'+ di.id +'"'+ (ov[di.id]? ' class="on"':'') +' up="'+ di.up +'">'+ s.cm.filterHtml(di.name) +'<em/></h3><ul'+ (ov[di.id]? '':' class="hid"') +'>');
                    for(j=0; j<dt.length; j++){
                        dj = dt.item(j);
                        sl.push('<li to="'+ dj.bible +'-'+ dj.roll +'-'+ dj.chapter +'" i="' + dj.id + '" up="'+ dj.up +'">'+ s.cm.filterHtml(dj.name) +'<em/></li>');
                    }
                    sl.push('</ul>');
                    
                    //在数据循环结束把数据显示出来
                    if(i >= ds.length-1){
                        bd.html(sl.join(''));
                        ul = bd.children('ul');
                        //增加拖动编辑
                        bh(bd.find('li'), ['marklist'], ['marklist'], 0);
                        bh(bd.children('h3'), ['folderlist'], ['marklist', 'folderlist'], 1);
                        bx();
                    }
                });
            });
        }else{
            nt.show();
        }
    });
    
    $d.click(function(e){
        var t = $(e.target), v;
        if(t.is('h3')){
            if(t.is('.on')){
                t.removeClass('on').next('ul').slideUp();
                delete(ov[t.attr('i')]);
            }else{
                t.addClass('on').next('ul').slideDown();
                ov[t.attr('i')] = 1;
            }
        }else if(t.is('li[to]')){//发送更换圣经事件
            v = t.attr('to').split('-');
            if(rt.bible2 === v[0]){
                rt.bible2 = rt.bible;//对调两种圣经
            }
            rt.bible = v[0];
            rt.roll = parseInt(v[1], 10);
            rt.chapter = parseInt(v[2], 10);
            rt.scroll = 0;
            dc.th('viewbible');
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
                        v = t.closest('li[to],h3', d)[0];
                        ovl = v.firstChild.nodeValue;
                        mtx.value = ovl;
                        v.replaceChild(mtx, v.firstChild);
                        mtx.select();
                        mtx.focus();
                    }
                }, 9);
                break;
                case 'del':
                v = t.closest('li[to],h3', d);
                if(v.is('h3')){
                    $.confirm($.print(s.ln.del, v[0].firstChild.nodeValue), function(x){
                        if('yes' === x){
                            dc.th('bookmark', ['delFolder', {id:parseInt(v.attr('i'), 10), o:v}]);
                        }
                    });
                }else{
                    dc.th('bookmark', ['del', {id:parseInt(v.attr('i'), 10), o:v}]);
                }
                break;
            }
        }
    });
    
    // 更新书签文件夹或者书签的名字
    var umk = function(e){
        var v = mtx.value || ovl, p = mtx.parentNode;
        dc.th('bookmark', [p.tagName === 'LI' ? 'update': 'updateFolder', {o:p, id:parseInt(p.getAttribute('i'), 10), name:v}]);
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
    dc.bind('bookmark.'+s.id, function(e, t, dt){
        var o;
        switch(t){
        case 'del'://删除单一书签
            if(dt.o){//操作Dom
                dt.o.remove();
                s.tx('deleteBookmark', dt);
            }else{
                bd.find('li[i='+ dt.id +']').remove();
            }
            break;
        case 'delFolder'://删除书签文件夹
            if(dt.o){
                o = dt.o.next('ul').remove().children('li.on');
                if(o[0]){//删除里面还有高亮的标签，为了图标同步
                    dc.th('bookmark', ['del', {id: parseInt(o.attr('i'),10)}]);
                }
                dt.o.remove();
                delete(ov[dt.id]);
                s.tx('deleteBookmarkFolder', dt);
                ul = bd.children('ul');//更新ul列表
                if(!ul[0]){//显示没有书签提示
                    nt.show();
                }
            }
            //暂时还没有外部删除书签文件夹的功能，所以代码暂时省略
            break;
        case 'add'://增加一书签
            o = $('<li class="on" to="'+ dt.bible +'-'+ dt.roll +'-'+ dt.chapter +'" i="' + dt.id + '" up="'+ dt.up +'">'+ dt.name +'<em/></li>');
            bd.children('h3[i='+ dt.fid +']').next('ul').prepend(o);
            bh(o, ['marklist'], ['marklist'], 0);
            hbm = o[0];
            break;
        case 'addFolder'://增加文件夹
            o = $('<h3 i="'+ dt.id +'"'+ (ov[dt.id]? ' class="on"':'') +' up="'+ dt.up +'">'+ dt.name +'<em/></h3>');
            bd.prepend(o);
            bh(o, ['folderlist'], ['marklist', 'folderlist'], 1);
            o.after($('<ul'+ (ov[dt.id]? '':' class="hid"') +'></ul>'));
            ul = bd.children('ul');
            nt.hide();
            break;
        case 'update'://修改书签名字和文件夹
            if(dt.o){
                s.tx('updateBookmark', dt);
                if(dt.up){
                    $(dt.o).attr('up', dt.up);
                }
            }else{
                o = bd.find('li[i='+ dt.id +']')[0];
                if(o){
                    o.firstChild.nodeValue = dt.name;
                    if(dt.fid){//更新文件夹
                        if(o.parentNode.previousSibling.getAttribute('i') !== dt.fid.toString){
                            bd.children('h3[i='+ dt.fid +']').next('ul').append(o);
                        }
                    }
                }
            }
            break;
        case 'updateFolder'://修改文件夹名称
            if(dt.o){
                s.tx('updateBookmarkFolder', dt);
                if(dt.up){
                    $(dt.o).attr('up', dt.up);
                }
            }
            break;
        }
    });
    
},

// 安装新的圣经版本
inst: function(d, s){
    var $d = $(d), re = /^\d/,
    bl = $d.children('dl.gbl'),
    se = $d.find('select')[0];
    $.getJSON(s.ms.server+'ajax/bblist', function(x){
        var a = [];
        //console.log(x);//["ch-cn|中文", "20120519|cunpss|CUNPSS|和合本", "en|English", "20120519|niv84|NIV84|NIV 1984"]
        bl.removeClass('ld');
        $.each(x, function(i, v){
            v = v.split('|');
            if(re.test(v[0])){
                a.push('<dd><q>'+ v[2] +'</q>'+ v[3] +'<div><input type="button" value="'+ s.lncm.setup +'"></div></dd>');
            }else{
                a.push('<dt i="'+ v[0] +'">'+ v[1] +'</dt>');
                se.options.add(new Option(v[1], v[0]));
            }
        });
        bl.html(a.join(''));
    });
    $(se).change(function(){//切换显示语言
        var v = se.value;
        if(v){
            bl.children('dt').each(function(){
                var t = $(this);
                if(t.attr('i') === v){
                    t.show().nextUntil('dt').show();
                }else{
                    t.hide().nextUntil('dt').hide();
                }
            });
        }else{
            bl.children().show();
        }
    });
},

//test
test: function(d, s){
    $(d).find('li:eq(1)').click();
}

});

/* 绑定对应的模块JS到对应的HTML，JS模板会根据ID自动进行绑定 */
// Object的索引为HTML ID，后面是要运行的JS名字
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
$.extend($.bj, {
    smeu: 'smeu',
    bsls: 'tals|test',
    mak: 'tals|mak',
    have: 'have',
    sbom: 'ftip|sbom',
    smal: 'smal',
    inst: 'inst'
});


