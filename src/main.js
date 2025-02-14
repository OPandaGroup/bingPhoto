const { default: axios } = require("axios");
const http = require("http");
const https = require("https");
const fs = require("fs");

var urls = [];

function getPicture(url, path) {
	https.get(url, (res) => {
	
		var imgData = "";
		res.setEncoding("binary");  // 下载图片需要设置为 binary, 否则图片会打不开
	
		res.on('data', (chunk) => {
		   imgData+=chunk;
		});
	
		res.on('end', () => {
			fs.writeFileSync(path, imgData, "binary");
			console.log('Downloaded...\n['+path+'] Done...');
		});
	});
}

function getUrls(){
	axios.get('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=3')
	.then(response => {
		urls = [];
		console.log("Ok updata");
		for (var i = 0; i < 3; i++) {
		    if(response.data.images[i]["url"]) {
				var data = response.data.images[i].url;
				urls.push("https://cn.bing.com" + data);
				getPicture("https://cn.bing.com" + data, "./images/" + i + ".jpg");
			}
		}
		console.log(urls);
	})
	.catch(error => {
		console.error(error); // 处理错误
	});
}

function hourToMillisecondConversion(hour) {
	return hour * 60 * 60 * 1000;
}

var timeout = setInterval(getUrls, hourToMillisecondConversion(1));

getUrls();

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var retData = urls[Math.floor(Math.random() * urls.length)];
  res.end(retData);
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
})

const server = http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type': 'image/jpeg'});
	res.write(fs.readFileSync("./images/" + Math.floor(Math.random() * urls.length) + ".jpg"));
	res.end();
}).listen(3001, () => {
	console.log('Server running at http://localhost:3001/');
})