jQuery(document).ready(function () {
  var map = Drupal.settings.leaflet[0].lMap;
  var punts = Drupal.settings.ppp_mapes.punts.features;
  console.log(punts);
  var geoJsonLayer = L.geoJson(punts, {
    pointToLayer: function (feature, latlng) {
      return custom_ptl(feature, latlng);
    }
  });
  var markers = L.markerClusterGroup();
  markers.addLayer(geoJsonLayer);
  map.addLayer(markers);
  Drupal.settings.ppp_mapes.cluster_layer = markers;
  map.fitBounds(markers.getBounds());

  // Correccions menors d'estil i usabilitat.
  jQuery('input#edit-s1').attr('placeholder', Drupal.settings.ppp_mapes_theme.placeholder);
  jQuery('label[for=edit-s1]').hide();
  jQuery('#edit-s1-wrapper .views-widget .form-item-s1').append('<div id="search-subtitle">' + Drupal.settings.ppp_mapes_theme.subtitle + '</div>');
});

(function ($, Drupal, window, document, undefined) {
Drupal.behaviors.ppp_mapes = {
  attach: function(context, settings) {
    /**
     * widgets del selector
     */
    jQuery('#widget-filter-1').chosen();
    jQuery('#widget-filter-1').change(function () {
      reload_map();
    });
    jQuery('#filter-2 .sector').click(function (e) {
      e.preventDefault();
      jQuery(this).toggleClass('active');
      reload_map();
    });
    jQuery('#filter-2 .sector').mouseenter(function () {
      jQuery('#filter-2-label-box').text(jQuery(this).text());
    });
    jQuery('#filter-2 .sector').mouseleave(function () {
      jQuery('#filter-2-label-box').text('');
    });
    jQuery('#filter-3 .criteris').click(function (e) {
      e.preventDefault();
      jQuery(this).toggleClass('active');
      reload_map();
    });
    jQuery('#filter-3 .criteris').mouseenter(function () {
      jQuery('#filter-3-label-box').text(jQuery(this).text());
    });
    jQuery('#filter-3 .criteris').mouseleave(function () {
      jQuery('#filter-3-label-box').text('');
    });
 
    /**
     * Exposeds com a ajax
     */
    jQuery('#views-exposed-form-punts-del-mapa-page-1').submit(function(e) {
      e.preventDefault();
      var form = jQuery(this),
        url = form.attr( "action" );
      var params = {};
      form.find('input[type=text]').each(function () {
        params[jQuery(this).attr('name')] = jQuery(this).val();
      });
      var posting = $.get( url, params );
      posting.done(function( data ) {
      Drupal.settings.ppp_mapes.punts = data;
        reload_map();
      });
    });

    /**
     * Pestanyes de centrat
     */
    var map = Drupal.settings.leaflet[0].lMap;
    jQuery('#tabs-wrapper #centred-tab-usr').click(function () {
      map.locate({ setView: true });
    });
    jQuery('#tabs-wrapper #centred-tab-cat').click(function () {
      map.setView(new L.LatLng(41.7,2), 8);
    });
    jQuery('#tabs-wrapper #centred-tab-bcn').click(function () {
      map.setView(new L.LatLng(41.4,2.1), 11);
    });

  }
};
})(jQuery, Drupal, this, this.document);


/**
 * funcions auxiliars
 */
function reload_map() {
  var map = Drupal.settings.leaflet[0].lMap;
  map.removeLayer(Drupal.settings.ppp_mapes.cluster_layer); 
  if(Drupal.settings.ppp_mapes.punts.features.length == 0) {
    return;
  }
  // Array de tids de terriori
  var t_tids = jQuery('#widget-filter-1').val();
  var s_tids = [];
  var c_tids = [];
  jQuery('#filter-2 .sector.active').each(function () {
    s_tids.push(jQuery(this).attr('data-value'));
  });
  jQuery('#filter-3 .criteris.active').each(function () {
    c_tids.push(jQuery(this).attr('data-value'));
  });
  geoJsonLayer = L.geoJson(Drupal.settings.ppp_mapes.punts.features, {
      filter: function (feature, layer) {
        // filtre territorial
        if(t_tids != null) {
          var flag = false;
          var features_tids = feature.properties.field_territori.split('-');
          for (var i=0, len = features_tids.length; i < len ; i++) {
            if(features_tids[i] != '') {
              var t = features_tids[i];
              if(t_tids.indexOf(t) > -1) {
                flag = true;
              }
            }
          }
          if(!flag) {return false;}
        }

        // filtre sectors
        if(s_tids.length > 0) {
          var flag = false;
          if(feature.properties.field_sector_subsectors != null) {
            var features_tids = feature.properties.field_sector_subsectors.split('-');
            for (var i=0, len = features_tids.length; i < len ; i++) {
              if(features_tids[i] != '') {
                var t = features_tids[i];
                if(s_tids.indexOf(t) > -1) {
                  flag = true;
                }
              }
            }
            if(!flag) {return false;}
          }
        }

        // filtre criteris
        if(c_tids.length > 0) {
          var flag = false;
          if(feature.properties.field_llista_criteris_claus != null) {
            var features_tids = feature.properties.field_llista_criteris_claus.split('-');
            for (var i=0, len = features_tids.length; i < len ; i++) {
              if(features_tids[i] != '') {
                var t = features_tids[i];
                if(c_tids.indexOf(t) > -1) {
                  flag = true;
                }
              }
            }
            if(!flag) {return false;}
          }
        }

        return true;
      },
      pointToLayer: function (feature, latlng) {
        return custom_ptl(feature, latlng);
      }
  });
  var markers = L.markerClusterGroup();
  markers.addLayer(geoJsonLayer);
  map.addLayer(markers);
  Drupal.settings.ppp_mapes.cluster_layer = markers;
  map.fitBounds(markers.getBounds());
}

function show_point(e) {
  jQuery('#preview #preview-content-wrapper').html(e.target.feature.properties.nothing).fadeIn(400);
}

function custom_ptl(feature, latlng) {
  var icon_url = Drupal.settings.basePath + '/sites/all/themes/pamapam/images/map/';
  var icon = {
    iconUrl: icon_url + 'fin.png',
    iconSize: [34, 47],
    iconAnchor: [34, 47]
  };
  if(feature.properties.field_sector_subsectors != null) {
    var sectors = feature.properties.field_sector_subsectors.split('-');
    for (var i=0, len = sectors.length; i < len ; i++) {
      if(sectors[i] != '') {
        var s = sectors[i];
        switch(s) {
          case '12': //Alimentacio
            icon.iconUrl = icon_url + 'ali.png';
            break;
          case '21': //assesorament
            icon.iconUrl = icon_url + 'ase.png';
            break;
          case '15': //comunicacio
            icon.iconUrl = icon_url + 'tec.png';
            break;
          case '13': //cultura
            icon.iconUrl = icon_url + 'cul.png';
            break;
          case '16': //cures
            icon.iconUrl = icon_url + 'cur.png';
            break;
          case '14': //educacio
            icon.iconUrl = icon_url + 'edu.png';
            break;
          case '23': //xarxes
            icon.iconUrl = icon_url + 'xar.png';
            break;
          case '20': //financament
            icon.iconUrl = icon_url + 'fin.png';
            break;
          case '10': //habitatge
            icon.iconUrl = icon_url + 'hab.png';
            break;
          case '22': //logistica
            icon.iconUrl = icon_url + 'log.png';
            break;
          case '18': //oci
            icon.iconUrl = icon_url + 'oci.png';
            break;
          case '11': //vestir
            icon.iconUrl = icon_url + 'ves.png';
            break;
        }
      }
    }
    return  L.marker(latlng, {icon: L.icon(icon)}).bindLabel(feature.properties.title, {offset: [-100,-90]}).on('click', show_point);
  }
  return L.marker(latlng).bindLabel(feature.properties.title, {offset: [-50,-100]}).on('click', show_point);
}
