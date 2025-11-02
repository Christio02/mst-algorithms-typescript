import type { Edge, Graph } from "../interface.js";
import { DisjointSet } from "./disjoint-set.js";

export function kruskalMST(g: Graph): Edge[] {
  const result: Edge[] = [];

  const disjointUnionSet = new DisjointSet(g.vertices);

  const edgesSorted: Edge[] = g.edges
    .slice()
    .sort((edgeA: Edge, edgeB: Edge) => {
      return edgeA.weight - edgeB.weight;
    });

  for (let i: number = 0; i < edgesSorted.length; i++) {
    const edge = edgesSorted[i];
    if (edge === undefined) {
      throw new Error("Edge is undefined");
    }
    const u = edge.u;
    const v = edge.v;

    if (u === undefined) {
      throw new Error(`Node ${u} is undefined`);
    }
    if (v === undefined) {
      throw new Error(`Node ${v} is undefined`);
    }
    if (disjointUnionSet.union(u, v)) {
      result.push(edge);
    }

    if (result.length === g.vertices.length - 1) {
      break;
    }
  }

  return result;
}
