/*global jQuery:false, $:false, window:false */
(function($){

var db = window.openDatabase("BaseBible", "", "BaseBible Database", 50*1024*1024);
//$.cm.db = db;//把db查询公开出来
$.ss.tx = function(i, r, b){//r.tx 返回原来的查询指针方便重新查询
    if(!b){
        if($.isFunction(r)){
            b = r;
            r = '';
        }else{
            b = $.noop;
        }
    }
    var q, o, t;
    switch(i){
    case 'loadBible':
        q = 'SELECT content FROM bible_'+ r.bible +' WHERE roll=? AND chapter=? LIMIT 0,1';
        o = [r.roll, r.chapter];
    break;
    case 'searchBible':
        q = 'SELECT * FROM bible_'+ r.bible +' WHERE roll>=? AND roll<=? AND content LIKE ?';
        o = [r.min, r.max, '%'+r.q.replace(' ', '%')+'%'];
    break;
    case 'createBible':
        q = 'CREATE TABLE IF NOT EXISTS bible_' + r.bible + ' ('
            +   'roll INTEGER,'
            +   'chapter INTEGER,'
            +   'content TEXT);';
    break;
    case 'deleteBible':
        q = 'DROP TABLE IF EXISTS bible_'+ r.bible;
    break;
    case 'addBible':
        q = 'INSERT INTO bible_'+ r.bible +' (roll, chapter, content) VALUES (?, ?, ?);';
        o = [r.roll, r.chapter, r.content];
    break;
    case 'loadCatalog'://加载目录
        if(r.name){
            q = 'SELECT * FROM catalog WHERE name=? LIMIT 0,1';
            o = [r.name];
        }else if(r.isuse){
            q = 'SELECT * FROM catalog WHERE isuse=1 ORDER BY up DESC';
        }else{
            q = 'SELECT * FROM catalog ORDER BY up DESC';
        }
    break;
    case 'createCatalog':
        q = 'CREATE TABLE IF NOT EXISTS catalog ('
            //+   'id INTEGER PRIMARY KEY,'
            +   'isuse BLOB DEFAULT 1,'
            +   'up INTEGET DEFAULT 0,' //用于排序
            +   'name TEXT,'
            +   'lang TEXT,'
            +   'version TEXT,'
            +   'content TEXT,'
            +   'copyright TEXT,'
            +   'updated INTEGER);';
    break;
    case 'addCatalog':
        q = 'INSERT INTO catalog (name, lang, version, content, copyright, updated) VALUES (?, ?, ?, ?, ?, ?);';
        o = [r.name, r.lang, r.version, r.content, r.copyright, r.updated];
    break;
    case 'updateCatalog':
        q = 'UPDATE catalog SET isuse=?, up=? WHERE name=?';
        o = [r.isuse?1:0, r.up, r.name];
    break;
    case 'createBookmark'://创建书签
        q = ['CREATE TABLE IF NOT EXISTS bookmark ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER NOT NULL,'
            +   'fid INTEGER NOT NULL,'
            +   'name TEXT NOT NULL,'
            +   'bible TEXT NOT NULL,'
            +   'roll INTEGER NOT NULL,'
            +   'chapter INTEGER NOT NULL);',
            
            'CREATE TABLE IF NOT EXISTS bookmark_folder ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER,'
            +   'name TEXT NOT NULL);'];
    break;
    case 'addBookmark'://增加书签数据
        q = 'INSERT INTO bookmark (up, fid, name, bible, roll, chapter) VALUES (?, ?, ?, ?, ?, ?);';
        o = [r.up, r.fid, r.name, r.bible, r.roll, r.chapter];
    break;
    case 'updateBookmark':
        t = [];
        o = [];
        $.each(['up', 'fid', 'name'], function(i, v){
            if(r[v]){
                t.push(v+'=?');
                o.push(r[v]);
            }
        });
        q = 'UPDATE bookmark SET '+ t.join(', ') +' WHERE id=?';
        o.push(r.id);
    break;
    case 'addBookmarkFolder'://增加书签文件夹数据
        q = 'INSERT INTO bookmark_folder (up, name) VALUES (?, ?);';
        o = [r.up, r.name];
    break;
    case 'loadBookmark':
        if(r.fid){
            q = 'SELECT * FROM bookmark WHERE fid=? ORDER BY up DESC';
            o = [r.fid];
        }else if(r.bible){
            q = 'SELECT * FROM bookmark WHERE bible=? AND roll=? AND chapter=? LIMIT 0,1';
            o = [r.bible, r.roll, r.chapter];
        }
    break;
    case 'deleteBookmarkFolder'://删除书签文件夹
        q = ['DELETE FROM bookmark_folder WHERE id=?', 'DELETE FROM bookmark WHERE fid=?'];
        o = [r.id];
    break;
    case 'deleteBookmark':
        q = 'DELETE FROM bookmark WHERE id=?';
        o = [r.id];
    break;
    case 'loadBookmarkFolder':
        q = 'SELECT * FROM bookmark_folder ORDER BY up DESC';
    break;
    case 'updateBookmarkFolder':
        t = [];
        o = [];
        $.each(['up', 'name'], function(i, v){
            if(r[v]){
                t.push(v+'=?');
                o.push(r[v]);
            }
        });
        q = 'UPDATE bookmark_folder SET '+ t.join(', ') +' WHERE id=?';
        o.push(r.id);
    break;
    case 'createHighlight'://高亮标签
        q = 'CREATE TABLE IF NOT EXISTS highlight ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER NOT NULL,'
            +   'cid INTEGER NOT NULL,'
            +   'name TEXT NOT NULL,'
            +   'bible TEXT DEFAULT "",'
            +   'roll INTEGER NOT NULL,'
            +   'chapter INTEGER NOT NULL,'
            +   'verse INTEGER NOT NULL);';
    break;
    case 'addHighlight'://增加书签数据
        q = 'INSERT INTO highlight (up, cid, name, bible, roll, chapter, verse) VALUES (?, ?, ?, ?, ?, ?, ?);';
        o = [r.up, r.cid, r.name, r.bible, r.roll, r.chapter, r.verse];
    break;
    case 'loadHighlight'://显示经文中的高亮
        if(r.cid>=0){
            q = 'SELECT * FROM highlight WHERE cid=? ORDER BY up DESC';
            o = [r.cid];
        }else if(r.all){//加载包括bible项没有值的数据
            q = 'SELECT * FROM highlight WHERE (bible=? AND roll=? AND chapter=?) OR (bible="" AND roll=? AND chapter=?)';
            o = [r.bible, r.roll, r.chapter, r.roll, r.chapter];
        }else if(r.verse){
            q = 'SELECT * FROM highlight WHERE bible=? AND roll=? AND chapter=? AND verse=? LIMIT 0,1';
            o = [r.bible, r.roll, r.chapter, r.verse];
        }else if(r.roll){
            q = 'SELECT * FROM highlight WHERE bible=? AND roll=? AND chapter=?';
            o = [r.bible, r.roll, r.chapter];
        }
    break;
    case 'updateHighlight':
        t = [];
        o = [];
        $.each(['up', 'cid', 'name'], function(i, v){
            if(r[v] !== undefined){
                t.push(v+'=?');
                o.push(r[v]);
            }
        });
        q = 'UPDATE highlight SET '+ t.join(', ') +' WHERE id=?';
        o.push(r.id);
    break;
    case 'deleteHighlight':
        if(r.id){
            q = 'DELETE FROM highlight WHERE id=?';
            o = [r.id];
        }else if(r.verse){
            if($.isArray(r.verse)){
                q = [];
                o = [];
                $.each(r.verse, function(i, v){
                    q[i] = 'DELETE FROM highlight WHERE bible=? AND roll=? AND chapter=? AND verse=?';
                    o[i] = [r.bible, r.roll, r.chapter, v];
                });
            }else{
                q = 'DELETE FROM highlight WHERE bible=? AND roll=? AND chapter=? AND verse=?';
                o = [r.bible, r.roll, r.chapter, r.verse];
            }
        }
    break;
    case 'createNote'://读经笔记
        q = ['CREATE TABLE IF NOT EXISTS note ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER NOT NULL,'
            +   'title TEXT,'
            //+   'lection TEXT,'//圣经经文索引，JSON方式
            +   'content TEXT,'
            +   'created INTEGER,'
            +   'updated INTEGER);',
            
            'CREATE TABLE IF NOT EXISTS note_verse ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER NOT NULL,'
            +   'nid INTEGER NOT NULL,'
            +   'name TEXT NOT NULL,'
            +   'bible TEXT NOT NULL,'
            +   'roll INTEGER NOT NULL,'
            +   'chapter INTEGER NOT NULL,'
            +   'verse TEXT NOT NULL);'];
    break;
    case 'loadNote'://加载笔记
        if(r.id){
            q = 'SELECT * FROM note WHERE id=? LIMIT 0,1';
            o = [r.id];
        }else{
            q = 'SELECT * FROM note ORDER BY up DESC';
        }
    break;
    case 'loadNoteVerse':
        if(r.nid){
            q = 'SELECT * FROM note_verse WHERE nid=? ORDER BY up DESC';
            o = [r.nid];
        }
    break;
    case 'addNote'://增加笔记
        q = 'INSERT INTO note (up, title, content, created, updated) VALUES (?, ?, ?, ?, ?);';
        o = [r.up, r.title, r.content, r.created, r.updated];
    break;
    case 'addNoteVerse'://增加笔记经文
        q = 'INSERT INTO note_verse (up, nid, name, bible, roll, chapter, verse) VALUES (?, ?, ?, ?, ?, ?, ?);';
        o = [r.up, r.nid, r.name, r.bible, r.roll, r.chapter, r.verse];
    break;
    case 'updateNote':
        t = [];
        o = [];
        $.each(['up', 'title', 'content', 'updated'], function(i, v){
            if(r[v] !== undefined){
                t.push(v+'=?');
                o.push(r[v]);
            }
        });
        q = 'UPDATE note SET '+ t.join(', ') +' WHERE id=?';
        o.push(r.id);
    break;
    case 'searchNote'://搜索笔记
        t = '%'+r.q.replace(' ', '%')+'%';
        q = 'SELECT id FROM note WHERE title LIKE ? OR content LIKE ?';
        o = [t, t];
    break;
    case 'deleteNote':
        q = 'DELETE FROM note WHERE id=?';
        o = [r.id];
    break;
    case 'deleteNoteVerse':
        q = 'DELETE FROM note_verse WHERE nid=?';
        o = [r.nid];
    break;
    case 'createPlan'://读经计划
        q = 'CREATE TABLE IF NOT EXISTS plan ('
            +   'id INTEGER PRIMARY KEY,'
            +   'up INTEGER DEFAULT 0,'
            +   'name TEXT,'
            +   'num INTEGER,' //起初日期字母
            +   'content TEXT NOT NULL,'
            +   'read TEXT,'//已经阅读
            +   'about TEXT);';
    break;
    case 'addPlan':
        if(r.data){
            q = 'INSERT INTO plan (name, num, content, about) VALUES (?, ?, ?, ?);';
            o = r.data;
        }
    break;
    case 'loadPlan':
        if(r.id){
            q = 'SELECT * FROM plan WHERE id=? LIMIT 0,1';
            o = [r.id];
        }else{
            q = 'SELECT id, up, name, num, content, read FROM plan ORDER BY up DESC';
        }
    break;
    case 'updatePlan':
        t = [];
        o = [];
        $.each(['up', 'num', 'read'], function(i, v){
            if(r[v] !== undefined){
                t.push(v+'=?');
                o.push(r[v]);
            }
        });
        q = 'UPDATE plan SET '+ t.join(', ') +' WHERE id=?';
        o.push(r.id);
    break;
    case 'deletePlan':
        q = 'DELETE FROM plan WHERE id=?';
        o = [r.id];
    break;
    
    case 'dropTable':
        q = 'DROP TABLE IF EXISTS '+ r;
    break;
    }
    
    if(q){
        if($.isArray(q)){
            if($.isArray(o)){//整理数据，如果后面的数据没有拿第一个数据
                if(!$.isArray(o[0])){
                    o = [o];
                }
            }else{
                o = o ? [[o]]: [[]];
            }
            if(r && r.tx){
                r.tx.executeSql(q[0], o[0], function(tx, dt){
                    var i;
                    for(i=1; i<q.length; i++){
                        tx.executeSql(q[i], o[i]||o[0]);
                    }
                    b(tx, dt);
                });
            }else{
                db.transaction(function(tx){
                    tx.executeSql(q[0], o[0], function(tx, dt){
                        var i;
                        for(i=1; i<q.length; i++){
                            tx.executeSql(q[i], o[i]||o[0]);
                        }
                        b(tx, dt);
                    });
                }, function(){
                    if(window.console){
                        window.console.log(i, arguments);
                    }
                });
            }
        }else{
            if(r && r.tx){
                r.tx.executeSql(q, o||[], b);
            }else{
                db.transaction(function(tx){
                    tx.executeSql(q, o||[], b);
                }, function(){
                    if(window.console){
                        window.console.log(i, arguments);
                    }
                });
            }
        }
    }else if('dropTables' === i){//删除所有的数据表
        db.transaction(function(t){
            t.executeSql('SELECT name FROM sqlite_master AS a WHERE type="table"', [], function(t, result){
                var i, item, a = result.rows.length, c = 0, 
                bx = function(){
                    c++;
                    if(c >= a && b){
                        b();
                    }
                };
                for (i = 0; i < a; i++) {
                    item = result.rows.item(i).name;
                    if(-1 === item.indexOf('__') && (!r || r.test(item))){//r是正则表示式
                        t.executeSql('DROP TABLE '+item, [], bx);
                    }else{
                        bx();
                    }
                }
            });
        });
    }
};

}(jQuery));