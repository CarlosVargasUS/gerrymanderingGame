$(document).ready(function () {
  console.log('scripts loaded');

  var url = 'js/ncr2.geojson'; //get the file to be later called in the AJAX call
  var d = [];
  var html;
  var add;

  L.mapbox.accessToken = 'pk.eyJ1IjoiY3N2MTciLCJhIjoiY2pwMDhvMnduMDUzajNrcnp2cGhvN2EwaiJ9.OIhZD-GOKgPn0qEI9wCz0A'; //Mapbox API key

  var state = document.getElementById('state');
  var map = L.mapbox.map('map', 'mapbox.emerald')
    .setView([35.9132, -79.0558], 2);

  $.ajax({
    type: 'GET',
    url: url, // called from above
    dataType: 'json',
    data: d, // the object that we are calling
    success: function (d) {
      var states = L.geoJson(d).addTo(map);
      L.marker([35.7596, -79.0193], {
          icon: L.mapbox.marker.icon({
            'marker-color': '#f86767'
          }),
          draggable: false
        }).addTo(map)
        .on('dragend', function (e) {
          var layer = leafletPip.pointInLayer(this.getLatLng(), states, true);
          if (layer.length) {
            state.innerHTML = '<strong>' + layer[0].feature.properties.name + '</strong>';
          } else {
            state.innerHTML = '';
          }
        });

      // states.on('mousedown', function (e) {
      //   var layer = e.layer;
      //   layer.setStyle({
      //     'color': "aqua"
      //   });
      // });

      //This button disables the drag function on the map when being clicked
      $('.disableDrag').click(function () {
        map.dragging.disable();
      });
      //this button creates 
      $('.chooseColor').click(function () {
        html += '<button class="blue">Blue</button>';
        html += '<button class="red">Red</button>';

        $('.color').html(html);
      });
      console.log("states");
      // console.log(states);
      console.log(states.layer);

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
          'color': 'yellow'
        });
      });

      $('.enableDrag').click(function () {
        map.dragging.enable();
      });

      console.log("states");
      console.log(states);

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
          console.log(union);

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
  });

});