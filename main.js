'use strict'

// 使用 handlebars 從資料產生 html
var renderUserList = (function () {
    // 要用來套的樣板
    var userTpl = document.getElementById('user-tpl').innerHTML;

    // compile 成 handlebars 套版 function
    var renderToHtml = Handlebars.compile(userTpl);

    // html 的目的地
    var userListElement = document.getElementById('user-list');

    // 之後乎叫 renderUserList 就是在叫這個 function
    return function (data) {
        var html = renderToHtml(data);
        userListElement.innerHTML = html;
    }
}());


// 用來操作資料的物件
var UserList = (function () {
    var USER_LIST = "userList";

    // 主要的資料
    var _users = [];
    var _post = [];
    var _undo = [];
	
	function clone( obj ) {
		if ( obj ) {
			if ( /^(Object|Array)$/.test( obj.constructor.name ) ) {
				var tmp = obj.constructor();
				for ( var key in obj ) 
					tmp[key] = clone(obj[key]);
				
				return tmp;
			} else
				return obj.constructor( obj.valueOf() );
		} else
			return obj
	}
	
	function compare( obj1, obj2 ) {
		if ( obj1.constructor.name == obj2.constructor.name ) {
			if ( /^(Object|Array)$/.test( obj1.constructor.name ) ) {
				if ( Object.getOwnPropertyNames(obj1).length 
					== Object.getOwnPropertyNames(obj2).length ) {
					for ( var key in obj1 )
						if ( !compare( obj1[key], obj2[key] ) )
							return false;
					
					return true;
				}
			} else
				return obj1.valueOf() == obj2.valueOf();
		}
		
		return false;
	}
	
    return {
        // 把資料存到 local storage
        save: function() {
            // local storage 只能存字串
			var store = localStorage.getItem(USER_LIST);
			store = ( store ) ? JSON.parse(store) : [] ;
			store.forEach(function(rec){
			   rec.birthday = new Date(rec.birthday);
			});
            if ( !compare( store, _users ) )
				localStorage.setItem(USER_LIST, JSON.stringify(_users));

            alert('存擋成功');
        },
        // 從 local storage 載入資料
        load: function() {
            var users = localStorage.getItem(USER_LIST);
            if(users) {
                // 把字串轉回 json 物件
                users = JSON.parse(users);

                // 把生日從字串轉回 Date 物件
                users.forEach(function(user){
                   user.birthday = new Date(user.birthday);
                });

                _users = users;
                renderUserList(_users);
            }
        },
        add: function (user) {
            _post.push(clone(_users));
            _undo = [];
            _users.push(user);
            renderUserList(_users);
        },
        remove: function (i) {
			_post.push(clone(_users));
            _undo = [];
            var data = _users.splice(i, 1);
            renderUserList(_users);
        },
        redo: function() {
            var data = _undo.pop();
            if ( data ) {
                _post.push(_users);
                _users = data;
                renderUserList(_users);
            }
        },
        undo: function() {
            var data = _post.pop();
            if ( data ) {
                _undo.push(_users);
                _users = data;
                renderUserList(_users);
            }
        }
    };

}());


// init app
(function init() {

    Handlebars.registerHelper("localeDate", function (date) {
        return date ? date.toLocaleDateString() : '';
    });

    // 一開始就把資料從 local storage 讀出來放在畫面上
    UserList.load();

    // 當使用者按下新增使用者要做的事
    function handleSubmit(e) {
        // 不要 submit
        e.preventDefault();

        // 取出 user
        var user = {
            name: document.getElementById('input-user-name').value,
            email: document.getElementById('input-user-email').value,
            // 我們的 birthday 是一個 Date 物件
            birthday: new Date(document.getElementById('input-user-birthday').value),
            // 將興轉成陣列 'a, b, c' => ['a', 'b', 'c']
            habits: document.getElementById('input-user-habits').value.split(',').map(function (s) {
                return s.trim();
            })
        };

        UserList.add(user);
        document.forms[0].reset();
    }

    document.forms[0].addEventListener('submit', handleSubmit);


    function redo() {
        UserList.redo();
    }

    function undo() {
        UserList.undo();
    }

    function save() {
        UserList.save();
    }

    document.getElementById('save-btn').addEventListener('click', save);
    document.getElementById('redo-btn').addEventListener('click', redo);
    document.getElementById('undo-btn').addEventListener('click', undo);
}());