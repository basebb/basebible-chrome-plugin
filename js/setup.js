/*global jQuery:false, $:false, window:false, chrome:false, JSON:false */
(function($, win){
$.cm.setup = function(){
    var ms = $.ms, ln = $.ln.cm;
    ln.title = chrome.i18n.getMessage('name');//加载i18n数据
    ln.desc = chrome.i18n.getMessage('description');
    document.title = ln.title;//设置标题
    
    //圣经每一卷书的章数
    //ms.cnum = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
    
    //初始化设置
    ms.runtime = win.localStorage['runtime'] ? JSON.parse(win.localStorage['runtime']) : {
        bible: $.ln.cm.bibleList[0][0],// bible 哪个版本圣经
        roll: 1,// roll 哪一卷
        chapter: 1,// chapter 哪一章
        scroll: 0,// scroll 滚动位置
        bible2: $.ln.cm.bibleList[1][0],// bible2 第二个圣经版本
        showb2: 1,// showb2 是否显示第二个圣经0|1
        fontsize: 100,// fontsize 字体大小
        side: [1], //侧边功能框，第一位表示是否显示，下一位表示侧边哪一个高亮
        bookmarkon: {}, //书签列表哪个展开
        highlighton: {}, //高亮列表哪个展开
        planon: {}, //计划列表哪个展开
        notePosition: {} // {left: x, top: y} 笔记弹出窗口位置
    };
    
    // test
    //win.localStorage['bibles'] = '';
    
    //初始化默认面板语言填充数据
    ms.htmlData = {ln: $.ln.cm, ms: ms};
    
    // 初始始化数据库
    // 检查数据库是否有数据，如果没有数据加载数据到数据库
    if(!ms.bibles){
        ms.bibleList = $.ln.cm.bibleList;//初始化圣经列表
        var ps = '/bibles/', tx = $.ss.tx,
        //bs = ['CUNPSS', 'niv84'],
        dc = $.ss.doc,
        all = 1189 * ms.bibleList.length, //经文总章数
        cou = 0,
        ab = function(vi){
            var c, j, nt = function(c, j){
                dc.queue('setup', function(){
                    $.get(ps + vi + '/' + (c<9 ? '0': '')+ (c+1) +'_'+ (j+1) +'.html', function(x){
                        //把数据插入数据库
                        tx('addBible', {bible:vi, roll:c+1, chapter:j+1, content:x}, function(){
                            cou++;
                            if(cou >= all){//设置已经加载完成
                                win.localStorage['bibles'] = 1;
                                ms.bibles = 1;
                                dc.th('setupbible', [100]);
                            }else if(1 === cou%10){
                                dc.th('setupbible', [Math.ceil(cou/all*100)]);
                            }
                            dc.dequeue('setup');
                        });
                    });
                });
            };
            for(c=0; c<ms.cnum.length; c++){
                for(j=0;j<ms.cnum[c];j++){//加载数据
                    nt(c, j);
                }
            }
            dc.dequeue('setup');
        };
        ms.biblePath = ps;
        
        tx('dropTables', /catalog|bible/, function(){
            //初始化书签数据
            tx('createBookmark');
            //初始化高亮数据库
            tx('createHighlight');
            //初始化笔记数据库
            tx('createNote');
            
            //tx('dropTable', 'catalog');//消除圣经目录数据
            //创建圣经目录和表
            tx('createCatalog', function(){
                $.each(ms.bibleList, function(i, vi){
                    vi = vi[0];
                    $.get(ps+ vi +'/info.txt', function(x){
                        x = x.split('|');
                        tx('addCatalog', {name: vi, lang: x[1], version: x[2], content: x[3], copyright:x.slice(4).join('|'), updated: parseInt(x[0],10)}, function(){//创建数据库
                            tx('createBible', {bible: vi}, function(){ab(vi);});
                        });
                        
                    });
                });
            });
        });
    }
    
    // 当关闭时保存定位数据
    $.ss.win.bind('unload', function(){
        win.localStorage['runtime'] = JSON.stringify(ms.runtime);
    });
    
    // 初始化窗口插件数据
    $.dialogSetup({
        ln: $.ln.dialog,
        zIndex: 8
    });
    $.validatorSetup({lang: $.ln.validator});
    $.dateSetup({i18n: $.ln.date});
    $.datepickerSetup({ln: $.ln.datepicker});
    
    
    // 处理命令信息
    $.ss.doc.bind('command', function(e, x, dt){
        x = x.split('|');
        switch(x[0]){
        case 'dialog'://弹出窗口
            $.ejs({name: x[1], data:ms.htmlData, back: function(v){
                $.dialog({html:v, title:x[2], width:x[3], height:x[4], bridge: dt});//【20120510】增加桥接数据的接入
            }});
        break;
        case 'copyright'://圣经版本
            $.ss.tx('loadCatalog', {name: x[1]}, function(tx, re){
                re = re.rows;
                if(re.length>0){
                    $.dialog({html:'<div id="cpy" class="mod">'+ re.item(0).copyright +'</div>', title:$.ln.cm.copyright, width:800});
                }
            });
        break;
        case 'aboutplan'://关于计划
            $.ss.tx(x[1], dt, function(tx, re){
                re = re.rows;
                if(re.length>0){
                    re = re.item(0);
                    $.dialog({html:'<div id="cpy" class="mod">'+ re.about +'</div>', title:$.ln.cm.about+' '+re.name, width:800});
                }
            });
        break;
        }
    });
    
    //test
    // $.ss.tx('addPlan', {tx:tx, data:[
        // '我的计划2',
        // 1, //1表示日期
        // '[[1,"17 1|28 1|2 1~2"],[50,"|45 1|3 4~5"],[90,"20 20|58 1|60 1~2"]]',//计划明细
        // '我的计划2亲近主计划描述'
    // ]});
};
}(jQuery, window));