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

app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/points', function(req, res) {
  res.json(points.get());
});

app.delete('/api/points', function(req, res) {//clear all points
  points.init();
});

app.delete('/api/points/:id', function(req, res) {//delete point by id
  points.remove(req.body.id);
  lists.updateCurrent(points.get());
});

app.post('/api/points', function(req, res) {//Add/Create new point / import points list
  points.add(req.body.label); // change from label to something appropriate
});





app.get('/api/lists', function(req, res) {
  res.json(lists.getSaved());
});

app.get('/api/lists/:label', function(req, res) {
  res.json(lists.getSaved());
});

app.delete('/api/lists/:label', function(req, res) {//delete point by id
  lists.delete(req.body.label);
});

app.post('/api/lists', function(req, res) {//Add/Create new point / import points list
  lists.saveCurrent(req.body.label);
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
