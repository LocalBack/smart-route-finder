// script.js

let graph = null;           // adjacency list from mugla_graph.json
let positions = null;       // node id => {lat, lon}
let map = null;
let startNode = null, endNode = null;
let startMarker = null, endMarker = null, routeLine = null;

function getClosestNode(latlng, positions) {
  let minDist = Infinity, closest = null;
  for (let node in positions) {
    const dLat = latlng.lat - positions[node].lat;
    const dLon = latlng.lng - positions[node].lon;
    const dist = dLat * dLat + dLon * dLon; // Fast, sufficient for small area
    if (dist < minDist) {
      minDist = dist;
      closest = node;
    }
  }
  return closest;
}

function updateInfo(msg) {
  document.getElementById('info').textContent = msg;
}

function resetState() {
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  if (routeLine) map.removeLayer(routeLine);
  startMarker = endMarker = routeLine = null;
  startNode = endNode = null;
  updateInfo("Click two points on the map to select start and end.");
}

fetch('mugla_graph.json')
  .then(res => res.json())
  .then(data => {
    graph = data.edges;
    positions = data.positions;
    initializeMap();
  })
  .catch((err) => {
    alert("Couldn't load Muğla road network!");
    console.error(err);
  });

function initializeMap() {
  // Muğla approximate center (city level, fine tune for your needs)
  map = L.map('map').setView([37.2159, 28.3636], 10);

  // OSM tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', function(e) {
    if (!graph || !positions) {
      updateInfo("Graph data not loaded yet.");
      return;
    }
    if (!startNode) {
      startNode = getClosestNode(e.latlng, positions);
      const pos = positions[startNode];
      startMarker = L.marker([pos.lat, pos.lon], {icon: L.icon({
        iconUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconAnchor:[12, 41]
      })}).bindPopup("Start").addTo(map).openPopup();
      updateInfo("Start selected. Click to select end point.");
    } else if (!endNode) {
      endNode = getClosestNode(e.latlng, positions);
      const pos = positions[endNode];
      endMarker = L.marker([pos.lat, pos.lon], {icon: L.icon({
        iconUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-red.png", iconAnchor:[12,41]
      })}).bindPopup("End").addTo(map).openPopup();
      updateInfo("Calculating shortest path...");
      setTimeout(() => {
        calculateAndDrawRoute();
      }, 100);
    }
  });

  document.getElementById('reset-btn').addEventListener('click', resetState);

  resetState();
}

function calculateAndDrawRoute() {
  if (!startNode || !endNode) return;
  if (startNode === endNode) {
    updateInfo("Start and End are the same point!");
    return;
  }
  const result = dijkstra(graph, startNode, endNode);
  if (!result.path || result.path.length < 2) {
    updateInfo("No path found between selected points.");
    return;
  }
  // Draw polyline
  const pathLatLngs = result.path.map(n => [positions[n].lat, positions[n].lon]);
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline(pathLatLngs, {color: 'red', weight: 5}).addTo(map);
  map.fitBounds(routeLine.getBounds(), { padding: [60,60] });
  let dist_km = result.distance / 1000;
  updateInfo(`Shortest path found! Distance: ${dist_km.toFixed(2)} km. Click reset to try new points.`);
}