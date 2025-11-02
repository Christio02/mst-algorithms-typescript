import type { Graph, Edge, VertexId, PrimQueueItem } from "../interface.js";
import { PriorityQueue } from "./priority-queue.js";

export function primMST(g: Graph) {
    // G: A connected, weighted, undirected graph
    // V: Set of all vertices in G
    // E: Set of all edges in G

    const mst: Edge[] = [];

    if (g.vertices.length === 0 || g.edges.length === 0) {
        return mst;
    }

    // track vertexindexes with a map
    const vertexIndex = new Map<VertexId, number>();
    for (let i = 0; i < g.vertices.length; i++) {
        vertexIndex.set(g.vertices[i], i);
    }

    // track visited with a boolean array
    const visited: boolean[] = new Array(g.vertices.length).fill(false);

    // init priority queue
    const priorityQueue = new PriorityQueue<PrimQueueItem>();

    // get startvertex
    const startVertex: VertexId = g.vertices[0];
    // index
    const startIndex = vertexIndex.get(startVertex);
    if (startIndex === undefined) {
        throw new Error(`Start vertex ${startVertex} missing from index map`);
    }

    // add startvertex to visited
    visited[startIndex] = true;

    // go through neighbors of start vertex, and enqueue in priority queue
    const enqueueNeighbors = (from: VertexId) => {
        const neighbors = g.adjList.get(from) ?? [];
        for (const neighbor of neighbors) {
            const neighborIndex = vertexIndex.get(neighbor.to);
            if (neighborIndex === undefined) {
                throw new Error(`Vertex ${neighbor.to} missing from index map`);
            }
            if (!visited[neighborIndex]) {
                priorityQueue.enqueue({
                    priority: neighbor.weight,
                    vertex: neighbor.to,
                    parent: from,
                });
            }
        }
    };

    enqueueNeighbors(startVertex);

    // continue until mst is built
    while (mst.length < g.vertices.length - 1 && !priorityQueue.isEmpty()) {
        // dequeue next item
        const queueItem = priorityQueue.dequeue();
        if (queueItem === undefined) {
            continue;
        }

        // get id
        const vertexIdx = vertexIndex.get(queueItem.vertex);
        if (vertexIdx === undefined) {
            throw new Error(
                `Vertex ${queueItem.vertex} missing from index map`,
            );
        }

        // if already visited skip
        if (visited[vertexIdx]) {
            continue;
        }

        // otherwise add to visited
        visited[vertexIdx] = true;
        // add edge to mst
        mst.push({
            u: queueItem.parent,
            v: queueItem.vertex,
            weight: queueItem.priority,
        });

        // continue enqueueing neighbors
        enqueueNeighbors(queueItem.vertex);
    }

    return mst;
}
