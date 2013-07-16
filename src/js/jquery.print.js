/*global jQuery:false, $:false, window:false */
/**
 * jQuery print, 简单的格式化字符串的实现
 * request jquery
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 1.0.1
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/
//$.print("显示字符串 {0} ， {1}。", ["1", "2"]); 这样用{?}来做匹配
/**
 * 修改记录
 * 1.0.0 [2011-03-18] 初始化代码
 * 1.0.1 [2011-05-16] 增加是否数组的判断
**/

jQuery.print = function(s, v) {//v为数组
    v = $.isArray(v) ? v : [v];
    var n = v.length, i;
    for(i=0; i<n; i++){
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), v[i]);
    }
    return s;
};
