"use strict"

const path = require('path')
	,fs = require('fs')
	;

function listsUtil(storageDir){

	this.storageDir = storageDir;
	this.mainConfig = path.format({dir: this.storageDir, base: 'config.json'});
	this.data = new Object;
	this.data.currentList = new Array;
	this.data.storedLists = parseJSONObject(fs.readFileSync(this.mainConfig, {encoding:'utf8'}));
	if(this.allLists === false){
		this.data.storedLists = new Object;
	}
	
	return this;
}

listsUtil.prototype.getStored = function(){
	return this.data.storedLists;
}

listsUtil.prototype.getCurrent = function(){
	return this.data.currentList;
}

listsUtil.prototype.getListPoints = function(label){
	var filePath = path.format({
								dir: this.storageDir,
								base: this.data.storedLists[ label ]
							});
	return parseJSONObject( fs.readFileSync( filePath, {encoding:'utf8'}));
}

listsUtil.prototype.updateCurrent = function(points){
	this.data.currentList = points;
}

listsUtil.prototype.load2Current = function(label){
	var filePath = path.format({
								dir: this.storageDir,
								base: this.data.storedLists[ label ]
							});
	this.data.currentList = parseJSONObject( fs.readFileSync( filePath, {encoding:'utf8'}));
	if(this.data.currentList === false){
		this.data.currentList = new Array;
	}
}

listsUtil.prototype.saveCurrent = function(label){
	if( label in this.data.storedLists ){
		id = this.data.storedLists[label];
	}else{
		id = new Date().getTime();
		this.data.storedLists[label] = id;
	}
	console.log(this.data.currentList);
	fs.writeFileSync(path.format({dir: this.storageDir, base: id}),
					 JSON.stringify(this.data.currentList, null, 2),
					 {encoding:'utf8'});
	
	this.store();
	
}

listsUtil.prototype.delete = function(label){
	var filePath = path.format({
								dir: this.storageDir,
								base: this.data.storedLists[ label ]
							});
	console.log('unlink ', filePath);
	fs.unlinkSync(filePath);
	delete this.data.storedLists[label];
	this.store();
}

listsUtil.prototype.store = function(){
	fs.writeFileSync(this.mainConfig,
					 JSON.stringify(this.data.storedLists, null, 2),
					 {encoding:'utf8'});
}

const parseJSONObject = function( object ) {

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