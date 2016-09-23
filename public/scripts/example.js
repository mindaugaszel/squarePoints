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

var StoredLists = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  render: function() {
    return (
      <li>{this.props.label} | {this.props.id}</li>
      
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
  handlePointSubmit: function(newPoint) {
    var points = this.state.data;
    for(var point in points){
      console.dir(points[point]);
      if (points[point].label == newPoint.label){
        return;//TODO: show error somehow
      }
    }
    newPoint.id = newPoint.label;
    var updatedPoints = points.concat([newPoint]);
    this.setState({data: updatedPoints});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: newPoint,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: points});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCurrentPoints();
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
      <ul className="pointList">
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
    if (!X || !Y) {
      return;
    }
    var label = X + ' ' + Y;

    this.props.onPointSubmit({label: label});
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
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
  <CommentBox url="/api/points" pollInterval={2000} />,
  document.getElementById('content')
);
