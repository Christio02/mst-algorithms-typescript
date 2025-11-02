export type VertexId = number;

export interface Edge {
    u: VertexId;
    v: VertexId;
    weight: number;
}

export interface PrimQueueItem {
    priority: number;
    vertex: VertexId;
    parent: VertexId;
}

export interface Graph {
    vertices: VertexId[]; // e.g., [0,1,2,3,...]
    edges: Edge[]; // all edges u <-> v
    adjList: Map<VertexId, Array<{ to: VertexId; weight: number }>>; // adjacency list, undirected
}
