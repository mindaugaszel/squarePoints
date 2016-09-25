"use strict"

const fs = require('fs')
	//,async = require('async')
	,readline = require('readline')
	,cp = require('child_process')
	;

function pointsUtil(config){
	this.init();
	this.MAX_ELEMENTS = config.maxPointsAllowed; //Add default values
	this.processes = config.parallelProcesses;
	this.bufferFilePath = './tmp/workerOutput';
	return this;
}

pointsUtil.prototype.init = function(){
	this.a = new Array();
	this.aAsoc = new Array();
	this.a4Calc = new Array();
}

pointsUtil.prototype.get = function(){
	return this.a;
}
pointsUtil.prototype.add = function(point){
	var result = false;

	this.aAsoc[point] = 0;
	if(Object.keys(this.aAsoc).length - 1 == this.a.length){
		this.a.push(point);
		result = true;
	}
	return result;
}
pointsUtil.prototype.remove = function(point){
	this.a.splice( this.a.indexOf(point), 1 );
	delete this.aAsoc[point];
}
pointsUtil.prototype.load = function(points){
	let point = 0
		,parsedCoordinates
		;
	
	this.a = points.slice(0);
	while(point = points.pop()){
		this.aAsoc[point] = 0;
		parsedCoordinates = /^(-*\d+) (-*\d+)$/.exec(point);
		this.a4Calc.push([ parsedCoordinates[1], parsedCoordinates[2] ]);
		
	}
	if(Object.keys(this.aAsoc).length != this.a.length ||
		this.a.length != this.a4Calc.length ||
		Object.keys(this.aAsoc).length != this.a.length){ //TODO: siplify
		console.log('ERRORORORORROOROR');
		console.log('aAsoc.length: %d, a.length: %d, a4Calc.length: %d',
							Object.keys(this.aAsoc).length,
							this.a.length,
							this.a4Calc.length);
	}
}
pointsUtil.prototype.loadRawFile = function(inFilePath, callback){
	var readStream = fs.createReadStream(inFilePath, 'ascii')//TODO: handle non existing files somehow
		,reader = readline.createInterface({input: readStream})
		,coordinates4UI = []
		,coordinates4System = new Array
		,errors = new Array
		,tempObj = new Object
		,lineCntr = 0
		,elementsMax = this.MAX_ELEMENTS - this.a.length;
		;

	reader.on('line', (lineContent)=>{
		lineCntr++;

		if(lineCntr>elementsMax &&
			lineCntr % 100 == 0 &&
			Object.keys(tempObj).length >= this.MAX_ELEMENTS)//every 100 lines check size of the tempObject
		{
			errors.push({lineNumber: lineCntr, content: 'number list is too long. Maximum number of points allowed: ' + MAX_ELEMENTS});
			reader.close();
		};
		
		if(lineContent.match(/^-*\d+[ \t]-*\d+$/)){//TODO: \t != ' '
			this.aAsoc[lineContent] = 0;
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
		this.a = new Array;
		for(var key in this.aAsoc){
			parsedCoordinates = /^(-*\d+)[ \t](-*\d+)$/.exec(key);//TODO remove \t
			coordinates4System.push([
				parsedCoordinates[1],//x
				parsedCoordinates[2] //y
			]);
			this.a.push(parsedCoordinates[1] + ' ' + parsedCoordinates[2]);
		};

		if(coordinates4System.length != lineCntr){
			errors.push({lineNumber: '', content: 'Found ' + (lineCntr - coordinates4System.length) + ' duplicate value/-s in your file. Would you like to know on which lines they are?'});
		}
		//this.a.concat( coordinates4UI);//there might be duplicates .slice(0,this.MAX_ELEMENTS + 1 - this.a.length) );//slice doesn't include "end" index
		fs.unlinkSync(inFilePath);
		this.a4Calc = coordinates4System;
		
		callback(errors);
	})
}
pointsUtil.prototype.calcVectorLengthsParallel = function(){
	var inArray = this.a4Calc
		,chunkSize = Math.round((inArray.length) / this.processes)
		,chunkCntr = 0
		,chunkStart = 0
		,chunkEnd = inArray.length
		,i = 0
		,pointsProcessed = -1 ////slice doesn't include "end" index...
		,workers = new Array
		,workersDone = 0;
		;
	
	var start = new Date().getTime();	
		
	for (var i = this.processes-1; i >= 0; i--) {
		var worker = cp.fork('./prepWorker');	
		workers[i] = worker;
	};
	
	workers.map(function( worker, i ){
		worker.on('message' ,(m)=>{handleMessage(m)});
		worker.send({ type:'init', id: i, bufferFilePath: this.bufferFilePath+i });
	},this);
	
	function getPoints(){
		pointsProcessed++;
		console.log('pointsProcessed %d', pointsProcessed);
		return inArray.slice(0,inArray.length-pointsProcessed);//slice doesn't include "end" index...
	}

	function handleMessage(task){
		switch(task.type){
			case 'init'://Initialization done, start feeding process
				workers[task.id].send({type:'calc', inArray: getPoints()});
				break;
			case 'calc'://give next chunk
				if(inArray.length>pointsProcessed){
					workers[task.id].send({type:'calc', inArray: getPoints()});
				}else{
					workers[task.id].send({type:'sort'});
				}
				break;
			case 'sort'://thank you and good bye
				workers[task.id].send({type:'exit'});
				mergeBuffers();
				break;
			default:
				console.log('UNSUPPORTED message');
				process.exit();
		}
	}
	function mergeBuffers(){
		workersDone++;
		if(workersDone == workers.length){
			console.log('sort done good to go');	
			let mergedFd = fs.openSync('./tmp/sortedOutput', 'w');
			let mergeProc = cp.spawn('sort', ['-m', '-n', '-k1,1', 'tmp/sortedOutput0', 'tmp/sortedOutput1', 'tmp/sortedOutput2'], {stdio: ['pipe', mergedFd, 'pipe']});
			mergeProc.on('close', (code) => {
				  if (code !== 0) {
				    console.log(`mergeProc process exited with code ${code}`);
				  }else{
				  	fs.unlinkSync('tmp/sortedOutput0');
				  	fs.unlinkSync('tmp/sortedOutput1');
				  	fs.unlinkSync('tmp/sortedOutput2');
				  	console.log('mergeProc done. total time elapsed: %d', new Date().getTime() - start);
				  }
				});
		}
	}
}

module.exports = pointsUtil