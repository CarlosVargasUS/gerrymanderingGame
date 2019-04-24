/*  This file defines the tools to define NC VTD geography as
    a directed graph for discrete measures of compactness.
    Classes included are: geoGraph, geoEdge, and geoNode.
    Read on for additional information.
 */

/*  A geoGraph is the top level controller class that encapsulates
    references to all nodes and edges within the graph as well as
    methods for adding, removing, and manipulating nodes.
    */
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
        for (let i = 1 ; i <= 13 ; i++) {
            macroDistrictDictionary[i] = new Array();
        }
        for (let n in this.nodes) {
            let node = this.nodes[n];
            macroDistrictDictionary[parseInt(node.district)].push(node);
        }
        return macroDistrictDictionary;
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
    district = -1;
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

    getDestMap() {
        return this.destinations;
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

function assignDistricts(geojson, map) {
    let lines = map.split("\n");
    for (let i = 0; i < lines.length ; i++) {
        let a = lines[i].split(/[ \t]+/);
        geojson.features[a[0]].properties['DIST'] = '';
        try {
            geojson.features[a[0]].properties['DIST'] = a[1];
            geojson.features[a[0]]['node'].setDistrict(a[1]);
        } catch (err) {
            continue;
        }
    }
}


// Function that takes in a geograph object and
// the integer of a given district and iterates over
// each node in the set to find which nodes in the set
// are on the border of the district.
function findBorderOfDistrict(graph, dist) {
    let nodes = graph.groupMacroDistricts()[dist];
    let borderSet = [];
    nodes.forEach(function(currNode) {
        let nodeDests = currNode.destinations;
        for (let d in nodeDests) {
            if (parseInt(graph.nodes[d].district) !== dist || currNode.border === true) {
                borderSet.push(currNode);
            }
        }
    });

    let returnSet = [...new Set(borderSet)];

    return Array.from(returnSet);
}

function getDiscretePolsbyPopper(graph, district) {
        let d = graph.groupMacroDistricts();
        let key = district.toString();
        if (d[key].length === 0 ) {
            return "This district is completely empty.";
        }
        return d[key].length / Math.pow(findBorderOfDistrict(graph, district).length, 2);
}


//Testing function for geoGraph.
function testDist() {
    let d = new geoGraph();

    let nodeOne = new geoNode(1, 1);
    let nodeTwo = new geoNode(2, 1);
    let nodeThree = new geoNode(3, 1);
    let nodeFour = new geoNode(4, 2);
    let nodeFive = new geoNode(5, 3);
    let nodeSix = new geoNode(6, 1);

    d.addNode(nodeOne);
    d.addNode(nodeTwo);
    d.addNode(nodeThree);
    d.addNode(nodeFour);
    d.addNode(nodeFive);
    d.addNode(nodeSix);

    d.addEdge(2, 1, 1);
    d.addEdge(2, 3, 1);
    d.addEdge(1, 5, 1);
    d.addEdge(3, 4, 1);
    d.addEdge(6, 4, 1);

    return getDiscretePolsbyPopper(d, 1);

    //Should return array with nodeOne, nodeThree, and nodeSix in it.

}


function calculateReock(geojson, district) {
    let dist = buildMacroMap(geojson)[district];

    if (dist.length === 0) {
        return "This district is completely empty.";
    }

    let districtPolygon = turf.union.apply(this, dist);

    let bbox = turf.bbox(districtPolygon);

    let topRight = turf.point([bbox[2], bbox[3]]);
    let bottomLeft = turf.point([bbox[0], bbox[1]]);

    let r = turf.distance(topRight, bottomLeft) / 2;
    let c = turf.circle(turf.center(districtPolygon), r);

    return turf.area(districtPolygon) / turf.area(c);
}

function getCenterOfDist(geojson, district) {
    let dist = buildMacroMap(geojson)[district];
    let districtPolygon = turf.union.apply(this, dist);

    return turf.center(districtPolygon);
}

function calculateLengthWidth(geojson, district) {
    let dist = buildMacroMap(geojson)[district];

    if (dist.length === 0) {
        return "This district is completely empty.";
    }

    let districtPolygon = turf.union.apply(this, dist);

    let bbox = turf.bbox(districtPolygon);

    let topLeft = turf.point([bbox[0], bbox[3]]);
    let topRight = turf.point([bbox[2], bbox[3]]);
    let bottomLeft = turf.point([bbox[0], bbox[1]]);

    let width = turf.distance(topLeft, topRight);
    let height = turf.distance(topLeft, bottomLeft);

    return (width > height) ? (height/width) : (width/height);

}

function buildMacroMap(geojson) {

    let macroDistrictDictionary = {};
    for (let i = 1 ; i <= 13 ; i++) {
        macroDistrictDictionary[i] = new Array();
    }
    for (let key in geojson.features) {
        let dist = geojson.features[key];
        macroDistrictDictionary[parseInt(dist.properties['DIST'])].push(dist);
    }
    return macroDistrictDictionary;
}