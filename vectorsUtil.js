"use strict"

const fs = require('fs')
	,readline = require('readline')
	,cp = require('child_process')
	,EventEmitter = require('events')
	,util = require('util')
	;

class vectorsUtil extends EventEmitter {
	constructor(config) {
		super();

		this.eqLengthVectors = new Array();
		this.processes = config.parallelProcesses;
		this.bufferFilePath = './tmp/workerOutput';//must implement
		var self = this;
	}

	doEverything(inArray){
		var chunkSize = Math.round((inArray.length) / this.processes)
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
			worker.on('message' ,function(m){
				switch(m.type){
					case 'init'://Initialization done, start feeding process
						workers[m.id].send({type:'calc', inArray: getPoints()});
						break;
					case 'calc'://give next chunk
						if(inArray.length>pointsProcessed){
							workers[m.id].send({type:'calc', inArray: getPoints()});
						}else{
							workers[m.id].send({type:'sort'});
						}
						break;
					case 'sort'://thank you and good bye
						workers[m.id].send({type:'exit'});
						mergeBuffers(function(){
							this.loadPoints();
						}.bind(this));
						break;
					default:
						console.log('UNSUPPORTED message');
						process.exit();
				}
			}.bind(this));
			worker.send({ type:'init', id: i, bufferFilePath: this.bufferFilePath+i });
		},this);
		
		function getPoints(){
			pointsProcessed++;
			//console.log('pointsProcessed %d', pointsProcessed);
			return inArray.slice(0,inArray.length-pointsProcessed);//slice doesn't include "end" index...
		}

		function mergeBuffers(cb){
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
					  	cb();
					  }
					});
			}
		};
	}
	
	loadPoints(){
		let waitForRangeEnd = false
			,lineCntr = 0
			,currentVector = new Array
			,lastVector = ['','','','']
			,lineReader = readline.createInterface({input: fs.createReadStream('./tmp/sortedOutput', 'ascii')})
			;
		lineReader.once('close', ()=>{
			this.emit('finish');
		});
		//Read vectors buffer file sorted by length.
		lineReader.on('line', function (lineContent) {
			lineCntr++;
			if( currentVector = /^(\d+.*\d*) (-*\d+ -*\d+) (-*\d+ -*\d+)$/.exec( lineContent ) ){
				if( lastVector[1] == currentVector[1] ){
					waitForRangeEnd = true;
					this.eqLengthVectors.push({ p1 : lastVector[2], p2 : lastVector[3] });//TODO: can consume all memory. Implement another file buffing
				}else if( waitForRangeEnd ){
					waitForRangeEnd = false;
					this.eqLengthVectors.push({ p1 : lastVector[2], p2 : lastVector[3] });

					if(this.eqLengthVectors.length > 3){//TODO easy to add 4-th point recommendation
						//this.emit('eqLengthVectorsFound', this.eqLengthVectors);
						this.findRectangles(this.eqLengthVectors);
					}
					this.eqLengthVectors = new Array();
				}

				lastVector = currentVector;
				
			}
		 
			if(lineCntr>100000000){//TODO: remove 
				lineReader.close();//start checking new array length every 100/1000 lines, maybe we should stop
			};
		}.bind(this));
	}

	findRectangles(vectorArrays){
		//console.log(vectorArrays);
		//TODO: possible memory eating Godzilla, implement "file buffering"
		//console.log('vectorArrays', vectorArrays);
		let connectedVectors = new Array();
		for(let i=vectorArrays.length-1; i>=0; i--){
			for (let j = i - 1; j >= 0; j--) {
				if( this.areVectorsConnected( vectorArrays[i], vectorArrays[j] )){
					connectedVectors.push( this.vectorSumPoints( vectorArrays[i], vectorArrays[j] ));
				}
			};
		}
		//console.log('connectedVectors', connectedVectors);
		if(connectedVectors.length > 2){
			for (let i = connectedVectors.length - 1; i >= 0; i--) {
				for (let j = i - 1; j >= 0; j--) {
					if(this.isRectangle( connectedVectors[i], connectedVectors[j] )){

						let rectanglePoints = new Array;
						rectanglePoints[ connectedVectors[i].p1 ] = 0;
						rectanglePoints[ connectedVectors[i].p2 ] = 0;
						rectanglePoints[ connectedVectors[i].p3 ] = 0;
						rectanglePoints[ connectedVectors[j].p1 ] = 0;
						rectanglePoints[ connectedVectors[j].p2 ] = 0;
						rectanglePoints[ connectedVectors[j].p3 ] = 0;

						this.emit('rectangleFound', rectanglePoints);
						/*if(isSquare(rectanglePoints)){

							console.log('square\n-------------');
							for(var point in rectanglePoints){
								console.log(point);
							};
							console.log('-------------');
						}*/
					};
				};
			};
		};
	}

	areVectorsConnected(v1, v2){
		if( v1.p1 == v2.p1 || v1.p1 == v2.p2 ||
			v1.p2 == v2.p1 || v1.p2 == v2.p1){
			return true;
		}else{
			return false;
		}
	}
	/* Returns an object of 3 points. middle point is an interconnection between two suplied vectors
	 1-st and 3-rd points are "path" start and end points. This is not a real vector sum function, that
	 would return single vector */
	vectorSumPoints(v1,v2){
		var r = new Object
			;
		//TODO: get beer and simplify
		switch(v1.p1){
			case v2.p1:
				r.p1 = v1.p2;
				r.p2 = v1.p1;
				r.p3 = v2.p2;
				break;
			case v2.p2:
				r.p1 = v1.p2;
				r.p2 = v1.p1;
				r.p3 = v2.p1;
				break;
			default:
				switch(v1.p2){
					case v2.p1:
					r.p1 = v1.p1;
					r.p2 = v1.p2;
					r.p3 = v2.p2;
					break;
				case v2.p2:
					r.p1 = v1.p1;
					r.p2 = v1.p2;
					r.p3 = v2.p1;
					break;
				default:
					console.log('somebody will hurt real bad');
				}
		}

		return(r);
		
	}

	isRectangle(v1, v2){
		if( v1.p1 == v2.p1 && v1.p3 == v2.p3 ||
			v1.p1 == v2.p3 && v1.p3 == v2.p1 )
		{
			return true;
		}else{
			return false;
		}
	}

	isSquare(pointList){
		var result = false
			,points = new Array
			,point = new Array
			,cx = 0
			,cy = 0
			,dd1 = 0
			;

		for(point in pointList){
			point = /^(-*\d+) (-*\d+)$/.exec(point);
			points.push({ x: parseInt(point[1]), y: parseInt(point[2]) });
		};

		cx = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
		cy = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;
		dd1 = Math.pow(cx - points[0].x, 2) + Math.pow(cy - points[0].y, 2);

		if( dd1 == Math.pow(cx - points[1].x, 2) + Math.pow(cy - points[1].y, 2) &&
			dd1 == Math.pow(cx - points[2].x, 2) + Math.pow(cy - points[2].y, 2) &&
			dd1 == Math.pow(cx - points[3].x, 2) + Math.pow(cy - points[3].y, 2) )
		{
			 result = true;
		};
		
		return result;
	}
	calcDistances(){
	}

	sortVectors(){
	}

	searchSquares(){
	}

}


module.exports = vectorsUtil;