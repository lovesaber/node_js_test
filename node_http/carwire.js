var http = require('http');
//var promise = new Promise()
var cheerio = require('cheerio');
var baseUrl = 'http://www.imooc.com/learn/'
var videoIds = [56,637,259,38,197]
//var url = 'http://www.imooc.com/learn/311';

// 加载File System读写模块
var fs = require('fs');
// 加载编码转换模块
var iconv = require('iconv-lite'); 

var file = "E:\\node_projact\\node_http\\a.txt"


function filterChapters(html){
	var $ = cheerio.load(html);

	var chapters = $('.chapter');

	var bigTitle = $('.hd').find('h2').text()
	var learn_num = parseInt(Math.random()*100000)
	
	var courseData = {
		title: bigTitle,
		number: learn_num,
		videos: []
	}
	//file = "E:\\node_projact\\node_http\\" +　bigTitle + ".txt";
	chapters.each(function (item) {
		var chapter = $(this)
		var chapterTitle = chapter.find('strong').text().trim()
			chapterTitle = chapterTitle.split('  ')[0] 
		var videos = chapter.find('.video').children("li")
		var chapterData = {
			chapterTitle: chapterTitle,
			videos: []
		}

		videos.each(function (item) {
			var videoTitle = $(this).find('.J-media-item').text().trim().split('开始学习')[0].trim()
			if (videoTitle.split('(').length>1) {
				videoTitle = videoTitle.split('(')[0].trim() + '(' + videoTitle.split('(')[1]
			}else{
				videoTitle = videoTitle.split('(')[0].trim()
			}
			var id = $(this).attr("data-media-id")

			chapterData.videos.push({
				title: videoTitle,
				id: id
			})
		})

		courseData.videos.push(chapterData)
	})

	return courseData
}

function printCourseInfo(coursesData) {
	var h=''
	coursesData.forEach(function (courseData) {
		h += courseData.number + '人学过' + courseData.title + '\r\n'
		//console.log(courseData.number + '人学过' + courseData.title + '\n')
		courseData.videos.forEach(function (item) {
			var chapterTitle = item.chapterTitle
			h += chapterTitle+'\r\n'
			//console.log(chapterTitle+'\n')

			item.videos.forEach(function (video) {
				h += '【'+video.id+'】'+video.title+'\r\n'
				//console.log('【'+video.id+'】'+video.title+'\n')
			})

			h += '\r\n'
		})
		h += '\r\n'
	})
	//console.log(h)
	writeFile(file,h)
	readFile(file)
}
function getPageAsync(url) {
	return new Promise(function (resolve,reject) {
		console.log("正在爬取"+url);
		http.get(url,function (res) {
			var html = ''

			res.on('data', function(data){
				html += data;
			})

			res.on('end', function (){
				resolve(html)
				// var courseData = filterChapters(html) //过滤初始数据

				// printCourseInfo(courseData)
			})
		}).on('error', function(e){
			reject(e)
			console.log("获取数据出错!")
		})
	})
}

var fetchCoruseArray = []

videoIds.forEach(function (id) {
	fetchCoruseArray.push(getPageAsync(baseUrl + id ))
})
Promise
	.all(fetchCoruseArray)
	.then(function (pages) {
		var courseData = []
		pages.forEach(function (html) {
			var courses = filterChapters(html)
			courseData.push(courses)
		})

		courseData.sort(function (a,b) {
			return a.number < b.number
		})

		printCourseInfo(courseData)
	})

function writeFile(file,str){
	// 把中文转换成字节数组
	var arr = iconv.encode(str, 'gbk');
	console.log(arr);
	
	// appendFile，如果文件不存在，会自动创建新文件
	// 如果用writeFile，那么会删除旧文件，直接写新文件
	fs.appendFile(file, arr, function(err){
		if(err)
			console.log("fail " + err);
		else
			console.log("写入文件ok");
	});
}

function readFile(file){
	fs.readFile(file, function(err, data){
		if(err)
			console.log("读取文件fail " + err);
		else{
			// 读取成功时
			// 输出字节数组
			console.log(data);
			// 把数组转换为gbk中文
			var str = iconv.decode(data, 'gbk');
			console.log(str);
		}
	});
}

