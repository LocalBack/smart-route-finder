// dijkstra.js

function dijkstra(graph, start, end) {
    const distances = {};
    const prev = {};
    const nodes = new Set(graph.nodes);
    for (let node of graph.nodes) distances[node] = Infinity;
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

    // Reconstruct path
    let path = [], u = end;
    if (prev[u] || u === start) {
        while (u) {
            path.unshift(u);
            u = prev[u];
        }
    }
    return { path: path, distance: distances[end] };
}