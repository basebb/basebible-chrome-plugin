/*global jQuery:false, $:false, window:false */
(function($){
/* 全局设置 */
var cm = $.cm, ms = $.ms;

/* Ajax全局设置 */
$.ajaxSetup({
    error: function(x, t, e){
        try{
            cm.act($.parseJSON(x.responseText));
        }catch(ex){
            cm.act({'500': ex.type});
        }
    },
    timeout: 5000
});

$.ajax({//加载语言包，为了方便调用，采用这种方式是为了代码缓存
    url: '_locales/'+ ms.local +'/ln.js',
    cache: true,
    dataType: 'script',
    success: function(){
        cm.setup();//运行初始化
        $.ejs({name: 'main.index', data:ms.htmlData, back: function(x){
            cm.bjs($.ss.lay.html(x));
        }});
        
        //test
        // $.ejs({name: 'setting.install', data:ms.htmlData, back: function(x){
            // $.dialog({html:x, title:$.ln.cm.install, width:'700px'});
        // }});
    }
});

}(jQuery));//调整运行方式，当加入了第三方控件时，全部加载完成再运行js太慢了，所以直接运行到这里就开始运行js