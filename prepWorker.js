const fs = require('fs')
	,spawn = require('child_process').spawn
	;
var writeStream
	,workerId = 0
	,sortedFd
	;

function calcVectorLengths(inArray, callback){
	var buffer = new Array
		,writeSuccesss = true
		,element = inArray.pop()
		,fileEncoding = 'ascii'		
		,i = 0
		;

	for (i = inArray.length - 1; i >= 0; i--) {
		buffer.push( getDistance(inArray[i][0], element[0], inArray[i][1], element[1]).toString() +
					' '+ element[0] +' '+ element[1] +' '+ inArray[i][0] +' '+ inArray[i][1]);
	};

	writeSuccesss = writeStream.write(buffer.join('\n')+ '\n', fileEncoding)
	if(!writeSuccesss){
		writeStream.once('drain', function(){
			callback();
		});
		//console.log('SLOW');
	}else{
		callback();
	}
}

function getDistance(p2x, p1x, p2y, p1y){
	return Math.abs(Math.hypot(p2x - p1x, p2y - p1y));
}

process.on('message', function(task){
	switch(task.type){
		case 'init':
			workerId = task.id;
			writeStream = fs.createWriteStream(task.bufferFilePath, {flags: 'w'})//handle fs errors somehow
			process.send({type:task.type, id: workerId, result: 'done'});
			break;
		case 'exit':
			process.exit();
			break;
		case 'calc':
			calcVectorLengths(task.inArray, (task)=>{
				process.send({type:'calc', id: workerId, result: 'done'});
			});
			break;
		case 'sort':
			writeStream.end((task)=>{
				sortedFd = fs.openSync('./tmp/sortedOutput'+workerId, 'w');
				sortProcess = spawn('sort', ['-n', '-k1,1', 'tmp/workerOutput'+workerId], {stdio: ['pipe', sortedFd, 'pipe']});
				sortProcess.on('close', (code) => {
				  if (code !== 0) {
				    console.log(`sortProcess process exited with code ${code}`);
				  }else{
				  	fs.unlinkSync('./tmp/workerOutput'+workerId);
				  	console.log('sort done');
				  	process.send({type:'sort', id: workerId, result: 'done'});
				  }
				});

				//process.send({type:task.type, id: workerId, result: 'done'});
			});
			break;
	}
});