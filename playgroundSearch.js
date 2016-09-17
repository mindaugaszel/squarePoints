//https://forums.adobe.com/thread/653870
//http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
var regex = /^(-*\d+)[ \t](-*\d+)$/;
var start = new Date().getTime();
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

lineReader.on('line', function (lineContent) {
	lineCntr++;//will use for "addPoint"
	
	if(currentVector = /^(\d+.*\d*) (-*\d+,-*\d+) (-*\d+,-*\d+)$/.exec(lineContent)){
		if(lastVector[1] == currentVector[1]){//TODO: only vectors of 2 cucambers in length
			waitForRangeEnd = true;
			//eqLengthVectors.push(lastVector);
			eqLengthVectors.push({ p1 : lastVector[2], p2 : lastVector[3] });
		}else if(waitForRangeEnd){
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

					
					var possibleSquaresArrayLevel3 = [];
					possibleSquaresArrayLevel3[connectedVectors[i].p1] = 0;
					possibleSquaresArrayLevel3[connectedVectors[i].p2] = 0;
					possibleSquaresArrayLevel3[connectedVectors[i].p3] = 0;
					possibleSquaresArrayLevel3[connectedVectors[j].p1] = 0;
					possibleSquaresArrayLevel3[connectedVectors[j].p2] = 0;
					possibleSquaresArrayLevel3[connectedVectors[j].p3] = 0;

					if(isSquare(possibleSquaresArrayLevel3)){
						console.log('holy grail points\n-------------');
						for(var key in possibleSquaresArrayLevel3){
							console.log(key);
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
 would return single vector  */
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

/*	if( v1[2] == v2[2] || v1[2] == v2[3] ||
		v1[3] == v2[2] || v1[3] == v2[2]){*/
	if( v1.p1 == v2.p1 || v1.p1 == v2.p2 ||
		v1.p2 == v2.p1 || v1.p2 == v2.p1){
		//console.log('chkVectorsConnected TRUE\n %s \n %s', v1.p1+'\t'+v1.p2, v2.p1+'\t'+v2.p2);
		//console.log('chkVectorsConnected TRUE\n %s \n %s', v1[2]+'\t'+v1[3], v2[2]+'\t'+v2[3]);
		return true;
	}else{
		//console.log('chkVectorsConnected FALSE\n %s \n %s', v1.p1+'\t'+v1.p2, v2.p1+'\t'+v2.p2);
		return false;
	}
}
function isRectangle(v1, v2){
	//console.log('isRectangle ',v1, v2);
	if( v1.p1 == v2.p1 && v1.p3 == v2.p3 ||
		v1.p1 == v2.p3 && v1.p3 == v2.p1){
		//console.log('chkVectorsConnected TRUE\n %s \n %s', v1.p1+'\t'+v1.p2, v2.p1+'\t'+v2.p2);
		//console.log('chkVectorsConnected TRUE\n %s \n %s', v1[2]+'\t'+v1[3], v2[2]+'\t'+v2[3]);
		return true;
	}else{
		//console.log('chkVectorsConnected FALSE\n %s \n %s', v1.p1+'\t'+v1.p2, v2.p1+'\t'+v2.p2);
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

lineReader.on('close', function(){
	duplicateRemovalEnd = new Date().getTime();
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
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y)); //ES2015
	//return Math.sqrt( (p2.x-=p1.x)*p2.x + (p2.y-=p1.y)*p2.y );
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

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    
    if (!array){// if the other array is a falsy value, return
    	console.log('not an Array');
        return false;
    }
    
    if (this.length != array.length){// compare lengths - can save a lot of time 
    	console.log('length mismatch');
        return false;
    }

    for (var i = 0, l=this.length; i < l; i++) {// Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {// recurse into the nested arrays
            if (!this[i].equals(array[i])){
                return false;       
            }
        }           
        else if (this[i] != array[i]) {// Warning - two different object instances will never be equal: {x:20} != {x:20}
            console.log(this[i], '!=', array[i]);
            return false;   
        }else{
        	console.log(this[i], '==', array[i]);
        }
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});