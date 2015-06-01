var os = require('os'),
	http = require('http'),
	WebCrawler = require('./webcrawler.js').WebCrawler,
	fs = require('fs'),
	jsdom = require('jsdom'),
	jquery = fs.readFileSync('./jquery.js');

var webcrawler = new WebCrawler();

var links_array = [], news_array = [];

var getCommonList = function (link, callback) {

	var startTime = os.uptime();

	var req = webcrawler.get({
		hostname: 'news.scut.edu.cn',
		path: link,
	}, function(content, status, headers) {

		//fs.writeFileSync('xxx.txt', content);

		jsdom.env({
			html: content,
			src: [jquery],
			done: function(errors, window) {
				var document = window.document,
					$ = window.$;

				$links = $('#newslist').find('a');

				$links.each(function(i){
					var href = $(this).attr('href');
					links_array.push(href);
				});

				console.log('a: ' + $links.length);
				console.log('href: ' + links_array[0]);
				console.log('parse:' + (os.uptime() - startTime));

				console.log('href total num: ' + links_array.length);

				typeof callback !== 'function' || callback();
			}
		});
	}, function(error) {
		console.log("ERROR: " + error.message);
		getCommonList(index, callback);
	});

	return req;
};

var getCommonNews = function (link, str, callback) {

	var startTime = os.uptime();

	var req = webcrawler.get({
		hostname: 'news.scut.edu.cn',
		path: link,
	}, function(content, status, headers) {

		//fs.writeFileSync('xxx.txt', content);

		jsdom.env({
			html: content,
			src: [jquery],
			done: function(errors, window) {
				var document = window.document,
					$ = window.$;

				var $news = $('.display_news_con');
				var $header = $news.find('h1');
				var $postmeta = $news.find('span.posttime')
				var $text = $news.find('.entry');
				var $imgs = $text.find('img');

				$imgs.each(function(i) {
					var src = $(this).attr('src');
					$(this).attr('src', 'http://news.scut.edu.cn' + src);
				});

				var postmeta = $postmeta.html(), 
					header = $header.html(),
					text = $text.html();

				postmeta = postmeta.replace(/&nbsp;/g, '')
									.replace(/\n/g, '')
									.replace('投稿时间:', '')
									.replace('发布时间：', ',')
									.replace('单位:', ',');

				header = header.replace(/\n/g, '');
				text = text.replace(/\n/g, '').replace(/\'/g, "\\'");

				var meta_arr = postmeta.split(','),
					posttime = meta_arr[1].trim(),
					publisher = meta_arr[2].trim();

				// news_array.push({
				// 	header: header,
				// 	posttime: posttime,
				// 	publisher: publisher,
				// 	text: text
				// });

				var data = ["INSERT INTO `ir_assignment`.`", str, "` (`title`, `posttime`, `publisher`, `text`) VALUES ('",
					header, "', '", 
					posttime, "', '",
					publisher, "', '",
					text, "');\n\n"].join('');

				console.log('data: ' + data);

				fs.appendFileSync(str + ".sql", data);

				// console.log('header: ' + header);
				// console.log('postmeta: ' + postmeta);
				// console.log('text: ' + text);
				// console.log('posttime: ' + posttime);
				// console.log('publisher: ' + publisher);

				console.log('parse:' + (os.uptime() - startTime));

				typeof callback !== 'function' || callback();
			}
		});
	}, function(error) {
		console.log("ERROR: " + error.message);
		getCommonNews(link, callback);
	});

	return req;
};

var crawlXueXiaoYaoWenList = function(callback) {

	var i = 344, running = false;

	setTimeout(function() {
		if (i > 0) {
			if (!running) {
				getCommonList(['/s/22/t/4/p/69/c/7/i/', i, '/list.htm'].join(''), function() {
					running = false;
					i--;
				});
				running = true;
			}
			setTimeout(arguments.callee, 100);
		} else {
			typeof callback !== 'function' || callback();
		}
	}, 0);

};

var crawlXiaoYuanKuaiXunList = function(callback) {

	var i = 315, running = false;

	setTimeout(function() {
		if (i > 0) {
			if (!running) {
				getCommonList(['/s/22/t/7/p/69/c/8/i/', i, '/list.htm'].join(''), function() {
					running = false;
					i--;
				});
				running = true;
			}
			setTimeout(arguments.callee, 100);
		} else {
			typeof callback !== 'function' || callback();
		}
	}, 0);

};

var crawlMeiTiHuaYuanList = function(callback) {

	var i = 610, running = false;

	setTimeout(function() {
		if (i > 0) {
			if (!running) {
				getCommonList(['/s/22/t/3/p/61/i/', i, '/list.htm'].join(''), function() {
					running = false;
					i--;
				});
				running = true;
			}
			setTimeout(arguments.callee, 100);
		} else {
			typeof callback !== 'function' || callback();
		}
	}, 0);

};

var crawlCommonNews = function(links, str, callback) {

	var i = 0, running = false;

	setTimeout(function() {
		if (i < links.length) {
			if (!running) {
				getCommonNews(links[i], str, function() {
					running = false;
					i++;
				});
				running = true;
			}
			setTimeout(arguments.callee, 100);
		} else {
			typeof callback !== 'function' || callback();
		}
	}, 0);

};

crawlXueXiaoYaoWenList(function() {
	crawlCommonNews(links_array, 'XueXiaoYaoWen', function() {
		links_array = [];
		crawlXiaoYuanKuaiXunList(function() {
			crawlCommonNews(links_array, 'XiaoYuanKuaiXun', function() {
				links_array = [];
				crawlMeiTiHuaYuanList(function() {
					crawlCommonNews(links_array, 'MeiTiHuaYuan');
				});
			});
		});
	});
});


// crawlXiaoYuanKuaiXunList(function() {
// 	crawlCommonNews(links_array, 'XiaoYuanKuaiXun', function() {
// 		links_array = [];
// 		crawlMeiTiHuaYuanList(function() {
// 			crawlCommonNews(links_array, 'MeiTiHuaYuan');
// 		});
// 	});
// });