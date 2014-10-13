jQuery(document).ready(function () {
  var map = Drupal.settings.leaflet[0].lMap;
  console.log(map);
  var punts = Drupal.settings.ppp_mapes.punts.features;
  console.log(punts);
  var markers = L.markerClusterGroup();
  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
  var geoJsonLayer = L.geoJson(punts, {
      //onEachFeature: function (feature, layer) {
        //layer.bindPopup(feature.properties.address);
      //},
      pointToLayer: function (feature, latlng) {
        // Todo que vingui una settings amb correspindencia valor - icona
        switch (feature.properties.field_sector_subsectors) {
          case 'Alimentació': 
            var customicon = L.icon({
              iconUrl: 'https://pbs.twimg.com/profile_images/3542667806/b8fbeb7dbfa909e2a638fb4c0fc3392c_400x400.png',
              iconSize: [38, 95],
              iconAnchor: [22, 94],
              popupAnchor: [-3, -76]
            });
            return L.marker(latlng, {icon: customicon});
        }
        return L.marker(latlng);
      }

  });
  markers.addLayer(geoJsonLayer);

  map.addLayer(markers);
  map.fitBounds(markers.getBounds());


});

(function ($, Drupal, window, document, undefined) {
Drupal.behaviors.ppp_mapes = {
  attach: function(context, settings) {
  /**
   * widgets del selector
   */
  jQuery('#widget-filter-1').chosen();

  }
};


})(jQuery, Drupal, this, this.document);
