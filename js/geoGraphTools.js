/*  This file defines the tools to define NC VTD geography as
    a directed graph for discrete measures of compactness.
    Classes included are: geoGraph, geoEdge, and geoNode.
    Read on for additional information.
 */

/*  A geoGraph is the top level controller class that encapsulates
    references to all nodes and edges within the graph as well as
    methods for adding, removing, and manipulating nodes.
    */
    // TODO Logic for nodes collapsing into the macro-congressional districts
class geoGraph {

    // geoGraph constructor initializes an empty graph.

    constructor() {
        this.nodes = {};
        this.edges = {};
        this.size = 0;
    }

    addNode(n) {
        this.nodes[n.vtdID] = n;
        this.size++;
        return n;
    }

    addEdge(a, b, weight) {
        this.nodes[a].addDestination(this.nodes[b], weight);
        this.nodes[b].addSource(this.nodes[a], weight);
    }

    getSize() {
        return this.size;
    }

    getNode(i) {
        return this.nodes[i];
    }

    groupMacroDistricts() {
        let macroDistrictDictionary = {};
        for (let i = 0 ; i <= 13 ; i++) {
            macroDistrictDictionary[i] = [];
        }
        for (let n in this.nodes) {
            let node = this.nodes[n];
            macroDistrictDictionary[node.district].push(node);
        }


    }
}

class geoEdge {
    // Class that defines the connections between two different nodes.

    // Constructor accepts two nodes a and b
    // to be linked, and the weight of the
    // connection between the two nodes.
    constructor(a, b, weight) {
        this.sourceNode = a;
        this.destNode = b;
        this.weight = weight;
    }
}

class geoNode {
    destinations = {};
    sources = {};
    border = false;
    // Class that defines the nodes that represent
    // a given VTD in a graph-representation of the
    // NC congressional districts.

    // Constructor accepts the id of the VTD this node
    // is representing in the graph, the id of the
    // congressional district this node belongs to,
    // and the vertex weight of this node.
    constructor(vtdID, district) {
        this.vtdID = vtdID;
        this.district = district;
    }

    addDestination(d, weight) {
        this.destinations[d.vtdID] = weight;
    }

    addSource(s, weight) {
        this.sources[s.vtdID] = weight;
    }

    removeDestination(d) {
        delete this.destinations[d.vtdID];
    }

    removeSource(s) {
        delete this.sources[s.vtdID];
    }

    setDistrict(d) {
        this.district = d;
    }
}

// This function takes in an existing graph and an
// adjacency map defined in plaintext and makes the
// proper method calls on the graph to define it according
// to the provided map. adjacencyMap plain text should have
// one row for every edge and each row should be in the form
// (source, destination, weight)
function buildAdjacencies(graph, adjacencyMap) {
    let lines = adjacencyMap.split("\n");
    for (let i = 0; i < lines.length ; i++) {
        let a = lines[i].split(/[ \t]+/);
        if (parseInt(a[0]) === -1) {
            try {
                graph.nodes[parseInt(a[1])].border = true;
                continue;
            } catch (err) {
                continue;
            }
        } else {
            try {
                graph.addEdge(parseInt(a[0]) - 1, parseInt(a[1]) - 1, parseInt(a[2]));
            } catch (err) {
                continue;
            }
        }
    }
}