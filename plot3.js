(function (root) {

  // Plot types.
  var lp = root.linePlot = function (ctx, ds, data) {
    var line = d3.svg.line().x(function (d) { return ctx.xscale(ds.x(d)); })
                            .y(function (d) { return ctx.yscale(ds.y(d)); });

    // Plot the new line.
    var selection = ctx.g.selectAll("path."+ds.label).data([data]);

    // Add the line if it doesn't already exit.
    selection.enter().append("path").attr("class", ds.label);

    // Remove any leftover lines.
    selection.exit().remove();

    // Update the position of the line.
    ctx.g.select("path."+ds.label).attr("d", line(data));
  };

  var scatter = root.scatterPlot = function (ctx, ds, data) {
    var cx = function (d) { return ctx.xscale(ds.x(d)); },
        cy = function (d) { return ctx.yscale(ds.y(d)); };

    // Plot the new line.
    var selection = ctx.g.selectAll("circle."+ds.label).data(data);

    // Add more points if needed.
    selection.enter().append("circle").attr("class", ds.label);

    // Remove old ones.
    selection.exit().remove();

    // Update all the positions of the points.
    ctx.g.selectAll("circle."+ds.label).attr("cx", cx)
                                       .attr("cy", cy)
                                       .attr("r", 3)
                                       .attr("fill", "black");
  };

  // The plot object.
  root.plot3 = function () {

    // Plot layout parameters.
    var xlim, ylim,
        xlabel = "", ylabel = "",
        xticks, yticks;

    // Geometry.
    var width = 800, height = 400,
        margin = {top: 20, right: 20, bottom:30, left: 30};

    // Plot elements.
    var datasets = [];

    var pl = function (selection) {
      selection.each(function(data) {

        var xl = xlim, yl = ylim;

        // Compute the limits of the axes if they weren't provided.
        if (typeof xlim === "undefined") {
          var rng = datasets.map(function(d,i){return d3.extent(data[d.label], d.x);});
          xl = [d3.min(rng, function(d) {return d[0];}),
                d3.max(rng, function(d) {return d[1];})];
          var dx = xl[1] - xl[0];
          xl[0] -= 0.1 * dx;
          xl[1] += 0.1 * dx;
        }
        if (typeof ylim === "undefined") {
          var rng = datasets.map(function(d,i){return d3.extent(data[d.label], d.y);});
          yl = [d3.min(rng, function(d) {return d[0];}),
                d3.max(rng, function(d) {return d[1];})];
          var dy = yl[1] - yl[0];
          yl[0] -= 0.1 * dy;
          yl[1] += 0.1 * dy;
        }

        // Build the scales.
        var xscale = d3.scale.linear()
                             .domain(xl)
                             .range([0, width - margin.left - margin.right]),
            yscale = d3.scale.linear()
                             .domain(yl)
                             .range([height - margin.top - margin.bottom, 0]);

        // Layout the plot.
        var svg = d3.select(this).selectAll("svg").data([data]),
            eg = svg.enter().append("svg").append("g");

        // Update the dimensions.
        svg.attr("width", width).attr("height", height);

        // Display the axes.
        var xaxis = d3.svg.axis().scale(xscale),
            yaxis = d3.svg.axis().scale(yscale).orient("left");

        eg.append("g").attr("class", "x axis")
                     .attr("transform", "translate(0," + yscale.range()[0] + ")");
        eg.append("g").attr("class", "y axis");

        // Display the axes labels.
        eg.append("text").attr("class", "x axis label")
                        .attr("text-anchor", "end")
                        .attr("x", xscale.range()[1])
                        .attr("y", yscale.range()[0])
                        .attr("dy", -6);
        eg.append("text").attr("class", "y axis label")
                        .attr("text-anchor", "start")
                        .attr("x", xscale.range()[0])
                        .attr("y", yscale.range()[1])
                        .attr("dy", -6)
                        .attr("transform", "rotate(90)");

        // Update the elements.
        var g = svg.select("g")
                   .attr("transform", "translate(" + margin.left + ", "
                                                   + margin.top  + ")");
        g.select(".x.axis").call(xaxis);
        g.select(".x.axis.label").text(xlabel);
        g.select(".y.axis").call(yaxis);
        g.select(".y.axis.label").text(ylabel);

        // Render the plots.
        var ctx = {eg: eg, g: g, xscale: xscale, yscale: yscale};
        datasets.map(function (d) {
          console.log(d);
          d.render(ctx, d, data[d.label]);
        });

      });
    };

    // Drawing function.
    pl.plot = function (lbl, x, y, opts) {
      // Data access functions.
      var x_ = x, y_ = y;
      if (typeof x !== "function") x = function (d) { return d[x_]; };
      if (typeof y !== "function") y = function (d) { return d[y_]; };

      // The plot rendering function.
      var rf = _get(opts, "render", lp);
      console.log(rf);

      if (typeof rf !== "function") {
        if (rf === "line") rf = lp;
        else if (rf === "scatter") rf = scatter;
        else throw "Unknown rendering function.";
      }

      // Create a new dataset.
      datasets.push({label: lbl, render: rf, x: x, y: y, opts: opts});

      return pl;
    };

    // Getters and setters.
    pl.xlim = function (v) {
      if (!arguments.length) return xlim;
      xlim = v;
      return pl;
    };

    pl.ylim = function (v) {
      if (!arguments.length) return ylim;
      ylim = v;
      return pl;
    };

    pl.xlabel = function (v) {
      if (!arguments.length) return xlabel;
      xlabel = v;
      return pl;
    };

    pl.ylabel = function (v) {
      if (!arguments.length) return ylabel;
      ylabel = v;
      return pl;
    };

    pl.xticks = function (v) {
      if (!arguments.length) return xticks;
      xticks = v;
      return pl;
    };

    pl.yticks = function (v) {
      if (!arguments.length) return yticks;
      yticks = v;
      return pl;
    };

    pl.width = function (v) {
      if (!arguments.length) return width;
      width = v;
      return pl;
    };

    pl.height = function (v) {
      if (!arguments.length) return height;
      height = v;
      return pl;
    };

    // Nice rendering in the console.
    pl.toString = function () { return "plot3"; };

    return pl;
  };

  // Helper functions.
  var _get = function (dict, k, def) {
    if (typeof dict === "undefined") return def;
    if (typeof dict[k] === "undefined") return def;
    return dict[k];
  };

})(this);
