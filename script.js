var map = L.map('mapid').setView([40.91, -96.63], 4);
var noMarkers= null;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

var gisDay = L.esri.Geocoding.featureLayerProvider({
	url: 'https://services.arcgis.com/uCXeTVveQzP4IIcx/arcgis/rest/services/GIS_Day_Final/FeatureServer/0',
	searchFields: ['Country', 'State', 'City'], // Search these fields for text matches
	label: 'GIS Day Events', // Group suggestions under this header
	formatSuggestion: function(feature){
	  return feature.properties.Name + ' - ' + feature.properties.Organization; // format suggestions like this.
	}
  });

var searchControl = L.esri.Geocoding.geosearch({
  providers: [
	arcgisOnline, gisDay
	// L.esri.Geocoding.mapServiceProvider({
	//   label: 'States and Counties',
	//   url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
	//   layers: [2, 3],
	//   searchFields: ['NAME', 'STATE_NAME']
	// })

  ],
 // position:'topright'
}).addTo(map);


var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
	//draw:false,
	draw: {
		marker: false,
		polyline: false,
		circlemarker: false,
		circle: false
	},
	edit: {
		featureGroup: drawnItems
	}
});
map.addControl(drawControl);
var layerone = new L.layerGroup();
var layerShape = new L.layerGroup();

map.on(L.Draw.Event.CREATED, function (e) {
	var type = e.layerType,
		layer = e.layer;
	//if (type === 'polygon') {
		// Do marker specific actions
		noMarkers = document.getElementById('getno').value
		
		randomPointInPoly(layer,noMarkers)

	//}
	// Do whatever else you need to. (save to db; add to map etc)
	//map.addLayer(layer);
	layer.addTo(layerShape).addTo(map);
	
	
 });
 
 // define the function
randomPointInPoly = function(polygon, noMarkers) {
    var bounds = polygon.getBounds(); 
    var x_min  = bounds.getEast();
    var x_max  = bounds.getWest();
    var y_min  = bounds.getSouth();
	var y_max  = bounds.getNorth();
	let cnt=1;
for(let i = 0;i<noMarkers;i++){
    var lat = y_min + (Math.random() * (y_max - y_min));
    var lng = x_min + (Math.random() * (x_max - x_min));

    var point  = turf.point([lng, lat]);
    var poly   = polygon.toGeoJSON();
    var inside = turf.inside(point, poly);

    if (inside) {
		//return point
		L.geoJson(point).addTo(layerone);
		//console.log([lng, lat])
		LatLongs.push([cnt,lng,lat]);
		$('#cont').append('<li><b>'+cnt+'</b> '+lat+'  '+lng+'</li>');
		cnt++
	
    } else {
		// return randomPointInPoly(polygon)
		noMarkers++
	}
	
	
}
console.log(layerone._layers)
	layerone.addTo(map)
	//console.log(LatLongs)
	$('.float').prepend('<button id=downloadExel>Download Exel</button>' )

//	exportToCsv(LatLongs)
}

var LatLongs = [['No','Longitude','Latitude']]
function clear(){
	
	map.removeLayer(layerone)
	map.removeLayer(layerShape)
	drawnItems.clearLayers()
	$('#cont li').remove()
}
$(document).on('click','#clear', clear)
$(document).on('click','#downloadExel', function(){ exportToCsv(LatLongs)})
// create a poly
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);



exportToCsv = function(Results) {
let fileName = document.getElementById('name').value +'.csv'

	var CsvString = "";
	Results.forEach(function(RowItem, RowIndex) {
	  RowItem.forEach(function(ColItem, ColIndex) {
		CsvString += ColItem + ',';
	  });
	  CsvString += "\r\n";
	});
	CsvString = "data:application/csv," + encodeURIComponent(CsvString);
	var x = document.createElement("A");
	x.setAttribute("href", CsvString );
	x.setAttribute("download",fileName);
	document.body.appendChild(x);
	x.click();
  }

// get a geojson point from the function
//var point = randomPointInPoly(polygon);

// .. or add it to the map directly from the result
//L.geoJson(randomPointInPoly(polygon)).addTo(map);