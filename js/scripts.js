//L.mapbox.accessToken = 'pk.eyJ1IjoiY3N2MTciLCJhIjoiY2pwMDhvMnduMDUzajNrcnp2cGhvN2EwaiJ9.OIhZD-GOKgPn0qEI9wCz0A'; //Mapbox API key
//var map = L.mapbox.map('map', 'mapbox.emerald')

// Initialization of variables that need to be accessible on the entire map.
let selColor = "#FFFFFF";
let selDistrict = "1";
let g = new geoGraph();
let map = L.map('map', {
    center: [35.2, -79.9],
    zoom: 7,
    maxBounds: L.latLngBounds([37.3657, -84.5432], [33.1513, -75.2927])
}).setView([35.2, -79.9], 7);

$(document).ready(function () {
    console.log('scripts loaded');

    var url = 'js/ncvtds.geojson'; //get the file to be later called in the AJAX call
    var d = [];
    let exe = [];
    var html;
    var add;

    var state = document.getElementById('state');

    $.ajax({
        type: 'GET',
        url: url, // called from above
        dataType: 'json',
        data: d, // the object that we are calling
        success: function (d) {
            let states = initFiles(d, g);
            //console.log(d);
            // states.on('mousedown', function (e) {
            //   var layer = e.layer;
            //   layer.setStyle({
            //     'color': "aqua"
            //   });
            // });
        }
    });
});

// This function adds the necessary event listeners
// to map objects, UI elements, etc. Accepts a fully
// formed leaflet map object.
function controlSetUp(states) {
      $('.disableDrag').click(function () {
        map.dragging.disable();
      });
      //this button creates 
      $('.chooseColor').click(function () {
        html += '<button class="blue">Blue</button>';
        html += '<button class="red">Red</button>';

        $('.color').html(html);
      });

      $('.blue').click(function () {
        states.layer.setStyle({
          'color': 'blue'
        });

      });

      // states.on('mousedown', function (e) {
      //   var layer = e.layer;
      //   layer.setStyle({
      //     'color': "blue"
      //   });
      // });

      $('.red').click(function () {
        states.layer.setStyle({
          'color': 'red'
        });
      });

      states.addEventListener("mousemove", function (e) {
        var layer = e.layer;
        layer.setStyle({
          'color': selColor
        });

        layer.feature.properties['DIST'] = selDistrict;
        layer.feature['node'].setDistrict(selDistrict);
      });

      $('.enableDrag').click(function () {
        map.dragging.enable();
      });


      // states.on("mouseup", function (e) {
      //   var layer = e.layer;
      //   layer.setStyle({
      //     'color': "red"
      //   });
      // });




      var selected = [];

      states.on('click', function (e) {
        var layer = e.layer;
        var polygon = layer.feature;
        var precinctInfo = polygon.properties;

        // layer.setStyle({
        //   'color': 'yellow'
        // });

        selected.push(polygon);


        //union of two polygons
        if (selected.length == 2) {
          var union = turf.union(selected[0], selected[1]);

          L.geoJson(union.toGeoJSON()).addTo(map);

          /*map.addLayer({
            'id': 'urban-areas-fill',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': union
            },
            'layout': {},
            'paint': {
                'fill-color': '#f08',
                'fill-opacity': 0.4
            }
        // This is the important part of this example: the addLayer
        // method takes 2 arguments: the layer as an object, and a string
        // representing another layer's name. if the other layer
        // exists in the stylesheet already, the new layer will be positioned
        // right before that layer in the stack, making it possible to put
        // 'overlays' anywhere in the layer stack.
        // Insert the layer beneath the first symbol layer.
        });*/
        }
      });
    }

    /*  Function to set up the initial state of our geoGraph object.
        Takes in a geoGraph object (graph) and a geojson object (geojson).
     */
function initGraph(graph, geojson) {
  let e;
  $.ajax({
      type: 'GET',
      url: 'js/NC_Edges_LengthsFormatted.txt',
      dataType: 'text',
      async: false,
      data: e,
      success: function (e) {
        buildAdjacencies(graph, e);
        console.log(getDiscretePolsbyPopper(graph, 1));

      }
  })
}

/* Function to set up the initial styling of the
   leaflet map objects as well as initialize the
   node adjacency map in the geoGraph object.
 */
function initFiles(geojson, g) {
    let e;
    $.ajax({
        type: 'GET',
        url: 'js/pickMap.txt',
        dataType: 'text',
        data: e,
        success: function(e) {
            assignDistricts(geojson, e);
            for (let id in geojson.features) {           // For-loop to initalize geograph with all nodes.
                geojson.features[id]['node'] = g.addNode(new geoNode(id, geojson.features[id].properties['DIST']));
            }
            assignStyle(geojson);
            initGraph(g, geojson);
            let states = L.geoJson(geojson, {style: function (feature) {
                    return {color: feature.color};
                }
            }).addTo(map);
            controlSetUp(states);
            return states;
        }
    })
}

/*  Function to assign the proper initial colors
    to each district included in the geojson.
    Called on startup.
 */
function assignStyle(geojson) {
    for (let e in geojson.features) {
        let d = geojson.features[e].properties['DIST'];
        let color;
        switch(parseInt(d)) {
            case 1:
                color = "#800000";
                break;
            case 2:
                color = "#808000";
                break;
            case 3:
                color = "#ffe119";
                break;
            case 4:
                color = "#3cb44b";
                break;
            case 5:
                color = "#42d4f4";
                break;
            case 6:
                color = "#911eb4";
                break;
            case 7:
                color = "#f032e6";
                break;
            case 8:
                color = "#ffd8b1";
                break;
            case 9:
                color = "#469990";
                break;
            case 10:
                color = "#000000";
                break;
            case 11:
                color = "#000075";
                break;
            case 12:
                color = "#e6194b";
                break;
            case 13:
                color = "#aaffc3";
                break;
        }
        geojson.features[e]['color'] = color;
    }
}


/*  Functions to set the currently selected
 *  district to be manipulated on the map.
 *  Called by buttons of class 'districtButton'
 *  in index.html */
function setColor(color) {
    selColor = color;
}

function setDistrict(district) {
    selDistrict = district;
}