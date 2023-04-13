// Define the tile layer that will serve as the background of the map.
var tileLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });
  
// Create the map object with some initial options.
var map = L.map("map", {
    center: [38.7, -118.5],
    zoom: 5
});

// Add the tile layer to the map.
tileLayer.addTo(map);

// Use D3 to load earthquake data from a GeoJSON file.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

    // Define a function to determine the size and color of each earthquake marker.
    function styleInfo(feature) {
        return {
            opacity: 0.3,
            fillOpacity: .8,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
        };
    }
  
    // Define a function to determine the color of the marker based on the depth of the earthquake.
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }
  
    // Define a function to determine the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
        return magnitude <= 0 ? 1 : magnitude * 5;
    }

    // Add a GeoJSON layer to the map.
    L.geoJson(data, {
        // Use circle markers to represent each earthquake.
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        // Apply the style defined by the styleInfo function to each marker.
        style: styleInfo,
        // Add a popup to each marker showing some details about the earthquake.
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: " + feature.properties.mag +
                "<br>Depth in KM: " + feature.geometry.coordinates[2] +
                "<br>Location Details: " + feature.properties.place
            );
        }
    }).addTo(map);

    // Create a legend control object.
    var legend = L.control({position: "bottomright"});

    // Add the legend to the map.
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");
        var depths = [-10, 10, 30, 50, 70, 90];
        var colors = ["#F0FF00", "#D4FF00", "#AAFF00", "#FF9300", "#FF8300", "#FF2A00"];
      div.innerHTML += "<h3>Depth in KM<h3>"
      // Looping through the depth intervals to generate a label with a colored square for each interval.
      for (var x = 0; x < depths.length; x++) {
        div.innerHTML += "<i style='background: " + colors[x] + "'></i> "
          + depths[x] + (depths[x + 1] ? "&ndash;" + depths[x + 1] + "<br>" : "+");
      }
      
      return div;
    };
  
    // Finally, we our legend to the map.
    legend.addTo(map);
  });