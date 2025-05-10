// dijkstra.js

/**
 * Dijkstra's algorithm for shortest path in a weighted graph.
 * @param {Object} graph - adjacency list: {node: { neighbor1: weight1, ... }, ...}
 * @param {string} start - start node id
 * @param {string} end - end node id
 * @return {Object} {path: [start..end], distance: total distance}
 */
function dijkstra(graph, start, end) {
    const distances = {};
    const prev = {};
    const visited = {};
    const pq = new MinPriorityQueue();
  
    Object.keys(graph).forEach(node => {
      distances[node] = Infinity;
      prev[node] = null;
    });
    distances[start] = 0;
    pq.enqueue(start, 0);
  
    while (!pq.isEmpty()) {
      const {element: current} = pq.dequeue();
      if (visited[current]) continue;
      visited[current] = true;
      if (current === end) break;
  
      for (const neighbor in graph[current]) {
        const alt = distances[current] + graph[current][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          prev[neighbor] = current;
          pq.enqueue(neighbor, alt);
        }
      }
    }
  
    // Reconstruct path
    const path = [];
    let u = end;
    if (prev[u] || u === start) {
      while (u) {
        path.unshift(u);
        u = prev[u];
      }
    }
    return { path, distance: distances[end] };
  }
  
  /**
   * Min-Priority Queue (binary heap)
   */
  class MinPriorityQueue {
    constructor() {
      this.heap = [];
    }
    enqueue(element, priority) {
      this.heap.push({element, priority});
      this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
      if (this.isEmpty()) return null;
      this.swap(0, this.heap.length - 1);
      const min = this.heap.pop();
      this.bubbleDown(0);
      return min;
    }
    isEmpty() {
      return this.heap.length === 0;
    }
    bubbleUp(idx) {
      if (idx === 0) return;
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].priority > this.heap[idx].priority) {
        this.swap(parent, idx);
        this.bubbleUp(parent);
      }
    }
    bubbleDown(idx) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let smallest = idx;
      if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest !== idx) {
        this.swap(idx, smallest);
        this.bubbleDown(smallest);
      }
    }
    swap(i, j) {
      [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
  }
  
  // Export for browser
  if (typeof window !== "undefined") {
    window.dijkstra = dijkstra;
  }