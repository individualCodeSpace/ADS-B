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
		host:"rm-bp1079kc00vw120ws3o.mysql.rds.aliyuncs.com",
		user:"myaliyun",
		password:"lbl2020@",
		port:"3306",
		database:"adsb" 
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
		var sqlQuery = "REPLACE INTO location_message SET ?";
		var date=new Date();
		var param = {
						icao: planeData.hex,
						flight: planeData.flight,
						lat: planeData.lat,
						lon: planeData.lon,
						altitude: planeData.altitude,
						speed: planeData.speed,
						rectime: date.toLocaleString(),
						rotationAngle:planeData.track
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
function writePlaneDataToMysql1(conn, planeDataList) {
	planeDataList.forEach(function(planeData){
		// var icao=planeData.hex,flight=planeData.flight,lat=planeData.lat,lon=planeData.lon,altitude=planeData.altitude,speed=planeData.speed,data=date.toLocaleString();
		var sqlQuery = "INSERT INTO ads_b_all_message SET ?";
		var date=new Date();
		var param = {
						icao: planeData.hex,
						flight: planeData.flight,
						lat: planeData.lat,
						lon: planeData.lon,
						altitude: planeData.altitude,
						speed: planeData.speed,
						rectime: date.toLocaleString(),
						rotationAngle:planeData.track
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
function clearexpireddate1(conn){
	//var date=new Date();
	var sql= "delete From ads_b_all_message where TIMESTAMPDIFF(SECOND,rectime,NOW())>1800;"
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
function clearexpireddate(conn){
	//var date=new Date();
	var sql= "delete From location_message where TIMESTAMPDIFF(SECOND,rectime,NOW())>30;"
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
	console.log("正在写入数据库...");
	writePlaneDataToMysql(conn, planeDataList);
	 writePlaneDataToMysql1(conn, planeDataList);
	clearexpireddate(conn);
	clearexpireddate1(conn);
}


//// main

// set update invterval to 30s
var updateInterval = 1000;

// connection MySQL
console.log("正在连接 MySQL...");
var conn = initMysqlConnection();

// start main timer
setInterval(mainTask, updateInterval, conn);

// close connection to MySQL
// conn.end();