var treeData = {
  name: "World",
  children: [
    {
      name: "Asia",

      children: [
        {
          name: "India",
          children: [
            {
              name: "Mumbai",
            },
            {
              name: "Delhi",
            },
          ],
        },
        {
          name: "China",
        },
        {
          name: "Russia",
        },
        {
          name: "Japan",
          children: [
            {
              name: "Tokyo",
            },
            {
              name: "Kyoto",
            },
          ],
        },
      ],
    },
    {
      name: "Africa",
      children: [
        {
          name: "Egypt",
        },
        {
          name: "South Africa",
        },
      ],
    },
    {
      name: "Australia",
    },
    {
      name: "North America",
      children: [
        {
          name: "USA",
          children: [
            {
              name: "New York",
            },
            {
              name: "Los Angeles",
            },
          ],
        },
        {
          name: "Canada",
          children: [
            {
              name: "Toronto",
            },
          ],
        },
      ],
    },
    {
      name: "South America",
      children: [
        {
          name: "Brazil",
        },
        {
          name: "Chile",
        },
      ],
    },
    {
      name: "Europe",
      children: [
        {
          name: "Great Britain",
          children: [
            {
              name: "England",
            },
            {
              name: "Scotland",
            },
            {
              name: "Ireland",
            },
          ],
        },
        {
          name: "Poland",
          children: [
            {
              name: "Warsaw",
            },
          ],
        },
        {
          name: "France",
          children: [
            {
              name: "Paris",
            },
          ],
        },
        {
          name: "Germany",
          children: [
            {
              name: "Berlin",
            },
          ],
        },
      ],
    },
    {
      name: "Antarctica",
    },
  ],
};

var margin = { top: 50, right: 90, bottom: 20, left: 100 };
var width = 1200 - margin.left - margin.right;
var height = 1200 - margin.top - margin.bottom;
var bottom = 550;

var svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

var colorScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range(["#00FF7F", "#DC143C"]);

var i = 0;
var duration = 750;
var root;

var treemap = d3.tree().size([height, width]);
root = d3.hierarchy(treeData, function (d) {
  return d.children;
});

root.x0 = width / 2;
root.y0 = bottom;

// console.log("root", root);

update(root);

function update(source) {
  var treeData = treemap(root);

  // nodes
  var nodes = treeData.descendants();
  nodes.forEach(function (d) {
    d.y = d.depth * 150;
  });

  var node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return `translate(${source.x0},${bottom - source.y0})`;
    })
    .on("click", click);

  nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 0)
    .style("fill", () => colorScale(Math.random() * 100));
  // .style("fill", function (d) {
  //   return d._children ? "red" : "#fff";
  // });

  nodeEnter
    .append("text")
    .attr("class", "text")
    .attr("x", function (d) {
      return d.children || d._children ? -10 : -20;
    })
    .attr("y", function (d) {
      return d.children || d._children ? 20 : -20;
    })
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.data.name;
    })
    .style("font-size", function (d) {
      return d.children || d._children ? "12px" : "10px";
    });

  var nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return `translate(${d.x},${bottom - d.y})`;
    });

  nodeUpdate
    .select("circle.node")
    .attr("r", 10)
    .style("fill", () => colorScale(Math.random() * 100))
    // .style("fill", function (d) {
    //   return d._children ? "red" : "#fff";
    // })
    .attr("cursor", function (d) {
      return d.children || d._children ? "pointer" : "";
    });

  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return `translate(${source.x},${bottom - source.y})`;
    })
    .remove();

  nodeExit.select("circle").attr("r", 0);
  nodeExit.select("text").style("fill-opacity", 0);

  // links

  function diagonal(s, d) {
    var path = `M ${s.x} ${bottom - s.y}
         C ${(s.x + d.x) / 2} ${bottom - s.y}
            ${(s.x + d.x) / 2} ${bottom - d.y}
            ${d.x} ${bottom - d.y}
         `;
    return path;
  }
  var links = treeData.descendants().slice(1);
  var link = svg.selectAll("path.link").data(links, function (d) {
    return d.id;
  });

  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("stroke-opacity", 0.7)
    .attr("d", function (d) {
      var o = { x: source.x0, y: bottom - source.y };
      return diagonal(o, o);
    });

  var linkUpdate = linkEnter.merge(link);

  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function (d) {
      return diagonal(d, d.parent);
    });

  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", function (d) {
      var o = { x: source.x0, y: bottom - source.y0 };
      return diagonal(o, o);
    })
    .remove();

  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  function click(event, d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}

// d3.select("div.container")
//   .append("div")
//   .classed("svg-container", true) //container class to make it responsive
//   .append("svg")
//   //responsive SVG needs these 2 attributes and no width and height attr
//   .attr("preserveAspectRatio", "xMinYMin meet")
//   .attr("viewBox", "0 0 600 400")
//   //class to make it responsive
//   .classed("svg-content-responsive", true);
