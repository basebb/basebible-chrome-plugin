/*global jQuery:false, $:false, window:false */
/* 模组JS处理实现 */
$.extend($.xm, {//d--dom, s.ln--lang, s.ms--commonsetting, s.cm--commonfunction, s.id--guid
//读经计划
sepl: function(d, s){
    var $d = $(d), 
    bd = $d.children('div.bd'), 
    po = $d.children('div.po'), //pop div
    rt = s.ms.runtime,
    ov = rt.planon,
    dc = s.doc,
    dx = {},//保存数据
    gn = function(x, n){//得到对应字符串向前n天的经文
        x = x.split(' ');//用空格分隔经文
        var k = x[1].split('~'), i, v, w, u = [], 
        m = parseInt(x[0], 10), 
        a, 
        c = s.ms.cnum;
        if(k.length>1){
            v = parseInt(k[0], 10);
            w = parseInt(k[1], 10) - v;
        }else{
            v = parseInt(k, 10);
            w = 0;
        }
        a = v+ n*(w+1);
        while(a > c[m-1]){
            a -= c[m-1];
            m++;
        }
        v = a;
        u.push([m, v]);
        for(i=0; i<w; i++){
            v++;
            if(v>c[m-1]){
                v = v - c[m-1];
                m++;
            }
            u.push([m, v]);
        }
        return u;
    },
    gb = function(ct, dy){//得到圣经版本, ct--经文列表，dy--哪一天
        var i, j, k, m, x;
        for(i=ct.length-1; i>=0; i--){
            if(ct[i][0] <= dy){//[80, "20 20|58 1|60 1~2"]
                x = ct[i][1].split('|');
                for(j=0; j<x.length; j++){
                    m = i;
                    k = x[j];
                    while(!k){//向前滚得到有值的项
                        m--;
                        k = ct[m][1].split('|')[j];
                    }
                    // 格式化值
                    x[j] = gn(k, dy - ct[m][0]);
                }
                return x;
            }
        }
    }, 
    gdt = function(id, de){
        var st = [], 
        cd = dx[id],
        c = cd.content[cd.content.length-1][0], 
        k = Math.abs(s.cm.countDay(cd.num, de))%c + 1,//采用绝对值的方法，避免负值
        ro = s.ms.rolls, 
        vi = gb(cd.content, k),
        j, v, r, cx = 1;
        st.push('<div i="'+ id +'" k="'+k+'" ti="'+ de.getTime() +'"><i class="ibt pr" title="'+ s.lncm.prevDay +'"></i><strong>'+ de.format(s.lncm.dtdw) +'</strong><br/><span>'+ $.print(s.lncm.dofd, [k, c]) +'</span><i class="ibt nx" title="'+ s.lncm.nextDay +'"></i></div>');
        for(j=0; j<vi.length; j++){
            v = vi[j];
            for(r=0; r<v.length; r++){
                st.push('<li to="'+ v[r][0] +'-'+ v[r][1] +'"><input type="checkbox"'+ (cd.read[k] && cd.read[k][cx] ? ' checked="true"': '') +'/> <span v="'+ (v[r][0]-1) +'">'+ ro[v[r][0]-1] +'</span> '+ v[r][1] +'</li>');
                cx++;
            }
        }
        return st.join('');
    },
    ul, //拖动函数
    bh = function(dm, og, ag){
        dm.each(function(){
            //生成热区和显示热区焦点
            $(this).append('<div class="dh dhu"></div><div class="hq hqu"></div><div class="dh dhd"></div><div class="hq hqd"></div>');
        }).drag({own: d, moveOnEnd:0, dropTag:'div.hq', mousehit:1, groups:og, proxy: function(t){//拖动
            t = $(t);
            return $('<div class="gph" style="width:'+ t.width() +'px;">'+ t[0].firstChild.nodeValue +'</div>');
        }}).bind('drag', function(e, x, o){
            var t = $(e.target);
            switch(x){
                case 'start':
                bd.addClass('shq');//显示鼠标检测热区
                t.addClass('mv');
                ul.filter(':visible').slideUp();
                break;
                case 'stop':
                bd.removeClass('shq');
                t.removeClass('mv');
                bd.children('h3.on').next('ul:hidden,ul:animated').slideDown();
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
                        o.setAttribute('up', dt.up);
                        dc.th('plan', ['update', dt]);
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
                        o.setAttribute('up', dt.up);
                        dc.th('plan', ['update', dt]);
                    }

                    bd.find('div.dh').removeClass('sho');//删除所有的加入标记
                break;
            }
        });
    };
    //加载读经计划列表
    s.tx('loadPlan', function(tx, dt){
        dt = dt.rows;
        var i, l = dt.length, st = [], x, de = new Date(), cd, cp;
        for(i=0; i<l; i++){
            x = dt.item(i);
            cd = dx[x.id] = {name: x.name, num: x.num, content:$.parseJSON(x.content), read: $.parseJSON(x.read)||{}};
            cp = Math.floor((cd.read.count||0)*100/cd.content[cd.content.length-1][0]);
            st.push('<h3 i="'+ x.id +'"'+ (ov[x.id]? ' class="on"':'') +' up="'+ x.up +'">'+ x.name +'<em/><div class="gps" title="'+ $.print(s.lncm.planed, cp) +'"><dfn style="width:'+ cp +'%"></dfn></div></h3><ul'+ (ov[x.id]? '':' class="hid"') +'>'+ gdt(x.id, de) +'</ul>');
        }
        bd.html(st.join(''));
        ul = bd.children('ul');
        bh(bd.children('h3'), ['planlist'], ['planlist']);
    });

    $d.click(function(e){
        var t = $(e.target), p, de, v;
        if(t.is('i.ibt')){//左右更换日期
            p = t.parent();
            de = new Date(parseInt(p.attr('ti'), 10));
            de.setDate(de.getDate() + (t.is('.pr') ? -1: 1));
            p.parent().html(gdt(parseInt(p.attr('i'), 10), de));
        }else if(t.is('li[to]')){
            v = t.attr('to').split('-');
            rt.roll = parseInt(v[0], 10);
            rt.chapter = parseInt(v[1], 10);
            rt.scroll = 0;
            dc.th('viewbible');
        }else if(t.is('span[v]')){
            v = t.parent().attr('to').split('-');
            rt.roll = parseInt(v[0], 10);
            rt.chapter = parseInt(v[1], 10);
            rt.scroll = 0;
            dc.th('viewbible');
        }else if(t.is('h3')){
            if(t.is('.on')){
                t.removeClass('on').next('ul').slideUp();
                delete(ov[t.attr('i')]);
            }else{
                t.addClass('on').next('ul').slideDown();
                ov[t.attr('i')] = 1;
            }
        }else if(t.is('em')){// 弹出菜单
            setTimeout(function(){
                t.after(po).parent().addClass('se');
                po.show();
            }, 9);
        }else if(t.is('li[t]')){//处理弹出菜单
            switch(t.attr('t')){
            case 'replan'://弹出计划设置窗口
                de = t.closest('h3', d).attr('i');
                dc.th('command', [t.attr('cm'), {id: parseInt(de, 10), name: dx[de].name, num:dx[de].num}]);
            break;
            case 'del':
                $.confirm(s.lncm.delmsg, function(x){
                    if('yes' === x){
                        de = t.closest('h3', d);
                        v = de.attr('i');
                        s.tx('deletePlan', {id: parseInt(v, 10)});
                        de.next().remove();
                        de.remove();
                        delete dx[v];
                    }
                });
            break;
            case 'about'://关于
                dc.th('command', ['aboutplan|loadPlan', {id: parseInt(t.closest('h3', d).attr('i'), 10)}]);
            break;
            }
        }else if(t.is('strong')){//点击日期，弹出日期对话框
            
        }
    }).change(function(e){//记录读经状态
        var t = e.target, $t = $(t);
        if(t.type === 'checkbox'){
            var ul = $t.closest('ul', d), 
            dv = ul.children('div'), 
            i = parseInt(dv.attr('i'), 10),
            cd = dx[i],
            k = dv.attr('k'),
            cb = ul.find('input:checkbox'),
            h = [], 
            c = 0,
            cp;
            cb.each(function(i){
                if(this.checked){
                    c++;
                    h[i+1] = 1;
                }
            });
            h[0] = c/cb.length;
            cd.read[k] = h;
            //计算总的百分比
            c = 0;
            $.each(cd.read, function(i, v){
                if(i !== 'count'){
                    c += v[0];
                }
            });
            cd.read.count = c;
            cp = Math.floor(c*100/(cd.content[cd.content.length-1][0]));
            ul.prev().children('div.gps').attr('title', $.print(s.lncm.planed, cp)).children('dfn').css({width: cp+'%'});//更新百分比状态
            //保存数据到数据库
            s.tx('updatePlan', {id: i, read:JSON.stringify(cd.read)});
        }
    });
    
    dc.bind('changeBible.'+s.id, function(){
        var ro = s.ms.rolls;
        bd.find('span[v]').each(function(){//切换书卷的名称语言
            this.innerHTML = ro[this.getAttribute('v')];
        });
    });
    
    dc.bind('click.'+s.id, function(e){//关闭菜单
        if(po.is(':visible')){
            po.hide().parent().removeClass('se');
        }
    });
    
    dc.bind('plan.'+s.id, function(e, t, dt){
        switch(t){
        case 'update'://更新读经计划
            if(dt.o){
                s.tx('updatePlan', dt);
            }
        break;
        case 'set': //设置计划
            if(dt.id && dx[dt.id]){
                s.tx('updatePlan', dt, function(){//更新数据到数据库
                    var h3 = bd.children('h3[i='+ dt.id +']'), o = h3.next();
                    dx[dt.id].num = dt.num;
                    if(dt.read){
                        dx[dt.id].read = {};
                    }
                    o.html(gdt(dt.id, new Date(parseInt(o.children('div:first').attr('ti'), 10))));
                    h3.children('div.gps').attr('title', $.print(s.lncm.planed, 0)).children('dfn').css({width: '0%'});//更新百分比状态
                });
            }/* else{
                // 插入数据
                console.log(234);
            } */
        break;
        }
    });
    
    //test
    //dc.th('command', ["dialog|setting.startplan|设置读经计划|300px",{"id":2,"name":"我的计划", "num": 1}]);
},

// 设置计划起始时间
stpl: function(d, s){
    var $d = $(d), br = $d.closest('div[id^=dialog]').data('bridge');
    $d.find('strong:first').html(br.name);
    $d.find('input.tdt').val((new Date(br.num)).format('yyyy-mm-dd')).datepicker({own: d, con: $d});
    s.cm.form($d.children('form'), function(o){
        o.id = br.id;
        o.num = Date.parse(o.num);
        s.doc.th('plan', ['set', o]);
        $d.trigger('close');
    });
}

});

/* 绑定对应的模块JS到对应的HTML，JS模板会根据ID自动进行绑定 */
// Object的索引为HTML ID，后面是要运行的JS名字
//【20110316】修改原来的数据方式为字符串方式，用|符号隔开，语言用/符号隔开。如 bind: funtionName/languange|funtionName
$.extend($.bj, {
    pla: 'sepl',
    stpl: 'stpl|ftip'
});


