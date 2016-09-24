"use strict"

const fs = require('fs')
	//,async = require('async')
	,readline = require('readline')
	//,cp = require('child_process')
	;

function pointsUtil(config){
	this.init();
	this.MAX_ELEMENTS = config.maxPointsAllowed; //Add default values
	return this;
}

pointsUtil.prototype.init = function(){
	this.a = new Array();
	this.aAsoc = new Array();
}

pointsUtil.prototype.get = function(){
	return this.a;
}
pointsUtil.prototype.load = function(points){
	let point = 0;
	while(point = points.pop()){
		this.add(point);
	}
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

/* parse input file. create coordinates array and JSON for UI.
*/
pointsUtil.prototype.handleRawFile = function(inFilePath, callback){
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
		
		if(lineContent.match(/^-*\d+[ \t]-*\d+$/)){
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
			this.a.push(parsedCoordinates.input);
		};

		if(coordinates4System.length != lineCntr){
			errors.push({lineNumber: '', content: 'Found ' + (lineCntr - coordinates4System.length) + ' duplicate value/-s in your file. Would you like to know on which lines they are?'});
		}
		//this.a.concat( coordinates4UI);//there might be duplicates .slice(0,this.MAX_ELEMENTS + 1 - this.a.length) );//slice doesn't include "end" index
		console.log(this.a);
		callback(errors, coordinates4System);
	})
}

module.exports = pointsUtil