//https://forums.adobe.com/thread/653870
//http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
var regex = /^(-*\d+)[ \t](-*\d+)$/;
var lastVector = ['','','','',index=0, input=''];
var currentVector = [];
var waitForRangeEnd = false;
var fs = require('fs');
    

var lineCntr = 0
	,eqLengthVectors = []
	;

var lineReader = require('readline').createInterface({
	input: fs.createReadStream('sorted.txt', 'ascii')
	//input: fs.createReadStream('squarePoints/random.org.1', 'ascii')
});

lineReader.on('close', function(){
	duplicateRemovalEnd = new Date().getTime();
});

lineReader.on('line', function (lineContent) {
	lineCntr++;//will use for "addPoint"
	
	if( currentVector = /^(\d+.*\d*) (-*\d+,-*\d+) (-*\d+,-*\d+)$/.exec( lineContent ) ){
		if( lastVector[1] == currentVector[1] ){//TODO: only vectors of 2 cucambers in length
			waitForRangeEnd = true;
			eqLengthVectors.push({ p1 : lastVector[2], p2 : lastVector[3] });
		}else if( waitForRangeEnd ){
			waitForRangeEnd = false;
			eqLengthVectors.push({ p1 : lastVector[2], p2 : lastVector[3] });

			if(eqLengthVectors.length > 3){//TODO easy to add 4-th point recommendation
				searchConnectedVectors( eqLengthVectors );//Add to the queue
			}
			eqLengthVectors = new Array();
		}
		lastVector = currentVector;
	}
 
	if(lineCntr>100000000){//TODO: remove 
		lineReader.close();//start checking new array length every 100/1000 lines, maybe we should stop
	};
});

function searchConnectedVectors (vectorArrays){
	//console.log(vectorArrays);
	//TODO: possible memory eating Godzilla, implement "file buffering"
	var connectedVectors = new Array();
	for(var i=vectorArrays.length-1; i>=0; i--){
		for (var j = i - 1; j >= 0; j--) {
			if( areVectorsConnected( vectorArrays[i], vectorArrays[j] ) ){
				connectedVectors.push( vectorSumPoints( vectorArrays[i], vectorArrays[j] ) );
			}
		};
	}
	if(connectedVectors.length > 2){
		for (var i = connectedVectors.length - 1; i >= 0; i--) {
			for (var j = i - 1; j >= 0; j--) {
				if(isRectangle( connectedVectors[i], connectedVectors[j] )){

					
					var rectanglePoints = [];
					rectanglePoints[ connectedVectors[i].p1 ] = 0;
					rectanglePoints[ connectedVectors[i].p2 ] = 0;
					rectanglePoints[ connectedVectors[i].p3 ] = 0;
					rectanglePoints[ connectedVectors[j].p1 ] = 0;
					rectanglePoints[ connectedVectors[j].p2 ] = 0;
					rectanglePoints[ connectedVectors[j].p3 ] = 0;

					if(isSquare(rectanglePoints)){

						console.log('holy grail points\n-------------');
						for(var point in rectanglePoints){
							console.log(point);
						};
						console.log('-------------');
					}
				};
			};
		};
	};
}
 /* Returns an array of 3 points. middle point is an interconnection between two suplied vectors
 1-st and 3-rd point are "path" start and end points. This is not a real vector sum function, that
 would return single vector */
function vectorSumPoints(v1,v2){
	var r = new Object
		;
	//TODO: get beer and simplify
	if(v1.p1 == v2.p1){
		r.p1 = v1.p2;
		r.p2 = v1.p1;
		r.p3 = v2.p2;
	}else if(v1.p2 == v2.p2){	
		r.p1 = v1.p1;
		r.p2 = v1.p2;
		r.p3 = v2.p1;
	}else if(v1.p1 == v2.p1){
		r.p1 = v1.p2;
		r.p2 = v2.p1;
		r.p3 = v1.p1;
	}else{
		r.p1 = v1.p2;
		r.p2 = v1.p1;
		r.p3 = v2.p1;
	}

	return(r);
	
}

function areVectorsConnected(v1, v2){
	if( v1.p1 == v2.p1 || v1.p1 == v2.p2 ||
		v1.p2 == v2.p1 || v1.p2 == v2.p1){
		return true;
	}else{
		return false;
	}
}

function isRectangle(v1, v2){
	if( v1.p1 == v2.p1 && v1.p3 == v2.p3 ||
		v1.p1 == v2.p3 && v1.p3 == v2.p1 )
	{
		return true;
	}else{
		return false;
	}
}

function isSquare(pointList){
	var result = false
		,points = new Array
		,point = new Array
		,cx = 0
		,cy = 0
		,dd1 = 0
		;

	for(point in pointList){
		point = /^(-*\d+),(-*\d+)$/.exec(point);
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

/* returns angle between two point objects (in radians)
https://gist.github.com/conorbuck/2606166 */
function getAngle(p2x, p1x, p2y, p1y){
	return Math.abs(Math.atan2(p2y - p1y, p2x - p1x));
}

/* returns distance between two point objects (in cucambers)
thanks to http://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas */
function getDistance(p2x, p1x, p2y, p1y){
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y)); //ES2015
	//return Math.sqrt( (p2.x-=p1.x)*p2.x + (p2.y-=p1.y)*p2.y );
}