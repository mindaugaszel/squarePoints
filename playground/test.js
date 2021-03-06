var points = require('./pointsUtil');
//var currentPoints = new points();
var lists = require('./listsUtil');
//var PointLists = new lists('./data/');
var vectorsUtil = require('./vectorsUtil');

var vectors = new vectorsUtil({parallelProcesses:3});
vectors.once('eqLengthVectorsFound', (data)=>{
	//console.log('eqLenVectors', data);
	vectors.findRectangles(data);
})

vectors.on('rectangleFound', (data)=>{
	console.log('Rectangle:', data);
	if(vectors.isSquare(data)){
		console.log('and it is a RECTANGLE', data);
	}
})
vectors.loadPoints();

/*
currentPoints.add('-1 1');
console.log(currentPoints.add('-1 -1'));
console.log(currentPoints.add('-1 -1'));
//console.dir(currentPoints.get());

//PointLists.updateCurrent(currentPoints.get());
//PointLists.saveCurrent('First List with wrong characšįėęč');
console.log('getSavedLists:', PointLists.getSaved());
PointLists.load2Current('First List with wrong characšįėęč');
console.log('getCurrentListPoints',PointLists.getCurrent());
currentPoints.load(PointLists.getCurrent());
currentPoints.add('2 -2');
currentPoints.add('2 2');
console.log('CurrentPoints.get',currentPoints.get());

PointLists.updateCurrent(currentPoints.get());

currentPoints.add('-2 -2');
PointLists.updateCurrent(currentPoints.get());
PointLists.saveCurrent('Second List with wrong characšįėęč');*/
//PointLists.store();