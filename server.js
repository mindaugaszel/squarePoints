"use strict"
/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 //https://github.com/ctavan/express-validator

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var app = express();
var pUtil = require('./pointsUtil');
var lUtil = require('./listsUtil');

var points = new pUtil();
var lists = new lUtil('./data/');

points.load(lists.getCurrent());

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(busboy());

app.use(function(req, res, next) {
		// Set permissive CORS header - this allows this server to be used only as
		// an API server in conjunction with something like webpack-dev-server.
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Cache-Control', 'no-cache');
		next();
});
app.get('/lists/:label', function(req, res) {
	res.attachment(req.params.label+'.txt');
	res.send(lists.getListPoints(req.params.label).join('\n'));
});
app.get('/points', function(req, res) {
	res.attachment('point list.txt');
	res.send(points.get().join('\n'));//TODO: synchronize sorting in UI
});

app.get('/api/points', function(req, res) {
	res.json(points.get());
});
app.get('/api/points/download', function(req, res) {
	res.json(points.get());//TODO: format to raw/txt format
});
app.delete('/api/points', function(req, res) {//clear all points
	points.init();
	lists.updateCurrent(points.get());
});

app.delete('/api/points/:id', function(req, res) {//delete point by id
	points.remove(req.body.id);
	lists.updateCurrent(points.get());
});

app.post('/api/points', function(req, res) {//Add/Create new point / import points list
	points.add(req.body.label); // change from label to something appropriate
	lists.updateCurrent(points.get());
	res.json(points.get());
});
app.post('/api/points/upload', function(req, res) {//Add/Create new point / import points list
	//http://stackoverflow.com/questions/23691194/node-express-file-upload
});




app.get('/api/lists', function(req, res) {
	var a = [];
	for(let key in lists.getStored()){
		a.push(key);
	}
	res.json(a);
});

app.get('/api/lists/:label', function(req, res) {
	lists.load2Current(req.params.label);
	points.init();
	points.load(lists.getCurrent());
	res.json([]);
	//points.get();
	//res.json(points.get());
});

app.delete('/api/lists/:label', function(req, res) {//delete point by id
	lists.delete(req.params.label);
});

app.post('/api/lists', function(req, res) {
	lists.saveCurrent(req.body.label);
	var a = [];
	for(key in lists.getStored()){
		a.push(key);
	}
	res.json(a);
});

app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});
