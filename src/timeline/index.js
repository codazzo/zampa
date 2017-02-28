/* eslint-disable */

import './index.css';
import * as d3 from 'd3';

const WIDTH_PX = 620;

/* from https://bl.ocks.org/misanuk/fc39ecc400eed9a3300d807783ef7607 */
/* Adapted from: https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172 */
export const renderTimeline = ({tags, selector, onDateRangeChanged = () => {}}) => {
  var margin = {top: 20, right: 20, bottom: 90, left: 50},
      margin2 = {top: 230, right: 20, bottom: 30, left: 50},
      width = WIDTH_PX - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom,
      height2 = 300 - margin2.top - margin2.bottom;

  const parseDateString = d3.timeParse('%Y-%m-%d');
  const parseTimestamp = epoch => {
    const date = new Date(epoch);
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return parseDateString(dateString);
  };

  var x = d3.scaleTime().range([0, width]),
      x2 = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      y2 = d3.scaleLinear().range([height2, 0]);

  var xAxis = d3.axisBottom(x).tickSize(0),
      xAxis2 = d3.axisBottom(x2).tickSize(0),
      yAxis = d3.axisLeft(y).tickSize(0);

  var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush", brushed);

  var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed)
      .on("end", () => {
        const [startDate, endDate] = x.domain();
        onDateRangeChanged(startDate, endDate);
      });

  var svg = d3.select(selector).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  d3.json("shazams.json", function(error, data) {
    const tags = data.tags;

    if(error) throw error;

    tags.reduce(function([prevEpoch, prevCount], tag) {
      tag.date = parseTimestamp(tag.timestamp);

      const dateEpoch = +tag.date;
      const tagsCount = dateEpoch === prevEpoch ? prevCount + 1 : 1;

      tag.tagsCount = tagsCount;
      return [dateEpoch, tagsCount];
    }, [0, 0]);

    var xMin = d3.min(tags, function(d) { return d.date; });
    var yMax = Math.max(20, d3.max(tags, function(d) { return d.tagsCount; }));

    x.domain([xMin, new Date()]);
    y.domain([0, yMax]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    // var num_messages = function(dataArray, domainRange) { return d3.sum(dataArray, function(d) {
    //   return d.sent_time >= domainRange.domain()[0] && d.sent_time <= domainRange.domain()[1];
    //   })
    // }

    // append scatter plot to main chart area
    var messages = focus.append("g");
    messages.attr("clip-path", "url(#clip)");
    messages.selectAll("message")
        .data(tags)
        .enter().append("circle")
        .attr('class', 'message')
        .attr("r", 4)
        .style("opacity", 0.4)
        .attr("cx", function(d) {
          return x(d.date);
        })
        .attr("cy", function(d) {
          return y(d.tagsCount);
        })

    focus.append("g")
          .attr("class", "axis x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

    focus.append("g")
          .attr("class", "axis axis--y")
          .call(yAxis);

    // Summary Stats
    focus.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          // .text("Messages (in the day)");

    // focus.append("text")
    //       .attr("x", width - margin.right)
    //       .attr("dy", "1em")
    //       .attr("text-anchor", "end")
    //       .text("Messages: " + num_messages(data, x));

    svg.append("text")
          .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                               (height + margin.top + margin.bottom) + ")")
          .style("text-anchor", "middle")
          // .text("Date");

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    // append scatter plot to brush chart area
     var messages = context.append("g");
         messages.attr("clip-path", "url(#clip)");
         messages.selectAll("message")
            .data(tags)
            .enter().append("circle")
            .attr('class', 'messageContext')
            .attr("r",3)
            .style("opacity", .6)
            .attr("cx", function(d) { return x2(d.date); })
            .attr("cy", function(d) { return y2(d.tagsCount); })

    context.append("g")
          .attr("class", "axis x-axis")
          .attr("transform", "translate(0," + height2 + ")")
          .call(xAxis2);

    context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, x.range());

    });

  //create brush function redraw scatterplot with selection
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.selectAll(".message")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.tagsCount); });
    focus.select(".x-axis").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.selectAll(".message")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.tagsCount); });
    focus.select(".x-axis").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  }
};
