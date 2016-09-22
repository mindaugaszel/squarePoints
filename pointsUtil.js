function pointsUtil(){
	this.init();
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

module.exports = pointsUtil