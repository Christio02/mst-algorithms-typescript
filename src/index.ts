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

function solve_assingment() {
    const vertices = Array.from({ length: 15 }, (_, i) => i);
    const edges: Edge[] = [
        // outer ring
        { u: 0, v: 1, weight: 6 }, // 1–2
        { u: 1, v: 2, weight: 3 }, // 2–3
        { u: 2, v: 3, weight: 9 }, // 3–4
        { u: 3, v: 4, weight: 2 }, // 4–5
        { u: 4, v: 5, weight: 8 }, // 5–6
        { u: 5, v: 6, weight: 5 }, // 6–7
        { u: 6, v: 7, weight: 7 }, // 7–8
        { u: 7, v: 8, weight: 1 }, // 8–9
        { u: 8, v: 9, weight: 4 }, // 9–10
        { u: 9, v: 10, weight: 10 }, // 10–11
        { u: 10, v: 11, weight: 2 }, // 11–12
        { u: 11, v: 12, weight: 6 }, // 12–13
        { u: 12, v: 13, weight: 8 }, // 13–14
        { u: 13, v: 14, weight: 3 }, // 14–15
        { u: 14, v: 0, weight: 5 }, // 15–1

        // extra inner edges from vertex 1 (index 0)
        { u: 0, v: 2, weight: 4 }, // 1–3
        { u: 0, v: 5, weight: 9 }, // 1–6
        { u: 0, v: 6, weight: 2 }, // 1–7
        { u: 0, v: 7, weight: 10 }, // 1–8
        { u: 0, v: 9, weight: 3 }, // 1–10

        // extra inner edges from vertex 15 (index 14)
        { u: 14, v: 9, weight: 1 }, // 15–10
        { u: 14, v: 10, weight: 7 }, // 15–11

        // inner edge between others
        { u: 2, v: 5, weight: 6 }, // 3–6
    ];

    const graph: Graph = {
        vertices,
        edges,
        adjList: buildAdjList(vertices, edges),
    };

    console.log("\n=== Assignment Graph ===");
    console.log(`Vertices: ${graph.vertices.length}`);
    console.log(`Edges: ${graph.edges.length}`);

    // measure kruskal
    let kruskalResult: Edge[] = [];
    const kruskalTime = measureTime(() => {
        kruskalResult = kruskalMST(graph);
    });

    // measure prim
    let primResult: Edge[] = [];
    const primTime = measureTime(() => {
        primResult = primMST(graph);
    });

    const kruskalValid = verifyMST(graph, kruskalResult);
    const primValid = verifyMST(graph, primResult);

    const kruskalWeight = kruskalResult.reduce((sum, e) => sum + e.weight, 0);
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

    console.log(`\nKruskal MST edges:`);
    kruskalResult.forEach((e) => {
        console.log(`  ${e.u + 1} -- ${e.v + 1} [weight: ${e.weight}]`);
    });
}

solve_assingment();
//runBenchmarks();
