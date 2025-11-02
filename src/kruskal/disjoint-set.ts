import type { VertexId } from "../interface.js";


export class DisjointSet {
  private parent: Map<VertexId, VertexId>;
  private rank: Map<VertexId, number>;

  constructor(vertices: VertexId[]) {
    this.parent = new Map<VertexId, VertexId>();
    this.rank = new Map<VertexId, number>();

    // TODO: initialize each vertex as its own parent; rank = 0
    for (const vertex of vertices) {
      this.parent.set(vertex, vertex);
      this.rank.set(vertex, 0);
    }
  }

  findSet(x: VertexId): VertexId {
    const parentValue = this.parent.get(x);
    if (parentValue === undefined) {
      throw new Error(`Vertex ${x} not found in disjoint set`);
    }

    if (parentValue === x) {
      return x;
    }

    // path compression
    const root = this.findSet(parentValue);
    this.parent.set(x, root);
    return root;
  }

  union(a: VertexId, b: VertexId): boolean {
    // TODO: union by rank; return true if merged (i.e., were in different sets), false otherwise

    const rootA = this.findSet(a);
    const rootB = this.findSet(b);

    if (rootA === rootB) {
      return false;
    }

    // Get ranks (with undefined checks)
    const rankA = this.rank.get(rootA);
    const rankB = this.rank.get(rootB);

    if (rankA === undefined || rankB === undefined) {
      throw new Error(`Rank not found for root vertex`);
    }

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);

      this.rank.set(rootA, rankA + 1);
    }
    return true;
  }
}
