/*global jQuery:false, $:false, window:false */

//通用登录表单检测，针对JS客户端

/**
 * 修改记录
 * 1.0.0 [2012-04-09] 根据原来的Form表单代码进行优化，针对JS客户端
 * 1.0.1 [2012-05-10] 修改本地方式返回的状态，设置为5
**/

(function($){
// f -- form $(f)
// bf -- back function, 0--成功，1--失败，2--失败，解析JSON错误，3--正在在提交数据, -1 为返回HTML, 5-- 为本地方式，没有经过远程服务器
// bs -- before send function
// bv -- after validate data

$.cm.form = function(f, bf, bs, bv){
    var ln = $.ln.cm, cm = $.cm;
    bf = bf || $.noop;
    f.submit(function(e){
        var f = $(e.target), t = $(':input[name][type!=submit]', f).filter(':not([type!=hidden]:hidden)'), //过滤隐藏的input
        i;
        if(bs){//过滤验证前的数据
            i = bs.call(f, e, t);
            if(false === i){
                return false;
            }else if(i){
                t = i;
            }
        }
        if(cm.valid(f, t) > 0){ //验证数据
            return false;
        }
        
        if(bv){//过滤验证后的数据
            i = bv.call(f, e, t);
            if(false === i){
                return false;
            }else if(i){
                t = i;
            }
        }
        
        t = t.get();//得到DOM数组而不是Jquery数组
        
        var o, j, n, v, at = f.attr('action'),
        //得到回调函数，如果有回调函数说明是在对话框里
        w = f.closest('div.mod[id^=dialog]'), b = w.data('back');
        
        //提交数据，如果有action地址就提交数据，如果没有则把数据回调
        if(at){
            o = [];
            for(i=0; i<t.length; i++){//组装要发送的数据
                j = $(t[i]);
                n = j.attr('name');
                v = j.val();
                if(j.is(':password')){
                    o.push({name: n, value: $.md5(v)});
                }else if(j.is(':radio') || j.is(':checkbox')){
                    if(j.is(':checked')){
                        o.push({name: n, value: v});
                    }
                }else if(!j.is('button,[type=button]')){// button use for upload file
                    o.push({name: n, value: v});
                }
            }
            
            $.ss.doc.th('ajaxShow');//显示加载的提示
            $.ajax({
                url: at,
                type: f.attr('method'),
                data: o,
                dataType: 'json',
                success: function(x){
                    if('string' !== typeof x){
                        if(b){
                            if(false !== b(x)){
                                cm.svalid(f, x.valid);
                                cm.act(x);
                            }
                            w.trigger('close');//关闭对话框
                        }else{
                            if(false !== bf.call(f, x, 0)){//调用回调函数,成功
                                cm.svalid(f, x.valid);
                                cm.act(x);
                            }
                        }
                    }else{
                        bf.call(f, x, -1);
                    }
                },
                error: function(x, t, e){
                    try{
                        x = $.parseJSON(x.responseText);
                    }catch(ex){
                        cm.act({'500': ln.dwro});
                        bf.call(f, x, 2);
                        return;
                    }
                    if(false !== bf.call(f, x, 1)){//调用回调函数
                        cm.svalid(f, x.valid);
                        cm.act(x);
                    }
                }
            });
        }else{
            o = {};
            for(i=0; i<t.length; i++){//组装要发送的数据
                j = $(t[i]);
                n = j.attr('name');
                v = j.val();
                if(j.is(':password')){
                    o[n] = undefined === o[n]? $.md5(v) : ($.isArray(o[n])? o[n].push($.md5(v)): [o[n], $.md5(v)]);
                    //o.push({name: n, value: $.md5(v)});
                }else if(j.is(':radio') || j.is(':checkbox')){
                    if(j.is(':checked')){
                        //o.push({name: n, value: v});
                        o[n] = undefined === o[n]? v : ($.isArray(o[n])? o[n].push(v): [o[n], v]);
                    }
                }else if(!j.is('button,[type=button]')){// button use for upload file
                    //o.push({name: n, value: v});
                    o[n] = undefined === o[n]? v : ($.isArray(o[n])? o[n].push(v): [o[n], v]);
                }
            }
            if(b){
                if(false !== b(o)){
                    bf.call(f, o, 5);
                }
            }else{
                bf.call(f, o, 5);
            }
        }
        return false;
    });
};
}(jQuery));