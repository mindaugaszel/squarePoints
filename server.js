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
 //http://stackoverflow.com/questions/28750489/upload-file-component-with-reactjs
 //https://developer.mozilla.org/en/docs/Using_files_from_web_applications
 //http://stackoverflow.com/questions/23691194/node-express-file-upload

const fs = require('fs')
	,http = require('http')
	,WebSocketServer = require('ws').Server
	,express = require('express')
	,bodyParser = require('body-parser')
	,busboy = require('connect-busboy')
	,path = require('path')
	,app = express()
	,httpServer = http.createServer(app)
	;
	
const pUtil = require('./pointsUtil')
	,lUtil = require('./listsUtil')
	,vectorsUtil = require('./vectorsUtil')
	;

var points = new pUtil({maxPointsAllowed:10000, parallelProcesses:3})
	,lists = new lUtil('./data/')
	;


var wss = new WebSocketServer({server: httpServer});

wss.on('connection', function(ws) {

    ws.on('message', function(message) {
    	console.log(message);
    })
});

points.load(lists.getCurrent());//SLOW

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

app.get('/squares', function(req, res) {
	var vectors = new vectorsUtil({parallelProcesses:3});
	var result = new Array;

	vectors.on('eqLengthVectorsFound', (data)=>{
		vectors.findRectangles(data);
	});
	vectors.on('rectangleFound', (data)=>{
		console.log('Rectangle:', data);
		if(vectors.isSquare(data)){
			var square = [];
			for(var key in data){
				square.push(key);
			}
			console.log('and it is a RECTANGLE', square);
			result.push(square);
		}
	})
	vectors.once('finish', ()=>{
		console.log('done', result);
		res.json(result);
	})
	let point = 0
		,parsedCoordinates
		;
	
	var a = points.get();
	var a4Calc = [];
	while(point = a.pop()){
		parsedCoordinates = /^(-*\d+) (-*\d+)$/.exec(point);
		a4Calc.push([ parsedCoordinates[1], parsedCoordinates[2] ]);
	}
	vectors.doEverything(a4Calc);
	//points.calcVectorLengthsParallel();
	
	/*wss.clients.forEach(function (client) {
		client.send('data');
	});*/
	//res.send('OK');//TODO: synchronize sorting in UI
});
app.get('/lists/:label', function(req, res) {
	res.attachment(req.params.label+'.txt');
	res.send(lists.getListPoints(req.params.label).join('\n'));
});

app.get('/points', function(req, res) {
	res.attachment('point list.txt');
	res.send(points.get().join('\n'));
});

app.post('/points', function(req, res) {
	let fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		let path = './tmp/' + filename;
		fstream = fs.createWriteStream(path);
		file.pipe(fstream);
		fstream.on('close', function () {    
			console.log("Upload Finished of " + filename);
			points.loadRawFile(path, function(errors, coordinates4System){
				console.log(errors);
				lists.updateCurrent();
			});
			// should respond somehow res.redirect('back');
			res.end();
		});
	});
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
	points.load(lists.getCurrent());//SLOW
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
	for(let key in lists.getStored()){
		a.push(key);
	}
	res.json(a);
});


httpServer.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});
