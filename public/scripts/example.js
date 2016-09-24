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
var App = React.createClass({
	render: function() {
		return (
			<div>
				<PointsBox url="/api/points" />
				<StoredListsBox url="/api/lists" />
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
												<a href='#' onClick={this.props.onListDelete.bind(null, listLabel)}>Delete</a>
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



var ListsForm = React.createClass({
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

var StoredListsBox = React.createClass({
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
	handleListDelete: function(listItemLabel){
		console.log('handleListDelete.', listItemLabel);
	},
	render: function() {
		return (
			<div>
				<h1>Saved Lists</h1>
				<StoredLists data={this.state.data}  onListDelete={this.handleListDelete}/>
				<ListsForm onListSave={this.handleListSave}/>
			</div>
		);
	}
});


var PointsBox = React.createClass({
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
		var updatedPoints = points.splice(points.indexOf(pointLabel,1));
		this.setState({data: updatedPoints});
		$.ajax({
			url: this.props.url+'/'+pointLabel,
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
		return (
			<div>
				<h1>Comments</h1>
				<PointList data={this.state.data} onPointRemove={this.handleRemovePoint}/>
				<PointForm onPointSubmit={this.handleSubmitPoint} />
				<input type="button" value="Remove All" onClick={this.handleRemoveAllPoints} />
			</div>
		);
	}
});

var PointList = React.createClass({
	render: function() {
		var pointListElements = this.props.data.map(
											function(pointLabel, index) {
												return (
													<li key={index}>
														{pointLabel}
														<a href='#' onClick={this.props.onPointRemove.bind(null, pointLabel)}>Remove</a>
													</li>
												);
											}, this);
		return (
			<ul>
				{ pointListElements }
			</ul>
		);
	}
});

var PointForm = React.createClass({
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
			</form>
		);
	}
});

ReactDOM.render(
	<App/>,
	document.getElementById('content')
);
