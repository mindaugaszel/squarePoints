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
 http://andrewhfarmer.com/component-communication/
 https://facebook.github.io/react/tips/expose-component-functions.html
 https://zbyte64.github.io/reactjs-crashcourse/lesson2.html
 */

var App = React.createClass({
	//var pointsBoxRef;
	handleStoredListLoad: function(){
		console.log('App got request to reload current points');
		this.pointsBox.loadCurrentPoints();
	},
	render: function() {
		const style = {
			width: '900px',
			display: 'table'
		};
		return (
			<div style={style}>
				<StoredListsContainer url="/api/lists" onStoredListLoad={this.handleStoredListLoad}/>
				<PointsContainer url="/api/points" ref={reference => this.pointsBox = reference}/>
				<SquaresContainer />
			</div>
		);
	}
});

var StoredListsContainer = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadStoredLists();
	},
	loadStoredLists: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			tiemeout: 1000,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleListSave: function(newListLabel){
		var lists = this.state.data;
		var updatedLists = lists;
		console.log('handleListSave ',newListLabel);
		if(lists.indexOf(newListLabel) === -1){
			updatedLists = lists.concat(newListLabel);
		}
		
		this.setState({data: updatedLists});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			tiemeout: 1000,
			data: {label: newListLabel},
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: lists});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleListDelete: function(listLabel){
		console.log('pls delete list: ', listLabel);
		var lists = this.state.data;
		var listsBackup = lists;

		lists.splice(lists.indexOf(listLabel),1);
		this.setState({data: lists});
		$.ajax({
			url: this.props.url+'/'+listLabel, //TODO: there must be better way
			dataType: 'json',
			type: 'DELETE',
			tiemeout: 1000,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: listsBackup});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleListLoad: function(listLabel){
		console.log('pls load list: ', listLabel);
		$.ajax({
			url: this.props.url+'/'+listLabel, //TODO: there must be better way
			dataType: 'json',
			type: 'GET',
			tiemeout: 1000,
			success: function(data) {
				this.props.onStoredListLoad(); // signal app to reload current points
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		const style = {
			display: 'table-cell',
			width: '300px'
		};
		return (
			<div style={style}>
				<h2>Stored Lists</h2>
				<StoredLists data={this.state.data} onListDelete={this.handleListDelete} onListLoad={this.handleListLoad}/>
				<StoreListForm onListSave={this.handleListSave}/>
			</div>
		);
	}
});

var StoredLists = React.createClass({
	render: function() {
		var listElements = this.props.data.map(
									function(listLabel, index) {
										return (
											<li key={index}>
												{listLabel}
												<a href='#' onClick={this.props.onListDelete.bind(null, listLabel)}> Delete</a>
												<a href='#' onClick={this.props.onListLoad.bind(null, listLabel)}> Load</a>
												<a href={'lists/' + listLabel}> Download</a>
											</li>
										);
									}, this);
		return (
			<ul>
				{ listElements }
			</ul>
		);
	}
});

var StoreListForm = React.createClass({
	getInitialState: function() {
		return {label: ''};
	},
	handleLabelChange: function(e) {
		this.setState({label: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		console.log(this.state.label.trim());
		this.props.onListSave(this.state.label.trim());
		this.setState({label: ''}); //TODO change to default state
	},
	render: function() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="Label for the current point list"
					value={this.state.label}
					onChange={this.handleLabelChange}
				/>
				<input type="submit" value="Save" onSubmit={this.handleSubmit}/>
			</form>
		);
	}
});

var PointsContainer = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadCurrentPoints();
	},
	loadCurrentPoints: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			tiemeout: 1000,
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleRemoveAllPoints: function(){
		var points = this.state.data;
		this.setState({data: []}); //TODO: set to default state or smthng
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'DELETE',
			tiemeout: 1000,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: points});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleRemovePoint:function(pointLabel){
		console.log('pls remove point: ', pointLabel);
		var points = this.state.data;
		var pointsBackup = points;

		points.splice(points.indexOf(pointLabel),1);
		this.setState({data: points});
		$.ajax({
			url: this.props.url+'/'+pointLabel, //TODO: there must be better way
			dataType: 'json',
			type: 'DELETE',
			tiemeout: 1000,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: pointsBackup});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleSubmitPoint: function(newPointLabel) {
		var points = this.state.data;
		console.log('handleSubmitPoint ',newPointLabel);
		for(var point in points){
			if (point == newPointLabel){
				return;//TODO: show error somehow
			}
		}
		var updatedPoints = points.concat([newPointLabel]);
		this.setState({data: updatedPoints});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			tiemeout: 1000,
			data: {label: newPointLabel},
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				this.setState({data: points});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		const style = {
			display: 'table-cell',
			width: '300px'
		}
		return (
			<div style={style}>
				<h2>Current Points</h2>
				<PointList data={this.state.data} onPointRemove={this.handleRemovePoint}/>
				<PointsForm onPointSubmit={this.handleSubmitPoint} />
				<a href='#' onClick={this.handleRemoveAllPoints}>Remove All </a>
				<a href='points/'> Download All</a>
			</div>
		);
	}
});

var PointList = React.createClass({
	render: function() {
		console.log('pointsList render')
		var pointListElements = this.props.data.map(
											function(pointLabel, index) {
												return (
													<li key={index}>
														{pointLabel}
														<a href='#' onClick={this.props.onPointRemove.bind(null, pointLabel)}> Remove</a>
													</li>
												);
											}, this);
		return (
			<div>
				<h3>Points in List: {this.props.data.length}
					<a>⇧</a>
					<a>⇩</a>
				</h3>
				<ul>
					{ pointListElements }
				</ul>
			</div>
		);
	}
});

var PointsForm = React.createClass({
	getInitialState: function() {
		return {X: '', Y: ''};
	},
	handleXChange: function(e) {
		this.setState({X: e.target.value});
	},
	handleYChange: function(e) {
		this.setState({Y: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var X = this.state.X.trim();
		var Y = this.state.Y.trim();
		console.log(X,Y);
		if (!X || !Y) {
			return;
		}
		var label = X + ' ' + Y;

		this.props.onPointSubmit(label);
		this.setState({X: '', Y: ''});
	},
	handleUpload: function(e) {
		console.log('upload');
		var fd = new FormData();    
      fd.append('file', this.fileInput.files[0]);
		//console.dir(this.fileInput);
		$.ajax({
            url: 'points',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                console.log(data);
            } 
        });
        e.preventDefault()
	},
	render: function() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="X:"
					value={this.state.X}
					onChange={this.handleXChange}
				/>
				<input
					type="text"
					placeholder="Y:"
					value={this.state.Y}
					onChange={this.handleYChange}
				/>
				<input type="submit" value="Add" onSubmit={this.handleSubmit}/>
				<input type="file" onChange={this.handleUpload} ref={reference => this.fileInput = reference}/>
			</form>
		);
	}
});

var SquaresContainer = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	loadsquares: function() {
		console.log('someone would like to find squares');
		var ws = new WebSocket('ws://localhost:8080/events')//should be global?
		console.dir(ws);
		ws.onopen = function(){
             connection.send("Ping");
        };
 
        ws.onerror = function(error){
            console.log(error);
        };
        
        ws.onmessage = function(e){
             console.log("From server: " + e.data);
        };
	},
	render: function() {
		const style = {
			display: 'table-cell',
			width: '300px'
		};
		return (
			<div style={style}>
				<h2>Squares</h2>
				<h3>Squares in list: : {this.state.data.length} </h3>
				<a href="#" onClick={this.loadsquares}> Find Squares </a>
				<SquareList data={this.state.data}/>
			</div>
		);
	}
});

var SquareList = React.createClass({
	render: function() {
		var squareListElements = this.props.data.map(
											function(square, index) {
												return (
													<Square id={square.id} data={square.points} key={index}/>
												);
											},this);
		return (
			<div>
				<ul>
					{ squareListElements }
				</ul>
			</div>
		);
	}
});

var Square = React.createClass({
	render: function() {
		var pointListElements = this.props.data.map(
											function(pointLabel, index) {
												return (
													<li key={index}>{pointLabel}</li>
												);
											});
		return (
			<div>
				<span>this.props.id</span>
				<ul>
					{ pointListElements }
				</ul>
			</div>
		);
	}
});

ReactDOM.render(
	<App/>,
	document.getElementById('content')
);
