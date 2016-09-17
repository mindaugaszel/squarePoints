//based on
// http://stackoverflow.com/questions/5223/length-of-a-javascript-object-that-is-associative-array
// http://stackoverflow.com/questions/840781/easiest-way-to-find-duplicate-values-in-a-javascript-array
// http://stackoverflow.com/questions/2303278/find-if-4-points-on-a-plane-form-a-rectangle
// http://blog.calyptus.eu/seb/2011/01/javascript-call-performance-just-inline-it/
//http://stackoverflow.com/questions/8423493/what-is-the-performance-of-objects-arrays-in-javascript-specifically-for-googl
//http://stackoverflow.com/questions/10415133/hash-keys-values-as-array
//http://stackoverflow.com/questions/34956869/sorting-a-data-stream-before-writing-to-file-in-nodejs
//http://stackoverflow.com/questions/9486683/writing-large-files-with-node-js
//http://stackoverflow.com/questions/7451508/html5-audio-playback-with-fade-in-and-fade-out
//https://www.youtube.com/watch?v=VBlFHuCzPgY&ab_channel=AntoineB
//alternatives:
//calculate vector angle and length between each two points (<10000^2 array)
//sort by length
//sort -k 1,1 -n someFile.txt > sorted.txt
//perpendicular vectors binary search 

var regex = /^(-*\d+)[ \t](-*\d+)$/
var myArray = regex.exec("-200 5000");
var myArray2 = /^(-*\d+)[ \t](-*\d+)$/.exec("300 -20");
var start = new Date().getTime();
var readNValidationEnd,
	duplicateRemovalEnd,
	vectorsEnd;
var fs = require('fs');
var writeStream = fs.createWriteStream('someFile.txt', {flags: 'w'});
var spawn = require('child_process').spawn;
var lastPoints = false;
    

var tempObj = {}
	,lastTempObjLen = tempObj.length
	,lineCntr = 0
	,cleanArray = []
	,validationArray = []
	,smthngLikePlaceholder = 5000
	;

var lineReader = require('readline').createInterface({
	//input: fs.createReadStream('random.txt', 'ascii')
	input: fs.createReadStream('squarePoints/random.org.1', 'ascii')
});

lineReader.on('line', function (lineContent) {
	lineCntr++;
	//lastTempObjLen = Object.keys(tempObj).length;//if user is interested in duplicate rows do this slow check
	//if(validationArray = /^(-*\d+)[ \t](-*\d+)$/.exec(lineContent)){
	if(lineContent.match(/^-*\d+[ \t]-*\d+$/)){
		//tempObj[validationArray[0]] = [validationArray[1], validationArray[2]];
		tempObj[lineContent] = 0;
		//			x y						x 					y
	}else{
		//console.log('found invalid data [%s] on line %d', lineContent, lineCntr);
	}
 
	if(lineCntr>10000){
		lineReader.close();//start checking new array length every 100/1000 lines, maybe we should stop
	};
	/*if user is interested in duplicate rows do this slow check
	if (lastTempObjLen == Object.keys(tempObj).length) {
  		console.log("%d line has duplicate value [%s]%d", lineCntr, lineContent, lastTempObjLen);
	};*/
});

lineReader.on('close', function(){
	var parsedPoint = [];
	readNValidationEnd = new Date().getTime();
	//console.log(tempObj);

	for(var key in tempObj){
		parsedPoint = /^(-*\d+)[ \t](-*\d+)$/.exec(key);
		cleanArray.push([parsedPoint[1], parsedPoint[2]]);
		//cleanArray.push([tempObj[value][0], tempObj[value][1], tempObj[value][2]]);
		//						x y 				x 					y	
	};

	if(cleanArray.length != lineCntr){
		console.log('Found %d duplicate value/-s in your file. Would you like to know on which lines they are?', lineCntr - cleanArray.length);
	};
	
	duplicateRemovalEnd = new Date().getTime();

	delete tempObj;
	
	calVectors();
});

function calVectors(){
	var arrElement = [];
	var j = 0;
	//var dblMEGaAwesomeVectorArray = [];
	var writeSuccess = true;

	while (arrElement = cleanArray.pop()) {//for (var i = cleanArray.length - 1; i >= 0; i--) {//use pop? to reduce RAM usage
		//console.log('whilePop cleanArray.length=%d. %s', cleanArray.length, arrElement.join('_'));
		var dblMEGaAwesomeVectorArray = new Array();	
		//for()
		for (j = cleanArray.length - 1; j >= 0; j--) { //for (var j = cleanArray.length - 1; j >= 0; j--) {	
			//dblMEGaAwesomeVectorArray.push(Math.hypot(cleanArray[j][1] - arrElement[1], cleanArray[j][2] - arrElement[2]));
			dblMEGaAwesomeVectorArray.push( //Math.abs(Math.hypot(cleanArray[j][0] - arrElement[0], cleanArray[j][1] - arrElement[1])).toString()+
											getDistance(cleanArray[j][0], arrElement[0], cleanArray[j][1], arrElement[1]).toString() + 
											' ' + 
											arrElement[0]+ ',' + arrElement[1]+
											' ' + 
											cleanArray[j][0]+','+cleanArray[j][1]);
			//console.log('whileForIn cleanArray.length=%d. %s & %s # %s', cleanArray.length, arrElement.join('_'), cleanArray[j], dblMEGaAwesomeVectorArray[dblMEGaAwesomeVectorArray.length-1].toString() );
		};

		writeSuccess = writeStream.write(dblMEGaAwesomeVectorArray.join('\n')+'\n', 'ascii'); //<-- the place to test
        if(lastPoints){
			//console.log('\n',dblMEGaAwesomeVectorArray.join('\n'));
			console.log(dblMEGaAwesomeVectorArray, writeSuccess);

		}
        if (!writeSuccess){
        	//console.log('pause');
        	writeStream.once('drain', function(){
        	//	console.log('drain');
				calVectors();
			});
           break;
        }
	};
	if(writeSuccess){
		console.log('nomorefor');
		if(dblMEGaAwesomeVectorArray.length>0){
			console.log('leftovers');
			writeStream.end(dblMEGaAwesomeVectorArray.join('\n'), 'ascii', function(){writeStream.close();});//close();
		}else{
			console.log('noLeftovers');
			writeStream.end();
		}
		
	}
}



writeStream.once('close', function(){
	//console.log(dblMEGaAwesomeVectorArray);
	vectorsEnd = new Date().getTime();
	console.log('duplicateRemovalEnd %d', readNValidationEnd - start);
	console.log('duplicateRemovalEnd %d', duplicateRemovalEnd - readNValidationEnd);
	console.log('vectors %d', vectorsEnd - duplicateRemovalEnd);
	console.log('finito %d', vectorsEnd - start);
	/*sort = spawn('sort', ['-k1,1','-n', 'someFile.txt']);//, >nodeSorted.txt'], {cwd:'./'});
	sort.stdout.on('data', function (data) {
    // process data
    data.toString()
        .split('\n')
        .map(line => line.split("\t"))
        .forEach(record => console.info(`Record: ${record}`));
});
    sort.on('exit', function (code) {
    if (code) {
        console.log('handle error ', code);
    }

    console.log('Sort Done +%d', new Date().getTime() - vectorsEnd);
});*/
});
/*
returns angle between two point objects (in radians)
https://gist.github.com/conorbuck/2606166
*/
function getAngle(p2x, p1x, p2y, p1y){
	return Math.abs(Math.atan2(p2y - p1y, p2x - p1x));
}
/*returns distance between two point objects (in cucambers)
thanks to http://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas
*/
function getDistance(p2x, p1x, p2y, p1y){
	if(p1x == -1 && p1y == -1){
		lastPoints = true;
		console.log(p1x, p1y, p2x, p2y);
	}
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y)); //ES2015
	//return Math.sqrt( (p2.x-=p1.x)*p2.x + (p2.y-=p1.y)*p2.y );
}

function findSquares(){
	var totIterations = 0
		,ijSum = {x:0, y:0}
		,ijkSum = {x:0, y:0}
		,cx = 0
		,cy = 0
		;
 console.log(cleanArray.length);
	for(var i = 10000 - 1; i >= 0; i--){
		for (var j = i - 1; j >= 0; j--) {
		/*	ijSum.x = cleanArray[i].x + cleanArray[j].x;
			ijSum.y = cleanArray[i].y + cleanArray[j].y;
			for (var k = j - 1; k >= 0; k--) {
				ijkSum.x = ijSum.x + cleanArray[k].x;
				ijkSum.y = ijSum.y + cleanArray[k].y;
				for (var l = k - 1; l >= 0; l--) {
					cx = ijkSum.x + cleanArray[k].x;
					cy = ijkSum.y + cleanArray[k].y;*/
					totIterations++;
					//isSquareArr(cleanArray[i], cleanArray[j], cleanArray[k], cleanArray[l]);
				//};
			//};
		};
	};
	console.log(totIterations);
}

function isSquareObj(p1, p2, p3, p4){
	var cx = 0
		,cy = 0
		,dd1 = 0
		,dd2 = 0
		,dd3 = 0
		,dd4 = 0
		,result = false
		;

	cx = (p1.x + p2.x + p3.x + p4.x) / 4;
	cy = (p1.y + p2.y + p3.y + p4.y) / 4;

	if( (cx - p1.x)^2 + (cy - p1.y)^2 == 
		(cx - p2.x)^2 + (cy - p2.y)^2 ==
		(cx - p3.x)^2 + (cy - p3.y)^2 ==
		(cx - p4.x)^2 + (cy - p4.y)^2 ){
		 result = true;
	};

	return result;
}

function isSquareArr(p1, p2, p3, p4){
	var cx = 0
		,cy = 0
		,dd1 = 0
		,dd2 = 0
		,dd3 = 0
		,dd4 = 0
		,result = false
		;

	cx = (p1[0] + p2[0] + p3[0] + p4[0]) / 4;
	cy = (p1[1] + p2[1] + p3[1] + p4[1]) / 4;

	if( (cx - p1[0])^2 + (cy - p1[1])^2 == 
		(cx - p2[0])^2 + (cy - p2[1])^2 ==
		(cx - p3[0])^2 + (cy - p3[1])^2 ==
		(cx - p4[0])^2 + (cy - p4[1])^2 ){
		 result = true;
	};

	return result;
}