const { default: axios } = require("axios");
const http = require("http");
const https = require("https");
const fs = require("fs");
const images = require("images");
const sharp = require("sharp");

console.log("Start...");

var urls = [];
var locker = [false, false, false];

fs.mkdirSync("./images", { recursive: true }, (err) => {
	if (err) throw err;
	console.log('The directory was created.');
})

function getPicture(url, path, id) {
	https.get(url, (res) => {
	
		var imgData = "";
		res.setEncoding("binary");  // 下载图片需要设置为 binary, 否则图片会打不开
	
		res.on('data', (chunk) => {
		   imgData+=chunk;
		});
	
		res.on('end', () => {
			fs.writeFileSync(path, imgData, "binary");
			console.log('Downloaded...\n['+path+'] Done...');
			sharp(path).jpeg({quality: 30}).toFile(path + ".y.jpg", function(err) {
				if (err) throw err;
				console.log("Done...");
			})	;
		});
	});
}

function getUrls(){
	console.log("Start updata...");
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

const server = http.createServer((req, res) => {
	if(req.url == "/") {
		res.writeHead(200, {'Content-Type': 'image/jpeg'});
		res.write(fs.readFileSync("./images/" + Math.floor(Math.random() * urls.length) + ".jpg"));
		res.end();
	}else if (req.url == "/ys") {
		res.writeHead(200, {'Content-Type': 'image/jpeg'});
		res.write(fs.readFileSync("./images/" + Math.floor(Math.random() * urls.length) + ".jpg.y.jpg"));
		res.end();
	}else if (req.url == "/text") {
	    res.writeHead(200, {'Content-Type': 'text/plain'});
  		var retData = urls[Math.floor(Math.random() * urls.length)];
  		res.end(retData);
	}
	
}).listen(3001, () => {
	console.log('Server running at http://localhost:3001/');
})