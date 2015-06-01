var os = require('os'),
	http = require('http'),
	iconv = require('iconv-lite');

exports.VERSION = "0.0.2";

function WebCrawler() {
	this.maxAge = 3600;
	this.cache = {};
}

WebCrawler.prototype.get = function(opt, callback, error_callback) {

	var self = this,
		startTime = os.uptime();

	var options = {
		hostname: 'www.baidu.com',
		port: 80,
		path: '/',
		method: 'GET',
		charset: 'utf8',
		timeout: 2000,
		headers: {
			'Accept-Encoding': 'gzip',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
		}
	};

	for (name in opt) {
		if (opt.hasOwnProperty(name)) {
			options[name] = opt[name];
		}
	}

	var auto_build_opt = {
		hostname: options.hostname,
		port: options.port,
		path: options.path,
		method: options.method,
		headers: options.headers
	};

	if (this.cache[auto_build_opt.hostname+auto_build_opt.path]) {
		var obj = this.cache[auto_build_opt.hostname+auto_build_opt.path];
		if (os.uptime() - obj.cacheTime < this.maxAge) {
			callback(obj.html, obj.status, obj.headers);
			return;
		}
	}

	console.log("`WebCrawler` request: " + auto_build_opt.hostname + auto_build_opt.path);

	var req = http.request(auto_build_opt, function(res) {

		var html = '',
			status = res.statusCode,
			headers = res.headers,
			hasReturn = false;

		// re-locate
		if (res.statusCode == 302) {
			callback(res.headers['location'], status, headers);
			return;
		}

		var setCache = function(html, status, headers) {
			self.cache[auto_build_opt.hostname + auto_build_opt.path] = {
				html : html,
				status : status,
				headers : headers,
				cacheTime : os.uptime()
			}
		}

		var ret = function() {
			if (hasReturn) return;

			// convert the charset
			if (options.charset === 'gbk') {
				html = iconv.decode(new Buffer(html, 'binary'), 'gbk');
			}
				
			callback(html, status, headers);
			setCache(html, status, headers);

			hasReturn = true;
		};

		if (options.charset === 'gbk') {
			res.setEncoding('binary');
		} else {
			res.setEncoding(options.charset);
		}

		res.on('data', function(chunk) {
			//console.log('the data of ' + options.hostname + ' receive.');
			html += chunk;
		});

		res.on('end', function() {
			console.log('end:' + (os.uptime() - startTime));
			ret();
		});

		res.on('close', function() {
			console.log('close');
			ret();
		});
	});

	req.on('error', function(error) {
		typeof error_callback !== 'function' || error_callback(error);
	});

	req.end();

	return req;
}

exports.WebCrawler = WebCrawler;