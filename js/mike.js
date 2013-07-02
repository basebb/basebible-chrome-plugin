/*global jQuery:false, $:false, window:false */
/* 模组JS处理实现 */
$.extend($.xm, {//d--dom, s.ln--lang, s.ms--commonsetting, s.cm--commonfunction, s.id--guid
//消息提示界面，全局的消息提示
gmsg: function(d, s){
    var $d = $(d), x = $('div.bd', d), h;
    s.doc.bind('msg.'+s.id, function(e, v, t){
        if(h){
            clearTimeout(h);
            h = 0;
        }
        if(0 !== v){
            h = setTimeout(function(){
                h = 0;
                $d.fadeOut();
            }, 5000);
            $d.stop(true, true).hide();
            x.html(v);
            if(t){
                x.addClass('rd');
            }else{
                x.removeClass('rd');
            }
            $d.fadeIn();
        }else{
            $d.fadeOut();
        }
    });
    
    $d.click(function(){
        if(h){
            clearTimeout(h);
            h = 0;
        }
        $d.fadeOut();
    });
},

// 加载圣经章节
arti: function(d, s){
    var $d = $(d), dc = s.doc,
    fs = 1, //第一次运行
    rt = s.ms.runtime,
    se = s.ms.select,//选择经文的编号
    lsv = 1, //最后点击的DOM--b
    bo = [], //保存每一章的节
    dv = $d.children('div'),
    cb = {},//保存当前的圣经信息
    cr = [], cc = [],
    msc = 0, //滚动条最大的偏移
    sct = $d.closest('section'),
    at = $d.closest('article'), 
    stp = sct.offset().top, //得到框架顶位置，因为这个位置一般不会变
    gb = function(i, v){//搜索高亮节点,采用向前移动的方法
        var j = v-1, a, b;
        //console.log(bo[i]);
        if(bo[i]){
            while(j>=0){
                a = bo[i][j];
                if(a){
                    b = a.innerHTML.split('-');
                    if(parseInt(b[0], 10) === v || (b[1] && parseInt(b[1], 10) === v )){
                        return bo[i][j];
                    }
                }
                j--;
            }
        }
        return null;
    },
    hno = function(i, nd){//高亮元素
        if(nd){
            var j, mx, n, tp, ch, of;
            if(typeof nd === 'number'){//[2012-04-25]增加多章节的支持
                mx = nd;
            }else{
                n = nd.split('-');
                nd = parseInt(n[0], 10);
                mx = n[1] ? parseInt(n[1], 10): nd;
            }
            for(j=nd; j<=mx; j++){
                n = gb(i, j);
                if(n){
                    n = $(n).parent('span');
                    n.addClass('hi');
                    if(!ch){
                        tp = n.offset().top;
                        ch = sct.height();
                        if((of = tp - stp - ch) > -10){
                            sct[0].scrollTop += of + ch/2;
                        }else if((of = tp - stp) < 10){
                            sct[0].scrollTop += of - ch/2;
                        }
                    }
                }
            }
        }
    },
    ali = function(e){//调整两边经文的对齐
        if(rt.showb2){
            var h1 = dv[0].clientHeight,
            h2 = dv[1].clientHeight,
            o = h1<h2? dv[0]: dv[1],//哪个高度大就设置哪个的offset
            sv = sct[0],
            st = sv.scrollTop;
            o.style.top = Math.round(Math.abs(h1 - h2) * st/(sv.scrollHeight - sv.clientHeight))+'px';
            if(e){
                rt.scroll = msc || st;
            }
        }else{
            rt.scroll = sct[0].scrollTop;
        }
    },
    hb1 = function(){//右侧的点击高亮
        if(se.length){
            bo[1].each(function(){
                var t = $(this), i = parseInt(t.html(),10), v = se[i];
                if(1 === v || (v && -1!==v)){
                    t.parent('span').addClass('on');
                }else if(-1 === v || 0 === v){
                    t.parent('span').removeClass('on');
                }
            });
        }
    },
    hl = function(i, cl, bf){//显示已经保存的高亮
        s.tx('loadHighlight', {
            bible: i ? rt.bible2: rt.bible,
            all: 1,
            roll: rt.roll,
            chapter: rt.chapter
        }, function(tx, dt){
            dt = dt.rows;
            var j, l = dt.length, c;
            if(cl){//cl=2增加hi， cl=-1减少on
                $(dv[i].firstChild).find('span').removeClass(function(i, c){
                    return (c.match(new RegExp('(gb\\d)|(gc\\d)'+ (2===cl? '|(on)|(hi)': -1===cl ? '': '|(on)'), 'g'))||[]).join(' ');
                });
            }
            for(j=0; j<l; j++){
                c = dt.item(j);
                $(gb(i, c.verse)).parent('span').addClass((c.bible ? 'gc': 'gb') + c.cid);
            }
            if(bf){
                bf();
            }
        });
    },
    dx = function(x, i, nd){//nd--高亮节点
        dv[i].firstChild.innerHTML = x + '<cite><span i="'+ i +'">'+ s.lncm.copyright +'</span></cite>';
        if(fs){
            fs = 0;
            at.show();
        }
        if(rt.showb2){
            dv.css('top', 0);
            msc = rt.scroll;
            sct[0].scrollTop = msc;
            if(sct[0].scrollTop >= msc){//说明能正常设置到最大的值
                msc = 0;
            }
        }else{
            dv[0].style.top = '0';
            sct[0].scrollTop = rt.scroll;
        }
        if(i && !nd){
            nd = $(dv[0]).data('hinum');
        }else if(nd && 0===i){
            $(dv[0]).data('hinum', nd);//保存Hightlight，方便切换时能得到
        }else if(!nd && 0 === i){
            $(dv[0]).removeData('hinum');
        }
        ali();
        bo[i] = $(dv[i].firstChild).find('b');//把经文章节节点保存起来
        hno(i, nd);
        if(i){
            hb1();
        }else{
            if(se[0]){
                se[0] = 0;
                dc.th('highlight', 1);//1--表示刷新循环
            }else{
                se.length = 0;//删除数据
                dc.th('highlight', 0);//0--表示不用循环
            }
        }
        //显示已经保存的高亮
        hl(i);
        
    }, gbb = function(nd){//加载圣经
        var k = ['bible', 'bible2'];
        $.each(k, function(i, v){
            if(0 ===i && nd && rt[v] === cb[v] && rt.roll === cr[i] && rt.chapter === cc[i]){//切换高亮
                $(dv[i]).data('hinum', nd);
                $(dv[i].firstChild).find('.hi').removeClass('hi');
                hno(i, nd);
            }else if(1 === i && rt[k[i]] === cb[k[i]] && rt.roll === cr[i] && rt.chapter === cc[i] && rt.showb2){//调整经文的位置
                ali();
                hl(i, 2, function(){
                    hb1();
                    hno(i, nd || $(dv[0]).data('hinum'));
                });
            }else if((rt[v] !== cb[v] || rt.roll !== cr[i] || rt.chapter !== cc[i]) && (rt.showb2 || i !== 1)){
                if(s.ms.bibles){
                    s.tx('loadBible', {bible: rt[v], roll:rt.roll, chapter:rt.chapter}, function(tx, re){
                        if(re.rows.length>0){
                            dx(re.rows.item(0).content, i, nd);
                        }
                    });
                }else{
                    $.get(s.ms.biblePath + rt[v]+ '/'+ (rt.roll>9 ? rt.roll: '0'+rt.roll) +'_'+ rt.chapter +'.html', function(x){
                        dx(x, i, nd);
                    });
                }
                cb[v] = rt[v];
                cr[i] = rt.roll;
                cc[i] = rt.chapter;
            }
        });
    };
    
    //调整字体大小
    if(rt.fontsize){
        $d.css('fontSize', rt.fontsize+'%');
    }
    dc.bind('fontsize.'+s.id, function(){
        $d.css('fontSize', rt.fontsize+'%');
        ali();
    });
    
    //调整两边经文的对齐方式
    sct.bind('scroll.'+s.id, ali);
    
    gbb();
    
    var pr = $d.children('em.pr'),
    nx = $d.children('em.nx'),
    vmm = function(e){
        sct[0].scrollTop -= e.originalEvent.wheelDelta;
    },
    pnf = function(){//左右按键的显示与隐藏
        if(1 === rt.roll && 1 === rt.chapter){
            pr.hide();
        }else if(pr.is(':hidden')){
            pr.show();
        }
        if(rt.roll === s.ms.cnum.length && rt.chapter === s.ms.cnum[s.ms.cnum.length-1]){
            nx.hide();
        }else if(nx.is(':hidden')){
            nx.show();
        }
    };
    pnf();
    //清除数据代码
    $d.bind('empty', function(){
        sct.unbind('.'+s.id);
    });
    //绑定左右按键的方法
    pr.click(function(){
        if(rt.chapter > 1){
            rt.chapter--;
        }else{
            rt.roll--;
            rt.chapter = s.ms.cnum[rt.roll-1];
        }
        rt.scroll = 0;
        dc.th('viewbible');
    }).bind('mousewheel', vmm);//中间滑轮事件
    nx.click(function(){
        if(rt.chapter < s.ms.cnum[rt.roll-1]){
            rt.chapter++;
        }else{
            rt.roll++;
            rt.chapter = 1;
        }
        rt.scroll = 0;
        dc.th('viewbible');
    }).bind('mousewheel', vmm);
    //显示变化数据
    dc.bind('viewbible.'+s.id, function(e, nd){//nd--高亮节点
        gbb(nd);
        pnf();
    });
    
    // 注册得到高亮节点数字的函数
    s.cm.getHeightNode = function(){
        return $(dv[0]).data('hinum');
    };
    
    // 注册热键
    dc.hotkey('keydown.37-40.'+s.id, {disableInInput: 1}, function(e){
        switch(e.keyCode){
            case 37://left
            if(pr.is(':visible')){
                pr.click();
            }
            break;
            case 38://up
            sct[0].scrollTop -= 20;
            break;
            case 39://right
            if(nx.is(':visible')){
                nx.click();
            }
            break;
            case 40://down
            sct[0].scrollTop += 20;
            break;
        }
        return false;
    });
    
    $d.click(function(e){
        var t = $(e.target), vi, i;
        if(t.is('span[i]')){//版权说明
            dc.th('command', 'copyright|'+ ('0'===t.attr('i') ? rt.bible: rt.bible2));
        }if(t.is('b')){//点击每一节的标题
            if(t.parent('span')[0]){
                $.each(t.html().split('-'), function(i, v){//因为可能有两节连在一起的
                    vi = parseInt(v, 10);
                    se[vi] = (!se[vi] || se[vi]<=0) ? 1: -1;
                });
                if(e.shiftKey){
                    for(i=Math.min(vi, lsv)+1; i<Math.max(vi, lsv); i++){
                        se[i] = 1;//1表示需要高亮，但还没有确定，-1表示已经删除，但还没有确定
                    }
                }else{
                    lsv = vi;
                }
                e.preventDefault();
                window.getSelection().removeAllRanges();//取消选择 window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); 
                dc.th('highlight');
            }
        }
    });
    
    dc.bind('highlight.'+s.id, function(e, ri){
        if(0 !== ri){
            if(se.length){
                bo[0].each(function(){
                    var t = $(this), i = parseInt(t.html(),10), v = se[i];
                    //v=1表示需要高亮，但还没有确定，-1表示已经删除，但还没有确定
                    //ri=1表示强制刷新
                    if(1 === v || (1 === ri && v && -1 !== v)){
                        t.parent('span').addClass('on');
                        se[i] = t;
                    }else if(-1 === v){
                        t.parent('span').removeClass('on');
                        se[i] = 0;
                    }
                });
                if(rt.showb2){
                    hb1();
                }
            }else{
                dv.find('span.on').removeClass('on');
            }
            
        }
    });
    
    //显示高亮
    dc.bind('savehighlight.'+s.id, function(e, w, dx){
        if(('add' === w) || ('update' === w && dx.to && dx.cid >= 0) || ('del' === w)){
            setTimeout(function(){//延时等待数据
                hl(0, dx.o ? -1: 1);
                if(rt.showb2){
                    hl(1, dx.o ? -1: 1);
                }
            }, 200);
        }
    });

},

// 加载提示
nst: function(d, s){
    var $d = $(d), sv = 0, sp;
    s.doc.bind('setupbible.'+s.id, function(e, i){
        if(!sv){
            $d.html(s.ln.setp+'<span>'+i+'%</span>').show();
            sp = $d.children();
            sv = 1;
        }
        if(100 === i){
            $d.hide();
            sv = 0;
        }else{
            sp.html(i+'%');
        }
    });
},

// 菜单区
menu: function(d, s){
    var rt = s.ms.runtime, dc = s.doc,
    $d = $(d),
    em = $d.find('em'), b1 = {}, b2 = {},
    cor = em.filter('.r:first'),
    cor2 = em.filter('.r[i=2]'),
    cob = em.filter('.b:first'),
    cob2 = em.filter('.b[i=2]'),
    // cb,//当前圣经版本
    // cv,//当前圣经显示的名称
    // bx,//当前圣经版本卷目录
    ts = function(){
        if(!b1.cb || b1.cb !== rt.bible){
            s.cm.getBibleNote(b1, rt.bible, function(){
                cor.html(b1.bx[rt.roll-1] + ' '+ rt.chapter);
                cob.html(b1.cb);
                s.ms.rolls = b1.bx;
                dc.th('changeBible');//发出圣经改变的事件
            });
        }else{
            cor.html(b1.bx[rt.roll-1] + ' '+ rt.chapter);
        }
        if(rt.showb2){
            if(!b2.cb || b2.cb !== rt.bible2){
                s.cm.getBibleNote(b2, rt.bible2, function(){
                    cor2.html(b2.bx[rt.roll-1]+ ' '+ rt.chapter);
                    cob2.html(b2.cb);
                    s.ms.rolls2 = b2.bx;
                });
            }else{
                cor2.html(b2.bx[rt.roll-1]+ ' '+ rt.chapter);
            }
        }
    };
    
    //显示变化数据
    ts();
    dc.bind('viewbible.'+s.id, ts);
    
    //并行按钮样式
    if(rt.showb2){
        s.body.addClass('gpal');
    }
    
    //显示圣经目录
    em.click(function(e){
        var t = $(e.target).closest('em[t]', d), tv = t.attr('t'), o;
        if('ch' === tv){//左右交换圣经
            o = rt.bible;
            rt.bible = rt.bible2;
            rt.bible2 = o;
            o = s.ms.rolls;
            s.ms.rolls = s.ms.rolls2;
            s.ms.rolls2 = o;
            s.ms.select[0] = 1;//指示不用清除选择的经文
            dc.th('viewbible', s.cm.getHeightNode());
        }else if('vs' === tv){//圣经并行
            rt.showb2 = !rt.showb2;
            if(rt.showb2){
                s.body.addClass('gpal');
            }else{
                s.body.removeClass('gpal');
            }
            dc.th('viewbible');
        }else if('cl' === tv){//清除所有的圣经选择
            s.ms.select.length = 0;
            dc.th('highlight');
        }
    });
    
    //显示选择了几节经文
    var na = $d.find('nav'), se = s.ms.select;
    dc.bind('highlight.'+s.id, function(e, v){
        if(0 === v || se.length <= 0){
            na.hide();
        }else{
            var c=0, i, j = se.length, k;
            for(i=1; i<j; i++){
                k = se[i];
                if(1===k || (k && k !== -1)){
                    c++;
                }
            }
            if(0 === c){
                na.hide();
            }else{
                na.show().find('b').html(c);
            }
        }
    });
},

// 弹出显示圣经卷章列表
brl: function(d, s){
    var $d = $(d),
    r = $d.attr('i') ? s.ms.rolls2: s.ms.rolls, //圣经显示章名称
    rt = s.ms.runtime,
    cu = s.ms.cnum,//每一卷的章数
    i, st = [],
    dl = $d.find('dl'),
    ul = $d.find('ul'),
    uf = function(ro){//Set Li
        var st = [];
        for(i=0; i<cu[ro-1]; i++){
            st.push('<li'+ (ro === rt.roll && i+1===rt.chapter? ' class="on"': '') +'>'+ (i+1) +'</li>');
        }
        ul.html(st.join(''));
    }, tm = function(o){//滚动指定DOM到中间
        if(o[0]){
            var p = o.parent();
            p.scrollTop(o.position().top - p.height()/2);
        }
    };
    for(i=0; i<r.length; i++){
        if(0 === i){//旧约
            st.push('<dt>'+ s.lncm.bold +'</dt>');
        }else if(39 === i){//新约
            st.push('<dt>'+ s.lncm.bnew +'</dt>');
        }
        st.push('<dd'+ (i+1===rt.roll? ' class="on"': '') +' i="'+ (i+1) + '"><span>'+ (i<9 ? '0'+(i+1): i+1) +'</span> '+ r[i] +'</dd>');//暂时加上数字，为了方便索引
    }
    dl.html(st.join(''));
    tm(dl.children('dd.on'));
    uf(rt.roll);
    tm(ul.children('li.on'));
    
    //绑定事件
    $d.click(function(e){
        var t = $(e.target), h;
        if(t.is('span')){
            t = t.parent();
        }
        if(t.is('dd:not(.hv)')){
            t.siblings('dd.hv').removeClass('hv');
            t.addClass('hv');
            uf(parseInt(t.attr('i'), 10));
            tm(ul.children('li.on'));
        }else if(t.is('li')){
            h = dl.children('dd.hv');
            if(h[0]){
                rt.roll = parseInt(h.attr('i'), 10);
            }
            rt.chapter = parseInt(t.html(), 10);
            rt.scroll = 0;
            s.doc.th('viewbible');
            $d.trigger('close');
        }
    }).dblclick(function(e){
        var t = $(e.target);
        if(t.is('span')){
            t = t.parent();
        }
        if(t.is('dd')){
            rt.roll = parseInt(t.attr('i'), 10);
            rt.chapter = 1;
            rt.scroll = 0;
            s.doc.th('viewbible');
            $d.trigger('close');
        }
    });
},

// 列出所有的圣经
bbt: function(d, s){
    var $d = $(d), dl = $d.children('dl'), 
    rt = s.ms.runtime,
    bi = $d.attr('i'),
    cb = 'bible'+(bi||''),
    cb2 = 'bible'+ (bi? '': '2'),
    ni = [],
    lb = function(){
        var tx = [];
        $.each(ni, function(i, v){
            tx.push('<dd'+ (rt[cb] === v[0] ? ' class="on"': '') +' i="'+ v[0] +'">'+ v[0] + ' - ' + v[1] +'</dd>');
        });
        dl.html(tx.join(''));
        //绑定点击事件
        dl.click(function(e){
            var t = $(e.target), v;
            if(t.is('dd')){
                if(!t.is('.on')){
                    v = t.attr('i');
                    if(v === rt[cb2]){//如果相同交换圣经
                        rt[cb2] = rt[cb];
                    }
                    rt[cb] = v;
                    s.ms.select[0] = 1;
                    s.doc.th('viewbible');
                    $d.trigger('close');
                }
            }
        });
    };
    if(s.ms.bibles){
        s.tx('loadCatalog', {isuse: 1}, function(t, r){
            var i, x;
            r = r.rows;
            for(i=0; i<r.length; i++){
                x = r.item(i);
                ni.push([x.name, x.version]);
            }
            lb();
        });
    }else{
        ni = s.ms.bibleList;
        lb();
    }
},

//侧边栏
sid: function(d, s){
    var $d = $(d), ti = 1,
    rt = s.ms.runtime,
    as = $d.children('aside'),
    dv = as.children('div'),
    hd = $d.children('div.hd'),
    li = hd.find('li').each(function(i){//初始化
        $(this).data('inx', i);
        if(!dv[i]){
            $('<div/>').appendTo(as).data('inx', i);
        }else{
            $(dv[i]).data('inx', i);
        }
    });
    dv = as.children('div');//重新加载
    hd.click(function(e){
        var t = $(e.target),
        i, o;
        if(t.is('em')){
            rt.side[0] = !rt.side[0];
            if(rt.side[0]){
                s.body.addClass('gsid');
                t.attr('title', s.lncm.fold);
                if(ti){//第一次进来，加载里面的内容
                    ti = 0;
                    $(li[Math.min(rt.side[1]||0, li.length-1)]).click();
                }
            }else{
                s.body.removeClass('gsid');
                t.attr('title', s.lncm.unfold);
            }
        }else if(t.is('li:not(.on)')){
            li.removeClass('on');
            t.addClass('on');
            i = t.data('inx');
            rt.side[1] = i;
            o = $(dv[i]);
            if(o.is(':empty')){
                $.ejs({name: t.attr('t'), data:s.ms.htmlData, back: function(x){
                    o.html(x);
                    s.cm.bjs(o);
                }});
            }
            dv.hide();
            o.show();
        }
    });
    
    
    if(rt.side[0]){//打开侧边
        rt.side[0] = 0;
        hd.find('em').click();
    }
},

//搜索经文
seah: function(d, s){
    var $d = $(d), 
    fm = $d.children('form'),
    rt = s.ms.runtime,
    cb, //当前圣经版本
    dv = $d.children('div'),
    sl = fm.find('select'),
    sc = fm.submit(function(){
        var v = $.trim(sc.val()).replace(/\\|\/|\^|\$|\*|\+|\?|\{|\}|=/g, '');//删除一些没有必要的字符
        sc.val(v);
        if(v){
            var st = [], c = 0,
            r = new RegExp('<span><b>([0-9]+?)</b>(.*?)</span>', 'gi'), //分割字符串
            ks = new RegExp('<h2>.*?</h2>', 'gi'),//删除没有必要的标题
            //ls = new RegExp('<q title=.*?</q>', 'gi'),//删除没有必要的提示
            is = new RegExp('<i>|</i>|<q>|</q>', 'gi'), //删除人名和地名的格式
            rs = [],//查找字符串
            res = new RegExp(v.replace(/\s+/g, '|'), 'gi'),//高亮正则
            sv = sl.val().split('|');//新旧约选择
            
            $.each(v.split(/\s+/), function(i, v){
                rs[i] = new RegExp(v, 'i');
            });
            cb = rt.bible;
            s.tx('searchBible', {bible: cb, min:parseInt(sv[0], 10), max:parseInt(sv[1], 10), q: v}, function(tx, re){
                var ro = re.rows, ct, t, ts, m,  i, j;
                for(i = 0; i<ro.length; i++){//循环数据查询出来的数据
                    ct = ro.item(i);
                    while((t = r.exec(ct.content.replace(ks, ''))) !== null){//先分割字符串
                        m = t[2].replace(is, ' ');
                        for(j=0; j<rs.length; j++){//测试是否都匹配
                            ts = rs[j].test(m);
                            if(!ts){
                                break;
                            }
                        }
                        if(ts){//生成圣经列表数据
                            st[c++] = '<li i="'+ (ct.roll + '|'+ ct.chapter + '|'+ t[1]) +'"><h4>'+ s.ms.rolls[ct.roll-1] +' '+ ct.chapter +':'+ t[1] +'</h4>'+ t[2].replace(res, '<b>$&</b>') +'</li>';
                        }
                    }
                    if(c>1000){
                        c = '1000+';
                        break;
                    }
                }
                dv.html('<p>'+ (cb+ ' ('+ c +' '+ s.lncm.record + ')') +'</p><ul>'+ st.join('') +'</ul>');
            });
        }
        return false;
    }).children('input[type=search]');
    //绑定事件
    dv.click(function(e){
        var t = $(e.target).closest('li[i]', dv[0]), v;
        if(t[0]){//切换到搜索出来的章节
            v = t.attr('i').split('|');
            if(cb === rt.bible2){//对调圣经
                rt.bible2 = rt.bible;
            }
            rt.bible = cb;
            rt.roll = parseInt(v[0], 10);
            rt.chapter = parseInt(v[1], 10);
            rt.scroll = 0;
            s.doc.th('viewbible', parseInt(v[2], 10));
        }
    });
    
    if(!s.ms.bibles){
        s.doc.bind('setupbible.'+s.id, function(e, i){
            if(100 === i){
                $d.children('p.gnt').hide();
                fm.show();
            }
        });
    }
    
},

// 弹出设置菜单
set: function(d, s, ty){
    var o;//是否有弹出层
    $(d).click(function(e){
        var t = $(e.target).closest('em[t]', d);
        if(t[0] && t.attr('t').indexOf('.')>0){//有点的说明是加载模板
            if(t.is('.on')){
                s.cm.ubj(o);
                t.removeClass('on');
                o.remove();
                o = 0;
            }else{
                $.ejs({name: t.attr('t'), data:ty ? $.extend({}, s.ms.htmlData, {id: t.attr('i')}): s.ms.htmlData, back: function(x){
                    if(!t.is('.on')){
                        if(o){//防止还有已经弹出的层
                            s.cm.ubj(o);
                            o.data('tag').removeClass('on');
                        }else{
                            if(ty){
                                var xy = t.position();
                                o = $('<div class="gml"/>').appendTo(t.parent()).css({left:xy.left, top:xy.top+t.outerHeight()});
                            }else{
                                o = $('<div/>').appendTo(d);
                            }
                        }
                        o.data('tag', t).html(x);//把按键传递出去
                        t.addClass('on');
                        s.cm.bjs(o);
                    }
                }});
            }
        }
    }).bind('close', function(){
        if(o){
            s.cm.ubj(o);
            o.data('tag').removeClass('on');
            o.remove();
            o = 0;
        }
    });
    
    //关闭层事件，如果点击层外面自动关闭
    s.doc.bind('click.'+s.id, function(e){
        if(o && !o.has(e.target)[0]){
            s.cm.ubj(o);
            o.data('tag').removeClass('on');
            o.remove();
            o = 0;
        }
    });
    
},

// 查询是否已经存在书签
ismk: function(d, s){
    var rt = s.ms.runtime, bm = $('em.bm', d),
    bx = function(){
        s.tx('loadBookmark', rt, function(tx, ds){
            ds = ds.rows;
            if(ds.length > 0){
                bm.addClass('bmon').data('bmdata', $.extend({}, ds.item(0)));//从数据库来的数据是只读的，所以复制一份
            }else{
                bm.removeClass('bmon');
            }
        });
    };
    s.doc.bind('viewbible.'+s.id, bx).bind('bookmark.'+s.id, function(e, t, dt){
        var dx = bm.data('bmdata');
        if(bm.is('.bmon') && dx.id === dt.id){
            switch(t){
            case 'del':
                bm.removeClass('bmon');
                break;
            case 'update':
                bm.data('bmdata', $.extend(dx, dt, {o:0}));//删除O对象
                break;
            }
        }
    });
    bx();
},

// 显示高亮列表
hili: function(d, s){
    var $d = $(d), hd = $d.children('div.ghs:first'), 
    dc = s.doc,
    se = s.ms.select, rt = s.ms.runtime,
    rc = s.ms.rolls[rt.roll-1] +' '+ rt.chapter+':';
    var ox = function(){
        var sa = [],
        i, st, v;
        for(i=1; i<=se.length; i++){
            v = se[i];
            if(1 === v || (v && -1!==v)){
                if(!st){
                    st = i;//定位开始
                }
            }else{
                if(st){
                    //处理开始一个连续的节点
                    v = i>st+1 ? st+'-'+(i-1): st;
                    sa.push('<em t="'+v+'" title="'+ s.lncm.tover +'">'+ rc+v +'<i title="'+ s.lncm.delsel +'"></i></em>');
                    st = 0;
                }
            }
        }
        hd.html(sa.join(''));
    };
    ox();
    
    //处理删除高亮
    hd.click(function(e){
        var t = $(e.target), r, mi, ma;
        if(t.is('i')){//删除选择
            r = t.parent('em').attr('t').split('-');
            mi = parseInt(r[0], 10);
            ma = r[1] ? parseInt(r[1], 10): mi;
            for(r=mi; r<=ma; r++){
                se[r] = -1;
            }
            dc.th('highlight');
            return false;//避免窗口关闭
        }else if(t.is('em[t]')){//移动到指定节点
            dc.th('viewbible', t.attr('t'));
            return false;
        }
    });
    
    dc.bind('highlight.'+s.id, ox);
    
    $d.children('div.ft').click(function(e){
        var t = $(e.target);
        if(t.is('input[t=nn]')){// 新增加笔记
            dc.th('note', ['open', {}]);
        }else if(t.is('input[t=dh]')){// 删除高亮
            dc.th('savehighlight', ['del', {se: se, bible: rt.bible}]);
        }else if(t.is('input[t=dgh]')){// 删除全局高亮
            dc.th('savehighlight', ['del', {se: se, bible:''}]);
        }
    });
},

// 发送保存高亮数据命令
hlsa: function(d, s){
    var $d = $(d), dc = s.doc,
    bd = $d.children('div.bd'),
    se = s.ms.select,
    rt = s.ms.runtime;
    bd.click(function(e){
        var t = $(e.target);
        if(t.is('em[i]')){
            dc.th('savehighlight', ['add', {cid: parseInt(t.attr('i'), 10), bible: bd.prev().find('input')[0].checked ? '': rt.bible}]);
            $d.trigger('close');
        }
    });
    
    dc.bind('savehighlight.'+s.id, function(e, w, dx){
        var i, v, rc, ov;
        if('add' === w){
            rc = s.ms.rolls[rt.roll-1] +' '+ rt.chapter+':';
            ov = function(i){
                var x = {
                    bible: dx.bible,
                    roll: rt.roll,
                    chapter: rt.chapter,
                    verse:i
                };
                //判断数据库里是否已经有数据，如果有就只是更新数据
                s.tx('loadHighlight', x, function(tx, dt){
                    if(dt.rows.length){
                        s.tx('updateHighlight', {cid: dx.cid, id:dt.rows.item(0).id});
                    }else{
                        s.tx('addHighlight', $.extend({
                            up:s.cm.guid(), 
                            cid:dx.cid,
                            name: (dx.bible ?'['+ dx.bible +'] ':'') + rc + i
                        }, x));
                    }
                });
            };
            for(i=1; i<se.length; i++){
                v = se[i];
                if(1 === v || (v && -1!==v)){
                    ov(i);
                }
            }
            se.length = 0;
            dc.th('highlight', 0);//关闭选择个数框，不刷新高亮
        }else if('del' === w && dx.se){//删除已经选择的高亮
            ov = [];
            for(i=1; i<se.length; i++){
                v = se[i];
                if(1 === v || (v && -1!==v)){
                    ov.push(i);
                }
            }
            s.tx('deleteHighlight', {bible: dx.bible, roll: rt.roll, chapter: rt.chapter, verse:ov});
            se.length = 0;
            dc.th('highlight', 0);//关闭选择个数框，不刷新高亮
        }
    });
}

});

/* 绑定对应的模块JS到对应的HTML，JS模板会根据ID自动进行绑定 */
// Object的索引为HTML ID，后面是要运行的JS名字
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
$.extend($.bj, {
    arti: 'arti',
    gmsg: 'gmsg',
    nst: 'nst',
    menu: 'menu|set//1',
    brl: 'brl',
    bbt: 'bbt',
    sid: 'sid',
    seah: 'seah',
    set: 'set|ismk',
    hili: 'hili|hlsa|snop'
});


