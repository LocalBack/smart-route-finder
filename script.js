let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let graph, nodeMarkers = {}, selected = [], routePolyline;

// Load the graph data (nodes, edges, coordinates)
fetch('graph-data.json')
  .then(res => res.json())
  .then(data => {
    graph = data;
    for (let node of graph.nodes) {
      let [lat, lng] = graph.coordinates[node];
      nodeMarkers[node] = L.marker([lat, lng]).addTo(map).bindPopup(`Node: ${node}`);
    }
    updateStatus();
  });

// Show user what to do next
function updateStatus() {
    let status = document.getElementById("status");
    if (selected.length === 0)
        status.innerHTML = "Select the <b>start node</b> (1st node).";
    else if (selected.length === 1)
        status.innerHTML = `Start: <b>${selected[0]}</b><br>Select the <b>end node</b> (2nd node).`;
    else if (selected.length === 2)
        status.innerHTML = `Start: <b>${selected[0]}</b>, End: <b>${selected[1]}</b>`;
}

// Map click handler to select nodes
map.on('click', function(e) {
  if (!graph) return;
  // Find nearest node
  let nearest = null, minDist = Infinity;
  for (let node of graph.nodes) {
    let [lat, lng] = graph.coordinates[node];
    let d = Math.sqrt(Math.pow(lat - e.latlng.lat, 2) + Math.pow(lng - e.latlng.lng, 2));
    if (d < minDist) {
      minDist = d;
      nearest = node;
    }
  }
  if (!nearest) return;
  // Only allow selecting two unique nodes
  if (!selected.includes(nearest)) {
    selected.push(nearest);
    nodeMarkers[nearest].openPopup();
    updateStatus();
  }
  // If two nodes selected, run and show path:
  if (selected.length === 2) {
    findRoute(selected[0], selected[1]);
  }
});

function findRoute(start, end) {
  let result = dijkstra(graph, start, end);
  let latlngs = result.path.map(node => graph.coordinates[node]);
  if (routePolyline) routePolyline.remove();
  if(latlngs.length > 1) {
    routePolyline = L.polyline(latlngs, { color: 'red', weight: 6 }).addTo(map);
    map.fitBounds(routePolyline.getBounds());
    alert(`Shortest path from ${start} to ${end}:\n${result.path.join(' ➔ ')}\nTotal Distance: ${result.distance}`);
  } else {
    alert(`No path found from ${start} to ${end}.`);
  }
  selected = [];
  updateStatus();
}

// Dijkstra's algorithm implementation
function dijkstra(graph, start, end) {
  const distances = {};
  const prev = {};
  const nodes = new Set(graph.nodes);

  for (let node of graph.nodes) {
    distances[node] = Infinity;
    prev[node] = null;
  }
  distances[start] = 0;

  while (nodes.size > 0) {
    let u = null;
    for (let node of nodes) {
      if (u === null || distances[node] < distances[u]) u = node;
    }
    if (distances[u] === Infinity || u === end) break;
    nodes.delete(u);
    for (let neighbor of graph.edges[u]) {
      let alt = distances[u] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        prev[neighbor.node] = u;
      }
    }
  }

  // Reconstruct shortest path
  let path = [], u = end;
  if (prev[u] || u === start) {
    while (u) {
      path.unshift(u);
      u = prev[u];
    }
  }
  return { path: path, distance: distances[end] };
}

// Reset button
document.getElementById('reset-btn').onclick = function() {
  selected = [];
  if (routePolyline) {
    routePolyline.remove();
    routePolyline = null;
  }
  updateStatus();
};