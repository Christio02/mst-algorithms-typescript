import type { Graph, VertexId, Edge } from "./interface.js";
import { kruskalMST } from "./kruskal/kruskal.js";
import { primMST } from "./prim/prim.js";

function buildAdjList(
    vertices: VertexId[],
    edges: Edge[],
): Map<VertexId, Array<{ to: VertexId; weight: number }>> {
    const adjList = new Map<
        VertexId,
        Array<{ to: VertexId; weight: number }>
    >();

    for (const v of vertices) {
        adjList.set(v, []);
    }

    for (const edge of edges) {
        adjList.get(edge.u)?.push({ to: edge.v, weight: edge.weight });
        adjList.get(edge.v)?.push({ to: edge.u, weight: edge.weight });
    }

    return adjList;
}

// generate complete graph (all vertices are connected to each other)
function generateCompleteGraph(n: number): Graph {
    const vertices: VertexId[] = Array.from({ length: n }, (_, i) => i);
    const edges: Edge[] = [];

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({
                u: i,
                v: j,
                weight: Math.floor(Math.random() * 100) + 1,
            });
        }
    }

    return {
        vertices,
        edges,
        adjList: buildAdjList(vertices, edges),
    };
}

// generate sparse graph (less edges)
function generateSparseGraph(n: number, edgeFactor: number = 2): Graph {
    const vertices: VertexId[] = Array.from({ length: n }, (_, i) => i);
    const edges: Edge[] = [];

    // create spanning tree
    for (let i = 1; i < n; i++) {
        const parent = Math.floor(Math.random() * i);
        edges.push({
            u: parent,
            v: i,
            weight: Math.floor(Math.random() * 100) + 1,
        });
    }

    // add random edges
    const additionalEdges = Math.floor(n * edgeFactor);
    for (let i = 0; i < additionalEdges; i++) {
        const u = Math.floor(Math.random() * n);
        const v = Math.floor(Math.random() * n);
        if (u !== v) {
            edges.push({
                u,
                v,
                weight: Math.floor(Math.random() * 100) + 1,
            });
        }
    }

    return {
        vertices,
        edges,
        adjList: buildAdjList(vertices, edges),
    };
}

function measureTime(fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();

    return end - start;
}

function verifyMST(g: Graph, mst: Edge[]): boolean {
    const expectedEdges = g.vertices.length - 1;
    if (mst.length != expectedEdges) {
        console.warn(`Expected ${expectedEdges} edges, got ${mst.length}`);
        return false;
    }
    return true;
}

function runBenchmarks() {
    console.log("=== MST Algorithm Benchmark ===\n");

    const testCases = [
        { name: "Small Complete Graph", graph: generateCompleteGraph(10) },
        { name: "Medium Complete Graph", graph: generateCompleteGraph(50) },
        { name: "Large Complete Graph", graph: generateCompleteGraph(100) },
        { name: "Small Sparse Graph", graph: generateSparseGraph(100, 1.5) },
        { name: "Medium Sparse Graph", graph: generateSparseGraph(500, 2) },
        { name: "Large Sparse Graph", graph: generateSparseGraph(1000, 2) },
    ];

    for (const testCase of testCases) {
        console.log(`\n${testCase.name}:`);
        console.log(`  Vertices: ${testCase.graph.vertices.length}`);
        console.log(`  Edges: ${testCase.graph.edges.length}`);

        // warm up
        kruskalMST(testCase.graph);
        primMST(testCase.graph);

        // measure kruskal
        let kruskalResult: Edge[] = [];
        const kruskalTime = measureTime(() => {
            kruskalResult = kruskalMST(testCase.graph);
        });

        // measure prim
        let primResult: Edge[] = [];
        const primTime = measureTime(() => {
            primResult = primMST(testCase.graph);
        });

        // verify
        const kruskalValid = verifyMST(testCase.graph, kruskalResult);
        const primValid = verifyMST(testCase.graph, primResult);

        // calculate mst weight
        const kruskalWeight = kruskalResult.reduce(
            (sum, e) => sum + e.weight,
            0,
        );
        const primWeight = primResult.reduce((sum, e) => sum + e.weight, 0);

        console.log(
            `  Kruskal: ${kruskalTime.toFixed(3)}ms (weight: ${kruskalWeight}) ${kruskalValid ? "Yes" : "No"}`,
        );
        console.log(
            `  Prim:    ${primTime.toFixed(3)}ms (weight: ${primWeight}) ${primValid ? "Yes" : "No"}`,
        );

        const faster = kruskalTime < primTime ? "Kruskal" : "Prim";
        const maxTime = Math.max(kruskalTime, primTime, Number.EPSILON);
        const speedup = (Math.abs(kruskalTime - primTime) / maxTime) * 100;

        if (maxTime < 0.001) {
            console.log(
                `  Winner: ${faster} (both too fast to measure accurately)`,
            );
        } else {
            console.log(`  Winner: ${faster} (${speedup.toFixed(1)}% faster)`);
        }

        if (Math.abs(kruskalWeight - primWeight) > 0.01) {
            console.warn(
                `  ⚠️  Weight mismatch! Kruskal: ${kruskalWeight}, Prim: ${primWeight}`,
            );
        }
    }

    console.log("\n=== Benchmark Complete ===");
}

runBenchmarks();
