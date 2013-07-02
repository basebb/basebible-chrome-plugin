/*global jQuery:false, $:false, window:false */
/**
 * jQuery custom drag drop
 * request jquery 1.4
 *
 * Copyright (c) 2010 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 2.2.3
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2010-04-27] 建立新代码，整合了几个基本的拖放效果
 * 1.0.1 [2010-04-29] 修改Callback方式为事件方式
 * 2.0.0 [2010-04-30] 增加了碰撞的检测，拖放事件
 * 2.0.1 [2010-05-08] 修改解除拖动时出错
 * 2.0.2 [2010-07-14] 修改拖动对象的范围，把补白和边框计算上去
 * 2.0.3 [2010-12-24] 修改Drop检测是用Proxy的时候把自己排除
 * 2.0.4 [2010-12-24] 增加mousehit参数，判断是采用普通对象方式还是鼠标方式检测碰撞
 * 2.0.5 [2010-12-24] 修改发送drag start事件的顺序，先是发送事件再处理其他事情
 * 2.0.6 [2010-12-24] 增加排除的元素采用Function函数调用方式
 * 2.1.0 [2010-12-27] 增加调整大小的功能
 * 2.1.1 [2011-04-19] 修改drog状态字符，增加元素上状态的数据
 * 2.1.2 [2011-05-09] 修改拖动时有时会跳出现region的bug
 * 2.1.3 [2011-05-19] 修改定位错误的bug
 * 2.1.4 [2011-05-25] 修改Drop对象包括自己的bug，把自己排除出去；拖动句柄排除表单输入框
 * 2.1.5 [2011-06-09] 修改当对象为fixed定位时定位不准的问题
 * 2.1.6 [2012-01-11] 修改普通的移动因滚动条产生定位不准的问题
 * 2.1.7 [2012-01-11] 增加拖动后取消Click事件的功能，避免A链接响应
 * 2.1.8 [2012-02-09] 增加对Touch的支持
 * 2.1.9 [2012-02-29] 增加对拖动对象如果是Static时，采用Relative定位方式
 * 2.2.0 [2012-02-29] 增加碰撞范围和碰撞类型
 * 2.2.1 [2012-04-11] 修改JQuery大于1.6发送事件对应的target不同
 * 2.2.2 [2012-04-12] 增加只对可见的元素进行碰撞检测
 * 2.2.3 [2012-05-10] 调整代理方式定位不准的问题
**/

(function($){
var bd = $('body'), doc = $(document), win = $(window), uid = (new Date()).getTime(),
it = document.ontouchend !== undefined,
dot = 'drogstatic',
//drag setting
/*st = {
    handle: dom || $(dom) ||function(t),
    ext:dom||function(t), //handle排除元素,
    own:dom,
    scroll:$(dom),//拖动时调整滚动条，应用在带滚动条的容器里
    movecls:,
    size: [minWidth, minHeight, maxWidth, maxHeight], //拖动对象的大小而不是位置
    mousehit:0|1, //是否采用鼠标检测的相交而不是对象
    toper:$(dom),//转绝对定位到相对百分比定位
    region:$(dom),//设定拖动范围
    proxy: function(){} | $(dom),
    moveOnEnd: 1 | 0, //只对proxy方式有效
    resetposition: 0, //是否重置定位，只对static的定位有效
    cancelFirstClick: 0, //是否取消hd第一个点击，针对Alink
    groups: ['jquerydd'] //对应组
}*/
st = {
    own: doc,
    moveOnEnd: 1,
    dropTag: '*', //检测碰撞元素Tag
    dropRange: 1, //检测的范围，0-1
    dat: 'dragstatic', //在元素上增加状态提示，0|1
    groups: ['jquerydd']
};

//设置默认参数
$.dragSetup = function(s){
    $.extend(st, s);
};

$.fn.drag = function(s) {
    //应用新设置
    s = $.extend({}, st, s);
    return this.each(function(){
        var t = this, $t = $(t), 
        hd = $(s.handle? ($.isFunction(s.handle) ? (s.handle(t)||t) : s.handle) : t), //移动的感应对象
        id = 'drag'+ uid,
        // cck = function(){//针对取消Click事件
            // return false;
        // },
        x, //元素相对父元素的偏移,临时变量
        h, w, //高度和宽度
        ow, oh, //宽度和高度相对位移
        ox, oy, //移动开始的相对位移
        pw, ph, //Padding和边框总宽度和高度，针对Proxy
        start, stop, move, dr = 0,//记录对应的状态
        prx, morg,//移动的对象
        drop, //Drop 组对象
        drag, //Drag 对象
        rtop, rleft, rwidth, rheight, //Region
        fxd, //记录是否在Fixed状态
        sta, //定位状态
        iwidth, iheight; //Region item
        
        uid++;
        if(s.scroll){
            h = $t.outerHeight(true);
            w = $t.outerWidth(true);
        }
        
        // $t.click(function(){
            // console.log($t.offset());
        // });
        
        start = function(e){
            if($(e.target).is(':input') || (s.ext && ($.isFunction(s.ext) ? s.ext(t) : s.ext) === e.target)){//排除没有拖动的元素
                return;
            }
            if(s.movecls){
                hd.addClass(s.movecls);
            }
            
            sta = $t.css('position');
            if('static' === sta){
                $t.css('position', 'relative');
            }
            fxd = 'fixed'===sta? 1: 0;
            
            var ex = it ? e.originalEvent.touches[0].pageX: e.pageX,
            ey = it ? e.originalEvent.touches[0].pageY: e.pageY;
            
            if(s.scroll){
                ox = -ex - s.scroll.scrollLeft();
                oy = -ey - s.scroll.scrollTop();
            }else{
                x = $t.offset();//获得相对位置
                if(s.size){
                    w = $t.width();//记录高度和宽度
                    h = $t.height();
                    ow = ex - w;
                    oh = ey - h;
                    ox = x.left;
                    oy = x.top;
                }else{
                    if(fxd){
                        ox = ex - x.left + win.scrollLeft();
                        oy = ey - x.top + win.scrollTop();
                    }else{
                        ox = ex - x.left;
                        oy = ey - x.top;
                    }
                }
                if(s.proxy){
                    var rw = $t.outerWidth(), rh = $t.outerHeight();
                    prx = $('<div style="position:absolute;width:'+ rw +'px;height:'+ rh +'px;z-index:99999;"></div>').css(hd.offset());
                    morg = prx;
                    pw = rw - w;
                    ph = rh - h;
                }else{
                    pw = 0;
                    ph = 0;
                    morg = $t;
                }
            }
            doc.bind((it ? 'touchmove.': 'mousemove.') + id, move).bind((it ? 'touchend.': 'mouseup.')+ id, stop);
            if(hd[0].setCapture){
                hd.bind('losecapture.' + id, stop);
                hd[0].setCapture();
            }else{
                win.blur(stop);
            }
            dr = 1;
            $t.data(s.dat, 1);//在对应的dom上增加状态的提示，外部会用到这个变量
            e.preventDefault();
        };

        move = function(e){
            //清除选择
            if(window.getSelection){
                window.getSelection().removeAllRanges();
            }else{
                document.selection.empty();
            }
            if(1 === dr){//第一次进来
                dr = 2;
                if(s.cancelFirstClick){
                    hd.one('click', function(){//针对取消Click事件
                        return false;
                    });
                }
                e.type = 'drag';
                e.drag = drag;
                e.target = t;
                $t.trigger(e, 'start');//发送事件
                //得到对应Drag组的Drog
                if(!s.scroll){
                    if(s.proxy){
                        if($.isFunction(s.proxy)){
                            drag = s.proxy(t);
                        }else{
                            drag = s.proxy;
                        }
                        bd.append(prx);
                        if(drag){
                            prx.append(drag);
                            //根据大小设置相对的位置
                            //drag.css({top: Math.round((drag.outerHeight()-prx.height())/2), left: Math.round((drag.outerWidth()-prx.width())/2)});
                        }else{
                            drag = prx;
                        }
                    }
                    if(s.region){
                        x = s.region.offset() || {top:0, left:0};
                        rtop = x.top;
                        rleft = x.left;
                        rwidth = s.region.width();
                        rheight = s.region.height();
                        
                        iwidth = morg.outerWidth();
                        iheight = morg.outerHeight();
                    }
                    drop = [];
                    $(s.dropTag+'[jquerydd]:visible', s.region||doc).each(function(){
                        var i, j, a = this.getAttribute('jquerydd'), x = s.groups, o;
                        for(i=0, j=x.length; i<j; i++){
                            if(t !== this && a.indexOf('|' + x[i] + '|') >= 0){
                                o = $(this);
                                o.removeData(dot);
                                drop.push(o);
                                break;
                            }
                        }
                    });
                    if(drop[0]){
                        drag = drag || morg;
                        x = drag.offset();
                        drag = [drag, drag.outerWidth(), drag.outerHeight()];
                    }else{
                        drag = 0;
                    }
                }
                return;
            }
            e.drag = drag;
            var ex = it ? e.originalEvent.touches[0].pageX: e.pageX,
            ey = it ? e.originalEvent.touches[0].pageY: e.pageY;
            if(s.scroll){
                var f = h - s.scroll.height(), o = -ey - oy;
                if(f>0){
                    if(o<0){
                        o = 0;
                    }
                    s.scroll.scrollTop(o);
                }
                f = w - s.scroll.width();
                o = -ex - ox;
                if(f>0){
                    if(o<0){
                        o = 0;
                    }
                    s.scroll.scrollLeft(o);
                }
            }else{
                if(s.size){//改变宽度和高度
                    var sw = ex - ow, sh = ey - oh;
                    //限定宽度和高度
                    sw = (s.size[0] && sw<s.size[0]) ? s.size[0]: (s.size[2] && sw > s.size[2] ? s.size[2]: sw);
                    sh = (s.size[1] && sh<s.size[1]) ? s.size[1]: (s.size[3] && sh > s.size[3] ? s.size[3]: sh);
                    sw = sw>0? sw: 0;
                    sh = sh>0? sh: 0;
                    
                    if(s.region){//判断是否在指定的Region里面
                        if(ox + sw + pw > rleft + rwidth){
                            sw = rleft + rwidth - ox - pw;
                        }
                        if(oy + sh + ph > rtop + rheight){
                            sh = rtop + rheight - oy - ph;
                        }
                    }
                    morg.css({width: Math.round(sw), height: Math.round(sh)});//设置宽度和高度
                }else{
                    var sx = ex - ox, sy = ey - oy;
                    if(s.region){//判断是否在指定的Region里面
                        if(sx < rleft){
                            sx = rleft;
                        }else if(sx + iwidth > rleft + rwidth){
                            sx = rleft + rwidth -iwidth;
                        }
                        if(sy < rtop){
                            sy = rtop;
                        }else if(sy + iheight > rtop + rheight){
                            sy = rtop + rheight - iheight;
                        }
                    }
                    if(fxd){//设置位置
                        morg.css({left: Math.round(sx), top: Math.round(sy)});
                    }else{
                        morg.offset({left: Math.round(sx), top: Math.round(sy)});
                    }
                    
                }
                
                //碰撞检测
                if(drag){
                    var da, ax, ay, aw, ah, i, j;
                    if(s.mousehit){
                        ax = ex - doc.scrollTop();
                        ay = ey - doc.scrollLeft();
                        aw = 1;
                        ah = 1;
                    }else{
                        da = drag[0].offset();
                        ax = da.left;
                        ay = da.top;
                        aw = drag[1] * s.dropRange;
                        ah = drag[2] * s.dropRange;
                    }
                    for(i=0,j=drop.length; i<j; i++){
                        var dx = drop[i];
                        if(dx.is(':visible') && dx[0]!==t){
                            var dd = dx.data(dot), db = dx.offset(),
                            bx = db.left, by = db.top, 
                            bw = dx.outerWidth() * s.dropRange, 
                            bh = dx.outerHeight() * s.dropRange;
                            
                            if (by + bh < ay || // is the bottom b above the top of a?
                            by > ay + ah || // is the top of b below bottom of a?
                            bx + bw < ax || // is the right of b to the left of a?
                            bx > ax + aw){ // is the left of b to the right of a?
                                //没有碰撞
                                if(dd){
                                    e.type = 'drag';
                                    e.target = t;
                                    $t.trigger(e, ['exit', dx[0]]);//发送事件
                                    e.type = 'drop';
                                    e.target = dx[0];
                                    dx.trigger(e, ['exit', t]);
                                    dx.removeData(dot);
                                }
                            }else{
                                //碰撞
                                if(dd){
                                    e.type = 'drag';
                                    e.target = t;
                                    $t.trigger(e, ['over', dx[0]]);//发送事件
                                    e.type = 'drop';
                                    e.target = dx[0];
                                    dx.trigger(e, ['over', t]);
                                }else{
                                    dx.data(dot, 1);
                                    e.type = 'drag';
                                    e.target = t;
                                    $t.trigger(e, ['enter', dx[0]]);//发送事件
                                    e.type = 'drop';
                                    e.target = dx[0];
                                    dx.trigger(e, ['enter', t]);
                                }
                            }
                        }
                    }
                }
                
            }
            e.type = 'drag';
            e.target = t;
            $t.trigger(e, 'move');//发送事件
        };
        
        stop = function(e){
            doc.unbind('.'+ id);
            if(hd[0].releaseCapture){
                hd.unbind('losecapture.' + id);
                hd[0].releaseCapture();
            }else{
                win.unbind('blur', stop);
            }
            if(s.movecls){
                hd.removeClass(s.movecls);
            }
            if(s.resetposition && 'static' === sta){//重置到原来的定位状态
                $t.css({position: sta, top: 0, left: 0});
            }
            $t.data(s.dat, 0);
            e.drag = drag;
            if(dr > 1){
                if(!s.scroll){
                    if(s.proxy && s.moveOnEnd){//清除Proxy
                        if(s.size){
                            //改变大小
                            $t.css({width: Math.round(morg.width() - pw), height: Math.round(morg.height() - ph)});
                        }else{
                            x = morg.offset();
                            if(fxd){
                                $t.css({left: x.left - win.scrollLeft(), top: x.top - win.scrollTop()});
                            }else{
                                $t.offset(x);
                            }
                        }
                    }
                    if(s.toper){//转绝对定位到相对定位
                        x = $t.position();
                        $t.css({top: Math.round((x.top/s.toper.height())*100) + '%', left: Math.round((x.left/s.toper.width())*100) + '%'});
                    }
                    //发送是否In Drop事件
                    if(drag){
                        var i, j;
                        x = 1;
                        for(i=0,j=drop.length; i<j; i++){
                            var dx = drop[i];
                            if(dx.data(dot) && dx.is(':visible')){
                                e.type = 'drag';
                                e.target = t;
                                $t.trigger(e, ['hit', dx[0]]);//发送事件
                                e.type = 'drop';
                                e.target = dx[0];
                                dx.trigger(e, ['hit', t]);
                                x = 0;
                                break;//暂时简单处理，只处理第一个Drop
                            }
                        }
                        if(x){
                            e.type = 'drag';
                            e.target = t;
                            $t.trigger(e, ['miss']);//发送事件
                        }
                    }
                }
                e.type = 'drag';
                e.target = t;
                $t.trigger(e, 'stop');//发送事件
                if(s.proxy && morg){
                    morg.remove();
                    morg = 0;
                }
            }
            drag = 0;
            if(prx){//删除临时生成的拖动对象
                prx.remove();
            }
            prx = 0;
            dr = 0;
        };
        
        hd.bind((it ? 'touchstart.': 'mousedown.')+ id, start);
        $t.one('removedrag', function(e){//清除取消拖动
            hd.unbind('.' + id);
            stop(e);
        });
    });//end each
};

//drop setting
/* 
pst = {
    groups: ['jquerydd'] //对应组
}
*/
var pst = {
    groups: ['jquerydd']
};

//设置默认参数
$.dropSetup = function(s){
    $.extend(pst, s);
};

$.fn.drop = function(s){
    //应用新设置
    s = $.extend({}, pst, s);
    return this.each(function(){
        var t = this, $t = $(t);
        t.setAttribute('jquerydd', '|' + s.groups.join('|') + '|');
        $t.one('removedrop', function(){//清除取消Drop
            t.removeAttribute('jquerydd');
        });
    });
};

}(jQuery));
