var fs = require('fs')
	,writeStream = {}
	,workerId = 0;
	;

function calcVectorLengths(inArray, callback){
	var buffer = new Array
		,element = inArray.pop()
		,fileEncoding = 'ascii'		
		,i = 0
		;

	for (i = inArray.length - 1; i >= 0; i--) {
		buffer.push( getDistance(inArray[i][0], element[0], inArray[i][1], element[1]).toString() +
					' '+ element[0] +' '+ element[1] +' '+ inArray[i][0] +' '+ inArray[i][1]);
	};
	
	if(writeStream.write(buffer.join('\n')+ '\n', fileEncoding)){
		writeStream.once('drain', function(callback){
			callback();
		});
	}else{
		callback();
	}
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
			//writeStream.close();
		});
	}
}

function getDistance(p2x, p1x, p2y, p1y){
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y));
}

process.on('message', (task)=>{
	switch(task.type){
		case 'init':
			workerId = task.id;
			writeStream = fs.createWriteStream(task.bufferFilePath, {flags: 'w'})//handle fs errors somehow
			process.send({type:task.type, id: workerId, result: 'done'});
			break;
		case 'calc':
			//console.log('staring with %d points', task.inArray.length)
			calcVectorLengths(task.inArray, (task)=>{
				process.send({type:'calc', id: workerId, result: 'done'});
			});
			break;
		case 'sort':
			writeStream.end((task)=>{
				process.send({type:task.type, id: workerId, result: 'done'});
			});
			break;
	}
});