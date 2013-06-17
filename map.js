var map;
function setup() {
  google.load('maps', '3', {other_params: 'key=' + mapKey + '&sensor=true', callback: initMap });
  window.addEventListener('message', msgHdlr);
}
function initMap() {
  var mapOptions = {
    center: new google.maps.LatLng(37.77, -122.41),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
function msgHdlr(e) {
  var vals = e.data.split(',');
  var ll = new google.maps.LatLng(vals[1], vals[2]);
  var marker = new google.maps.Marker({ position: ll, title: vals[0] });
  marker.setMap(map);
}

document.addEventListener('DOMContentLoaded', function() {
  document.removeEventListener('DOMContentLoaded', arguments.callee, false);
  setup();
}, false);
