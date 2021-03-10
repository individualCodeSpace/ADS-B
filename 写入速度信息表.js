var request = require('sync-request');

/*setInterval(function()
{	getPlaneData();planeDataList = getPlaneData();
	planeDataList.forEach(function(planeData)
	{
		console.log(`icao`+`:`+planeData.hex +`\n`+ "flight"+`:`+planeData.flight +`\n`+ "lat"+`:`+planeData.lat +`\n`+ "lon"+`:`+planeData.lon +`\n`+ "altitude"+`:`+planeData.altitude +`\n`+ "speed"+`:`+planeData.speed+`\n` + date.toLocaleString( ));
});;},1000);*/
function getPlaneData() {
	var planeDataList = {};
	var resp = request('GET', 'http://127.0.0.1:8080/dump1090/data.json');
	planeDataList = JSON.parse(resp.getBody('utf8'));
	return planeDataList;
}

function initMysqlConnection() {
	let mysql = require("mysql");
	const db_config={
		host:"localhost",
		user:"root",
		password:"9527",
		port:"3306",
		database:"ads_b" 
	}
	let conn=mysql.createConnection(db_config);
	//开始链接数据库
	conn.connect(function(err){
		if(err){
			console.log(`MySQL 连接失败: ${err}!`);
		}else{
			console.log("MySQL 连接成功!");
		}
	});
	return conn
}

function writePlaneDataToMysql(conn, planeDataList) {
	planeDataList.forEach(function(planeData){
		// var icao=planeData.hex,flight=planeData.flight,lat=planeData.lat,lon=planeData.lon,altitude=planeData.altitude,speed=planeData.speed,data=date.toLocaleString();
		var sqlQuery = "REPLACE INTO speed_message SET ?";
		var date=new Date();
		var param = {
						icao: planeData.hex,
						flight: planeData.flight,
						//lat: planeData.lat,
						//lon: planeData.lon,
						//altitude: planeData.altitude,
						speed: planeData.speed,
						rectime: date.toLocaleString()
						//track: planeData.track
		};
		var query = conn.query(sqlQuery, param, function(err, result){
			if(err){
				console.log(`SQL error: ${err}!`);
				console.log("sql statement: ", query.sql);
			}else{
				console.log(query.sql);
				// console.log(result);
			}
		});	
	});
}
function clearexpireddate(conn){
	//var date=new Date();
	var sql= "delete From speed_message where DATE(rectime) < DATE(DATE_SUB(NOW(),INTERVAL 1 MINUTE));"
	var query= conn.query(sql,function(err,result){
		    if(err){
				console.log(`SQL error: ${err}!`);
				console.log("sql statement: ", query.sql);
			}else{
				console.log(query.sql);
				// console.log(result);
			}
		});	
}
function printPlaneDataList(planeDataList) {
	planeDataList.forEach(function(planeData){
		console.log(`icao`+`:`+planeData.hex +`\n`+ "flight"+`:`+planeData.flight +`\n`+ "lat"+`:`+planeData.lat +`\n`+ "lon"+`:`+planeData.lon +`\n`+ "altitude"+`:`+planeData.altitude +`\n`+ "speed"+`:`+planeData.speed+`\n` + date.toLocaleString( ));
	});
}

function mainTask(conn) {
	console.log("获取航班信息中...");
	var planeDataList = getPlaneData();
	// printPlaneDataList(planeDataList);
	console.log("正在写入数据库speed_message表...");
	writePlaneDataToMysql(conn, planeDataList);
	clearexpireddate(conn);
}


//// main

// set update invterval to 30s
var updateInterval = 3000;

// connection MySQL
console.log("正在连接 MySQL...");
var conn = initMysqlConnection();

// start main timer
setInterval(mainTask, updateInterval, conn);

// close connection to MySQL
// conn.end();