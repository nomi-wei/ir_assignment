var os = require('os'),
	WebCrawler = require('./webcrawler.js').WebCrawler,
	fs = require('fs'),
	jsdom = require('jsdom'),
	jquery = fs.readFileSync('./jquery.js');

var webcrawler = new WebCrawler();

exports.crawl = function(page, callback) {

	var timeout = 10,
		getDataNum = 0,
		startTime = os.uptime(), // help calc if timeout or not
		timeoutMarker = false, // the marker of timeout
		dataset = []; // return the dataset to callback function

	var getXueXiaoYaoWenList = function() (callback) {

		var req = webcrawler.get({
			hostname: 'news.scut.edu.cn',
			port: 80,
			path: '/s/22/t/4/p/69/c/7/i/344/list.htm',
			method: 'GET',
			charset: 'utf8'
		}, function(content, status, headers) {

			// var str = content.match(/<ul id="itemList".*?<\/ul>/);
			fs.writeFileSync('xxx.txt', content);

			// jsdom.env({
			// 	html: content,
			// 	src: [jquery],
			// 	done: function(errors, window) {
			// 		var document = window.document,
			// 			$ = window.$,
			// 			data = [];

			

			
			// 		console.log('paipai:' + (os.uptime() - startTime));

			// 		dataset = dataset.concat(data);

			// 		callback(data, 'paipai');
			// 	}
			// });
		}, function(error) {
			console.log("ERROR: " + error.message);
		});

		return req;
	};

};