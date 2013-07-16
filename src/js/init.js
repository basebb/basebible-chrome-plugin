/*global jQuery:false, $:false, window:false, chrome:false */

//初始化命名空间
$.extend({
    xm:{}, //模组
    ss:{ //系统全局变量，将在绑定js时直接附加在s变量中[2011-05-05增加]
        doc: $(document),
        win: $(window),
        body: $('body'),
        lay: $('#lay'),
        store: window.localStorage
    },
    ms:{ //全局设置
        version: chrome.app.getDetails().version,//得到了版本号
        //server: 'http://localhost/',//服务器url地址
        imgpath: 'img/',//图片目录路径
        bibles: window.localStorage['bibles'],//指示是否已经安装了圣经到数据库
        local: chrome.i18n.getMessage('ln')||chrome.i18n.getMessage('@@ui_locale'),//得到当前语言代码
        notePath: 'setting.newnote|300px',//打开笔记编辑框的路径和宽度
        cnum: [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22],//圣经每一卷书的章数
        select:[]//选择的经文
    }, 
    bj:{}, //绑定JS
    cm:{}, //共同函数和方法
    ln:{} //语言包
});

$.fn.th = $.fn.triggerHandler;//简写这个函数，因为这个函数使用比较多
