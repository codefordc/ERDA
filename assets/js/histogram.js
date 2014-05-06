/*
Histogram of response times.
*/
function histogram() {
  // defaults
  var parent = undefined;
  var data = [];
  var binnedData = [];
  var maxTime;
  var margin = {
    top: 20,
    bottom: 40,
    left: 70,
    right: 40
  };
  var x, y; // D3 scales

  // The object that will be returned.
  var chart = {};

  function width() {
    return parent.node().clientWidth - margin.left - margin.right;
  }

  function height() {
    return parent.node().clientHeight - margin.top - margin.bottom;
  }

  // Rounds durations up to the nearest multiple of 10 minutes.
  function roundDuration(ms) {
    var tenMinutes = 10*60;
    return Math.ceil(ms/tenMinutes)*tenMinutes;
  }

  function xTicks(numTicks) {
    var xMax = x.domain()[1];
    var ticks = [];
    var tickInterval = xMax/numTicks;
    for (var i = 0; i <= numTicks; i++) {
      ticks.push(i*tickInterval);
    }
    return ticks;
  }

  function renderLayers() {
    var bg = parent.selectAll('g.bg-layer')
      .data([1]);
    bg.enter()
      .append('g')
      .attr('class', 'bg-layer');
    bg.attr('transform', 'translate(' +
      margin.left + ',' + margin.top + ')');

    var dataLayer = parent.selectAll('g.data-layer')
      .data([1]);
    dataLayer.enter()
      .append('g')
      .attr('class', 'data-layer');
    dataLayer.attr('transform', 'translate(' +
      margin.left + ',' + margin.top + ')');

    var axesLayer = parent.selectAll('g.axes-layer')
      .data([1]);
    axesLayer.enter()
      .append('g')
      .attr('class', 'axes-layer');
    axesLayer.attr('transform', 'translate(' +
      margin.left + ',' + margin.top + ')');
  }

  function renderAxes() {
    var axesLayer = parent.selectAll("g.axes-layer");
    var format = d3.time.format("%M");

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickValues(xTicks(5))
      .tickFormat(function(d) {
        return Math.floor(d/60);
      });
    var yAxis = d3.svg.axis()
      .scale(y)
      .tickValues([0,y.domain()[1]])
      .orient("left");

    var xgs = axesLayer.selectAll("g.axis.x-axis")
        .data([1]);
    xgs.enter()
      .append("g")
      .attr("class", "axis x-axis")
      .append("text")
      .attr("class", "axis x-label");
    xgs.attr("transform", "translate(0," + height() + ")")
      .call(xAxis);

    var ygs = axesLayer.selectAll("g.axis.y-axis")
      .data([1]);
    ygs.enter()
      .append("g")
      .attr("class", "axis y-axis")
      .append("text")
      .attr("class", "axis y-label");
    ygs.call(yAxis);
  }

  function renderData() {
    var dataLayer = parent.selectAll('g.data-layer');
    var bars = dataLayer.selectAll('g.bar')
      .data(binnedData);
    var barsEnter = bars.enter().append('g')
      .attr('class', 'bar');
    bars
      .attr('transform', function(d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
    barsEnter.append('rect');
    bars.selectAll('rect')
      .attr('x', 1)
      .attr('width', x(binnedData[0].dx) - 1)
      .attr('height', function(d) {
        return height() - y(d.y);
      });
  }

  function renderViz() {
    var newHeight = parent.node().clientWidth*0.67;
    parent.style('height', newHeight);
    parent.style("visibility", "visible");
    
    var xMax = roundDuration(d3.max(data));
    x = d3.scale.linear()
      .domain([0, xMax])
      .range([0, width()]);
    y = d3.scale.linear()
      .range([height(), 0]);

    var hist = d3.layout.histogram()
      .bins(xTicks(xMax/60));
    binnedData = hist(data);
    
    y.domain([0, d3.max(binnedData, function(d) {
      return d.y;
    })]);

    renderLayers();
    renderAxes();
    renderData();
  }

  // interface functions

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;

    return chart;
  };

  chart.parent = function(value) {
    if (!arguments.length) return parent;
    parent = value;

    return chart;
  };

  // render the chart
  chart.render = function() {
    renderViz();
    d3.select(window).on('resize.histogram', function() {
      renderViz();
    });

    return chart;
  };

  return chart;
}
