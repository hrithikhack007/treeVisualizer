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

var margin = { top: 20, right: 90, bottom: 20, left: 400 };
var width = 1500 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

var i = 0;
var duration = 750;
var root;

var treemap = d3.tree().size([height, width]);
root = d3.hierarchy(treeData, function (d) {
  return d.children;
});

root.x0 = height / 2;
root.y0 = 0;

// console.log("root", root);

update(root);

function update(source) {
  var treeData = treemap(root);

  // nodes
  var nodes = treeData.descendants();
  nodes.forEach(function (d) {
    d.y = d.depth * 180;
  });

  var node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return `translate(${source.y0},${source.x0})`;
    })
    .on("click", click);

  nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 0)
    .style("fill", function (d) {
      return d._children ? "red" : "#fff";
    });

  nodeEnter
    .append("text")
    .attr("dy", ".35em")
    .attr("x", function (d) {
      return d.children || d._children ? -20 : 20;
    })
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.data.name;
    })
    .style("font-size", "15");

  var nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return `translate(${d.y},${d.x})`;
    });

  nodeUpdate
    .select("circle.node")
    .attr("r", 15)
    .style("fill", function (d) {
      return d._children ? "red" : "#fff";
    })
    .attr("cursor", "pointer");

  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return `translate(${source.y},${source.x})`;
    })
    .remove();

  nodeExit.select("circle").attr("r", 0);
  nodeExit.select("text").style("fill-opacity", 0);

  // links

  function diagonal(s, d) {
    var path = `M ${s.y} ${s.x}
         C ${(s.y + d.y) / 2} ${s.x}
            ${(s.y + d.y) / 2} ${d.x}
            ${d.y} ${d.x}
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
    .attr("d", function (d) {
      var o = { x: source.x0, y: source.y };
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
      var o = { x: source.x0, y: source.y0 };
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
