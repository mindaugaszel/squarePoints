var fs = require('fs')
	;

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
				buffer.push( getDistance(inArray[i][0], element[0], inArray[i][1], element[1]).toString() +
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

function getDistance(p2x, p1x, p2y, p1y){
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y)); //ES2015
	//return Math.sqrt( (p2.x-=p1.x)*p2.x + (p2.y-=p1.y)*p2.y );
}

process.on('message', (task)=>{
	console.log('staring on %s with %d points', task.bufferFilePath, task.inArray.length)
	calcVectorLengths(task.inArray, task.bufferFilePath);
	process.send(task.bufferFilePath+' DONE');
});