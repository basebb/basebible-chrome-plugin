/*global jQuery:false, $:false, window:false */
/* 模组JS处理实现 */
$.extend($.xm, {//d--dom, s.ln--lang, s.ms--commonsetting, s.cm--commonfunction, s.id--guid

//显示笔记列表
snos: function(d, s){
    var $d = $(d), sl = [], rc = $d.find('em:first'),
    po = $d.children('div.po'), //pop div
    hd = $d.children('div.hd'),
    bd = $d.children('div.bd'),
    //nt = $d.children('div.gnt'),
    mtx = document.createElement('input'), //保存需要修改的input
    ovl, //保存原来的数据
    dc = s.doc, 
    ul,
    se = $d.children('input:first'),
    bh = function(dm, og, ag){//og为0表示不能拖动
        dm.each(function(){
            //生成热区和显示热区焦点
            $(this).append('<div class="dh dhu"></div><div class="hq hqu"></div><div class="dh dhd"></div><div class="hq hqd"></div>');
        }).children('div.hq').drop({groups:ag}).bind('drop', function(e, x, o){
            var t = $(e.target), p, dt, ot;
            switch(x){
                case 'enter':
                    t.prev('div').addClass('sho');
                break;
                case 'exit':
                    t.prev('div').removeClass('sho');
                break;
                case 'hit':
                    p = t.parent();
                    if(t.is('.hqu') && p.prev('li')[0]!==o){
                        p.before(o);
                        //保存数据
                        dt = {o: o, id:parseInt(o.getAttribute('to'), 10), to: o.getAttribute('to')};
                        ot = $(o).prev();
                        if(ot[0]){
                            dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                        }else{
                            dt.up = parseInt(p.attr('up'), 10) + 99;
                        }
                        dc.th('note', ['update', dt]);
                    }else if(t.is('.hqd') && p.next('li')[0]!==o){
                        p.after(o);
                        //保存数据
                        dt = {o: o, id:parseInt(o.getAttribute('to'), 10), to: o.getAttribute('to')};
                        ot = $(o).next();
                        if(ot[0]){
                            dt.up = Math.round((parseInt(ot.attr('up'),10) + parseInt(p.attr('up'), 10))/2);
                        }else{
                            dt.up = parseInt(p.attr('up'), 10) - 99;
                        }
                        dc.th('note', ['update', dt]);
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
    }, umk = function(e){// 更新笔记的名字
        var v = mtx.value || ovl, p = mtx.parentNode;
        if(v !== ovl){
            dc.th('note', ['update', {o:p, id:parseInt(p.getAttribute('to'), 10), title:v, updated:(new Date()).getTime()}]);
        }
        p.replaceChild(document.createTextNode(v), mtx);
        ovl = '';
        if(e){
            e.target.blur();
        }
    }, ond, con = function(o, c){
        if(ond){
            ond.removeClass('on');
        }
        if(c){
            ond = 0;
            o.removeClass('on');
        }else{
            ond = o && o.addClass('on');
        }
        
    };
    
    mtx.type='text';

    //初始化代码
    s.tx('loadNote', function(tx, dt){
        var j, dj;
        dt = dt.rows;
        sl.push('<ul>');
        for(j=0; j<dt.length; j++){
            dj = dt.item(j);
            sl.push('<li to="'+ dj.id +'" up="'+ dj.up +'">'+ s.cm.filterHtml(dj.title) +'<time>'+ $.dateFormat(dj.updated, s.lncm.dtfm) +'</time><em/></li>');
        }
        sl.push('</ul>');
        rc.html(j);//更新记录数
        
        //在数据循环结束把数据显示出来
        bd.html(sl.join(''));
        ul = bd.children('ul');
        //增加拖动编辑
        bh(ul.children('li'), ['notelist'], ['notelist']);
        
    });
    
    $d.click(function(e){
        var t = $(e.target), v;
        if(t.is('li[to]')){//编辑事件
            dc.th('note', ['open', {o:t, id: parseInt(t.attr('to'), 10)}]);
        }else if(t.is('em')){// 弹出菜单，显示修改和删除
            setTimeout(function(){
                t.after(po).parent().addClass('se');
                po.show();
            }, 9);
        }else if(t.is('li[t]')){//处理修改和删除
            v = t.attr('t');
            switch(v){
                case 'rename'://生成编辑状态
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
                $.confirm(s.lncm.delNote, function(x){
                    if('yes' === x){
                        v = t.closest('li[to]', d);
                        dc.th('note', ['del', {id:parseInt(v.attr('to'), 10), o:v}]);
                    }
                });
                break;
            }
        }
    });

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
    
    dc.bind('note.'+s.id, function(e, t, dx){
        var o;
        switch(t){
        case 'del':
            if(dx.o){
                dx.o.remove();
                s.tx('deleteNote', dx);
                s.tx('deleteNoteVerse', {nid: dx.id});
            }else{
                ul.children('li[to='+ dx.id +']').remove();
            }
            rc.html(ul.children('li').length);//更新记录数
        break;
        case 'add':
            o = $('<li to="'+ dx.id +'" up="'+ dx.up +'">'+ dx.title +'<time>'+ $.dateFormat(dx.updated, s.lncm.dtfm) +'</time><em/></li>');
            ul.prepend(o);
            bh(o, ['notelist'], ['notelist']);
            rc.html(ul.children('li').length);//更新记录数
            con(o);
        break;
        case 'update':
            if(dx.o){
                s.tx('updateNote', dx);
                if(dx.up){
                    $(dx.o).attr('up', dx.up);
                }
                if(dx.updated){//更新时间
                    $(dx.o).children('time').html($.dateFormat(dx.updated, s.lncm.dtfm));
                }
            }else{
                o = ul.children('li[to='+ dx.id +']')[0];
                if(o){
                    if(dx.title){
                        o = o.firstChild;
                        if(o.nodeType === 3){//文本节点
                            o.nodeValue = dx.title;
                        }else{
                            o.value = dx.title;
                        }
                    }
                    if(dx.updated){
                        $(o).children('time').html($.dateFormat(dx.updated, s.lncm.dtfm));
                    }
                }
            }
        break;
        case 'close':
            if(dx.id){
                con(ul.children('li[to='+ dx.id +']'), 1);
            }
        break;
        case 'on'://高亮
            con(dx.o, dx.c);
        break;
        }
    });
    
    hd.children('input:first').click(function(){//新增按钮
        dc.th('note', ['open', {}]);
    });
    
    //搜索功能
    se.bind('input', function(){
        var li = ul.children(), v = se.val();
        if(v){
            s.tx('searchNote', {q: v}, function(tx, dt){
                dt = dt.rows;
                var i, j, ll = li.length, l = dt.length, it = {};
                rc.html(l);//更新记录数
                for(i=0; i<l; i++){
                    it[dt.item(i).id] = 1;
                }
                for(j=0; j<ll; j++){
                    if(it[li[j].getAttribute('to')]){
                        $(li[j]).show();
                    }else{
                        $(li[j]).hide();
                    }
                }
            });
        }else{
            li.show();
            rc.html(li.length);
        }
    });
},

//打开编辑笔记的窗口
snop: function(d, s){
    if(!s.ms.snop){//只能有一个实例运行
        s.ms.snop = 1;
        var dc = s.doc,
        rt = s.ms.runtime,
        bid, //返回的对话框id
        bg = {};//用于交换数据
        dc.bind('note', function(e, t, dx){
            if('open'===t){
                if(bid && $.dialogIsExist(bid)){
                    bg = $.dialogIsExist(bid)[0].data('bridge');
                    if(bg.dirty){
                        $.confirm(s.lncm.dirty, function(x){
                            switch(x){
                            case 'save':
                                if(false !== bg.save()){
                                    bg.id = dx.id;
                                    bg.newNote();
                                    dc.th('note', ['on', dx]);
                                    //con(dx.o);
                                }
                            break;
                            case 'nosave':
                                bg.id = dx.id;
                                bg.newNote();
                                dc.th('note', ['on', dx]);
                                //con(dx.o);
                            break;
                            }
                        }, {act: 'save|nosave|no'});
                    }else{
                        bg.id = dx.id;
                        bg.newNote();
                        dc.th('note', ['on', dx]);
                        //con(dx.o);
                    }
                }else{
                    var x = s.ms.notePath.split('|');
                    bg.id = dx.id;
                    $.ejs({name: x[0], data:$.ms.htmlData, back: function(v){
                        bid = $.dialog({html:v, title:s.lncm.note, width:x[1], left:rt.notePosition.left, top:rt.notePosition.top, model:false, bridge:bg, defico: 0, ico:[['del', s.lncm.del, function(){
                            bg.del();
                        }], ['cls', s.lncm.close, function(){
                            bg.close();
                        }]]});
                        $.dialogIsExist(bid)[0].bind('drag', function(e, t){//绑定拖动事件，记录位置数据
                            if('stop' === t){
                                rt.notePosition = $(this).position();
                            }
                        });
                    }});
                    dc.th('note', ['on', dx]);
                    //con(dx.o);
                }
            }
        });
    }
},

//编辑笔记
snnt: function(d, s){
    var $d = $(d), 
    dc = s.doc,
    rt = s.ms.runtime,
    tt = $d.find('input:first'),
    tm = $d.find('time'),
    ct = $d.find('section>textarea'),
    gh = $d.find('div.ghs:first'),
    gs = gh.next('div.ghs'),
    o  = $d.closest('div[id^=dialog]'), //对话框
    oh = o.children('div:first'),
    bg = o.data('bridge'),
    sd = function(){//填充数据
        var x = bg.data;
        tt.val(x.title);
        gs.html('');
        tm.html($.dateFormat(x.updated, s.lncm.dtfm));
        ct.val(x.content);
    },
    sv = function(tx){//填充笔记数据保存到数据库
        var vi = $d.find('div.ghs>em'),
        i;
        for(i=vi.length-1; i>=0; i--){
            var o = $(vi[i]), v = o.attr('t'), dt;
            if(o.is('.od')){
                v = v.split('|');
                dt = {
                    up: s.cm.guid(),
                    nid: bg.id,
                    name: vi[i].firstChild.nodeValue,
                    bible: v[0],
                    roll: parseInt(v[1], 10),
                    chapter: parseInt(v[2], 10),
                    verse: v[3]
                };
            }else{
                dt = {
                    up: s.cm.guid(),
                    nid: bg.id,
                    name: vi[i].firstChild.nodeValue,
                    bible: rt.bible,
                    roll: rt.roll,
                    chapter: rt.chapter,
                    verse: v
                };
            }
            dt.tx = tx;
            s.tx('addNoteVerse', dt);
        }
    }, udy = function(){
        if(!bg.dirty){
            bg.dirty = 1;
            oh.addClass('hi');
            tt.unbind('input');
            ct.unbind('input');
        }
    }, cdy = function(){
        if(bg.dirty){
            bg.dirty = 0;
            oh.removeClass('hi');
            tt.bind('input', udy);
            ct.bind('input', udy);
        }
    }, lnv = function(tx, bf){//加载选择的经文
        s.tx('loadNoteVerse', {nid: bg.id, tx: tx}, function(tx, dt){
            var x = [], i, v;
            dt = dt.rows;
            for(i=0; i<dt.length; i++){
                v = dt.item(i);
                x.push('<em class="od" t="'+ v.bible+'|'+v.roll+'|'+v.chapter + '|'+ v.verse +'" title="'+ s.lncm.tover +'">'+ v.name +'<i title="'+ s.lncm.delsel +'"></i></em>');
            }
            gs.html(x.join(''));
            if(bf){
                bf();
            }
        });
    }, snd = function(){
        bg.save();
        return false;
    };
    
    bg.dirty = 1;//第一次运行，为了绑定dirty事件
    bg.newNote = function(){//初始化数据
        bg.data = {title: '', content:'', updated:(new Date()).getTime()};
        tt.removeClass('wrg');//清除错误提示
        cdy();
        if(bg.id){
            s.tx('loadNote', bg, function(tx, dt){
                dt = dt.rows;
                if(dt.length){
                    bg.data = $.extend({}, dt.item(0));
                    //加载选择的经文
                    lnv(tx);
                }else{
                    bg.id = 0;
                }
                sd();
            });
        }else{
            sd();
        }
    };
    bg.newNote();
    
    bg.save = function(){
        if(s.cm.valid(d, tt) > 0){ //验证数据
            return false;
        }
        if(bg.dirty || !gh.is(':empty')){
            var dt = {
                title: tt.val(),
                content: ct.val(),
                updated: (new Date()).getTime()
            };
            if(bg.id){
                dt.id = bg.id;
                s.tx('updateNote', dt, function(tx){
                    bg.data = dt;
                    s.tx('deleteNoteVerse', {tx:tx, nid:bg.id});//删除已经存在的笔记经文
                    sv(tx);
                    dc.th('note', ['update', dt]);
                });
            }else{
                dt.up = s.cm.guid();
                dt.created = dt.updated;
                s.tx('addNote', dt, function(tx, x){
                    bg.id = x.insertId;
                    dt.id = bg.id;
                    bg.data = dt;
                    sv(tx);
                    dc.th('note', ['add', dt]);
                });
            }
            cdy();
            tm.html($.dateFormat(dt.updated, s.lncm.dtfm));//更新时间
            setTimeout(function(){//延时加载
                if(!gh.is(':empty')){//删除所有的高亮
                    lnv(null, function(){
                        s.ms.select.length = 0;
                        dc.th('highlight');
                    });//重新加载笔记圣经
                }
            }, 99);
            return true;
        }
    };
    bg.del = function(){
        if(bg.id || (!bg.id && bg.dirty)){
            $.confirm(s.lncm.delNote, function(x){
                if('yes' === x){
                    if(bg.id){
                        dc.th('note', ['del', {id: bg.id}]);
                        s.tx('deleteNote', {id: bg.id});
                        s.tx('deleteNoteVerse', {nid: bg.id});
                    }
                    o.th('close');
                }
            });
        }else{
            o.th('close');
        }
    };
    bg.close = function(){
        if(bg.dirty){
            $.confirm(s.lncm.dirty, function(x){
                switch(x){
                case 'save':
                    if(false !== bg.save()){
                        o.th('close');
                        dc.th('note', ['close', {id: bg.id}]);
                    }
                break;
                case 'nosave':
                    o.th('close');
                    dc.th('note', ['close', {id: bg.id}]);
                break;
                }
            }, {act: 'save|nosave|no'});
        }else{
            o.th('close');
            dc.th('note', ['close', {id: bg.id}]);
        }
    };
    
    $d.find('input[t=close]').click(bg.close);//关闭按键

    $d.find('input:submit').click(snd);//保存数据
    $d.hotkey('keydown.ctrl+83', snd);//Ctrl+s
    $d.find('input[t=sac]').click(function(){
        bg.save();
        bg.close();
    });
    dc.bind('note.'+s.id, function(e, t, dx){//数据更新
        if(dx.id === bg.id && dx.o){
            switch(t){
            case 'update':
                if(dx.title){tt.val(dx.title);}//更新标题
                if(dx.updated){tm.html($.dateFormat(dx.updated, s.lncm.dtfm));}//更新时间
            break;
            case 'del':
                o.th('close');
            break;
            }
        }
    });
    gs.click(function(e){
        var t = $(e.target), r;
        if(t.is('i')){//删除选择
            t.parent().remove();
            udy();
            return false;//避免窗口关闭
        }else if(t.is('em[t]')){//移动到指定节点
            r = t.attr('t').split('|');
            if(rt.bible2 === r[0]){
                rt.bible2 = rt.bible;//对调两种圣经
            }
            rt.bible = r[0];
            rt.roll = parseInt(r[1], 10);
            rt.chapter = parseInt(r[2], 10);
            dc.th('viewbible', r[3]);
            return false;
        }
    });
}

});

/* 绑定对应的模块JS到对应的HTML，JS模板会根据ID自动进行绑定 */
// Object的索引为HTML ID，后面是要运行的JS名字
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
$.extend($.bj, {
    snos: 'snos|snop',
    snnt: 'snnt|hili|foc|ftip'
});


