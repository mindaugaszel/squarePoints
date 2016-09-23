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
        <CommentBox url="/api/points" pollInterval={2000} />
        <StoredListsBox url="/api/lists" pollInterval={2000} />
      </div>
    );
  }
});

var StoredLists = React.createClass({
  handlePointRemove: function(list){
    console.log(list);
  },
  render: function() {
    console.log(this.props.data);
    var listItems = this.props.data.map(function(listItem) {
      return (
        <StoredList key={listItem} label={listItem} />
      );
    });
    return (
      <ul>
        {listItems}
      </ul>
    );
  }
});

var StoredList = React.createClass({
  handleRemove: function(e) {
    this.props.onPointRemove();
  },
  render: function() {
    return (
      <li>{this.props.label} | {this.props.id}</li>
      
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
    /*for(var i in lists){
      console.log(lists[i], newListLabel, lists[i] == newListLabel)
      if (list[i] == newListLabel){
        return;//TODO: show error somehow
      }
    }*/
    if(lists.indexOf(newListLabel) === -1){
      updatedLists = lists.concat(newListLabel);
    }
    
    this.setState({data: updatedLists});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
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
  render: function() {
    return (
      <div>
        <h1>Saved Lists</h1>
        <StoredLists data={this.state.data} />
        <ListsForm onListSave={this.handleListSave} />
      </div>
    );
  }
});

var Point = React.createClass({
  handleRemove: function(e) {
    this.props.onPointRemove();
  },
  render: function() {
    return (
      <li>{this.props.label}</li>
      
    );
  }
});

var CommentBox = React.createClass({
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
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handlePointSubmit: function(newPointLabel) {
    var points = this.state.data;
    console.log('handlePointSubmit ',newPointLabel);
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
        <PointList data={this.state.data} />
        <PointForm onPointSubmit={this.handlePointSubmit} />
      </div>
    );
  }
});

var PointList = React.createClass({
  handlePointRemove: function(point){
    console.log('jhg');
  },
  render: function() {
    var pointNodes = this.props.data.map(function(point) {
      return (
        <Point key={point} label={point} />
      );
    });
    return (
      <ul>
        {pointNodes}
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
