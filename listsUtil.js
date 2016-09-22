const path = require('path')
	,fs = require('fs')
	;

function listsUtil(storageDir){

	this.storageDir = storageDir;
	this.mainConfig = path.format({dir: this.storageDir, base: 'config.json'});
	this.data = new Object;
	this.data.currentList = new Array;
	this.data.savedLists = parseJSONObject(fs.readFileSync(this.mainConfig, {encoding:'utf8'}));
	if(this.allLists === false){
		this.data.savedLists = new Object;
	}
	
	return this;
}

listsUtil.prototype.getSaved = function(){
	return this.data.savedLists;
}

listsUtil.prototype.getCurrent = function(){
	return this.data.currentList;
}

listsUtil.prototype.updateCurrent = function(points){
	this.data.currentList = points;
}

listsUtil.prototype.load2Current = function(label){
	var filePath = path.format({
								dir: this.storageDir,
								base: this.data.savedLists[ label ]
							});
	this.data.currentList = parseJSONObject( fs.readFileSync( filePath, {encoding:'utf8'}));
	if(this.data.currentList === false){
		this.data.currentList = new Array;
	}
}

listsUtil.prototype.saveCurrent = function(label){
	if( label in this.data.savedLists ){
		id = this.data.savedLists[label];
	}else{
		id = new Date().getTime();
		this.data.savedLists[label] = id;
	}
	
	fs.writeFileSync(path.format({dir: this.storageDir, base: id}),
					 JSON.stringify(this.data.currentList, null, 2),
					 {encoding:'utf8'});
	
	this.store();
	
}

listsUtil.prototype.dumpCurrent = function(){
	this.data.currentList = new Array;
}

listsUtil.prototype.delete = function(label){
	var filePath = path.format({
								dir: this.storageDir,
								base: this.data.savedLists[ label ]
							});
	fs.unlinkSync(filePath);
	delete this.data.savedLists[label];
	this.store();
}

listsUtil.prototype.store = function(){
	fs.writeFileSync(this.mainConfig,
					 JSON.stringify(this.data.savedLists, null, 2),
					 {encoding:'utf8'});
}

parseJSONObject = function( object ) {

	try {
		return JSON.parse( object );
	} catch( ex ) {
		return false;
	}

}
var base64 = exports;
base64.encode = function (unencoded) {
  return new Buffer(unencoded || '').toString('base64');
};

base64.decode = function (encoded) {
  return new Buffer(encoded || '', 'base64').toString('utf8');
};

module.exports = listsUtil