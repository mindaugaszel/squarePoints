
"use strict"

var EventEmitter = require('events').EventEmitter
	,fs = require('fs')
	,async = require('async')
	,readline = require('readline')
	,cp = require('child_process')
	//,const numCPUs = require('os').cpus().length;
	;

function calcVectorLengthsParallel(inArray, bufferFilePath, processes){
	var chunkSize = Math.round((inArray.length) / processes)
		,chunkCntr = 0
		,chunkStart = 0
		,chunkEnd = inArray.length
		,i = 0
		,pointsProcessed = 0
		,workers = new Array
		;
var start = new Date().getTime();
console.log(inArray.length);
console.log(chunkSize);
	function getPoints(){
		pointsProcessed++;
		console.log(pointsProcessed)
		return inArray.slice(0,inArray.length-pointsProcessed-1);
	}
		
	for (var i = processes; i > 0; i--) {
		var worker = cp.fork('./prepWorker');	
		workers[i] = worker;
	};
	function handleMessage(task){
		switch(task.type){
			case 'init':
				workers[task.id].send({type:'calc', inArray: getPoints()});
				break;
			case 'calc':
				if(inArray.length>0){
					workers[task.id].send({type:'calc', inArray: getPoints()});
				}else{
					workers[task.id].send({type:'sort', sortFilePath: bufferFilePath+i+'sorted'});
				}
				break;
		}
	}

	for (var i = processes; i > 0; i--) {
		workers[i].on('message', (m)=> {
			//console.log('received %dms', new Date().getTime() - start);
			//console.dir(m);
			handleMessage(m);
		});
	};

	for (var i = processes; i > 0; i--) {		
		workers[i].send({
			type:'init',
			id: i,
			bufferFilePath: bufferFilePath+i
		});

	};
}

function calcVectorLengths(inArray, bufferFilePath){
	var buffer = new Array
		,element = new Array
		,fileEncoding = 'ascii'
		,writeStream = fs.createWriteStream(bufferFilePath, {flags: 'w'})//handle fs errors somehow
		,i = 0
		;

	processNextChunk();

	function processNextChunk(){
		while(element = inArray.pop()){
			buffer = new Array();
			for (i = inArray.length - 1; i >= 0; i--) {
				buffer.push( getDistance(inArray[j][0], element[0], inArray[1], element[1]).toString() +
							' '+ element[0] +' '+ element[1] +' '+ inArray[i][0] +' '+ inArray[i][1]);
			};
			
			if(writeStream.write(buffer.join('\n')+ '\n', fileEncoding)){
				writeStream.once('drain', function(){
					processNextChunk();
				});
				break;
			}
		}

		writeStream.end(buffer.join('\n'), fileEncoding, ()=>{
			writeStream.close();
		});
	}
}

/* parse input file. create coordinates array and JSON for UI.
*/
function handleRawFile (inFilePath, callback){
	var readStream = fs.createReadStream(inFilePath, 'ascii')//TODO: handle non existing files somehow
		,reader = readline.createInterface({input: readStream})
		,coordinates4UI = []
		,coordinates4System = new Array
		,errors = new Array
		,tempObj = new Object
		,lineCntr = 0
		,MAX_ELEMENTS = 10000
		;

	reader.on('line', (lineContent)=>{
		lineCntr++;

		if(lineCntr>MAX_ELEMENTS &&
			lineCntr % 100 == 0 &&
			Object.keys(tempObj).length >= MAX_ELEMENTS)//every 100 lines check size of the tempObject
		{
			errors.push({lineNumber: lineCntr, content: 'number list is too long. Maximum number of points allowed: ' + MAX_ELEMENTS});
			reader.close();
		};
		
		if(lineContent.match(/^-*\d+[ \t]-*\d+$/)){
			tempObj[lineContent] = 0;
		}else{
			errors.push({lineNumber: lineCntr, content: lineContent});
		}
		/*if user is interested in duplicate rows do this slow check
		if (lastTempObjLen == Object.keys(tempObj).length) {
	  		console.log("%d line has duplicate value [%s]%d", lineCntr, lineContent, lastTempObjLen);
		};*/
	});

	reader.once('close', ()=>{
		var parsedCoordinates = []
			;
		for(var key in tempObj){
			parsedCoordinates = /^(-*\d+)[ \t](-*\d+)$/.exec(key);//TODO remove \t
			coordinates4System.push([
				parsedCoordinates[1],//x
				parsedCoordinates[2] //y
			]);
			coordinates4UI.push({
				id: parsedCoordinates.input,
				label: parsedCoordinates.input //TODO: use id for everything
			});
		};

		if(coordinates4System.length != lineCntr){
			errors.push({lineNumber: '', content: 'Found ' + (lineCntr - coordinates4System.length) + ' duplicate value/-s in your file. Would you like to know on which lines they are?'});
		}

		callback(errors, coordinates4System, coordinates4UI);
	})


}


handleRawFile('random.org.1', (er, a, o)=>{
	calcVectorLengthsParallel(a, 'workerOutput', 1)
})