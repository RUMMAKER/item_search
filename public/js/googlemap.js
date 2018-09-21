var GoogleMap = function (callback) {
	this.map; // google.maps.Map
	this.geocoder; // google.maps.Geocoder
	var mapMarkers = []; // references to existing google.maps.Marker
	var rangeCircle; // google.maps.Circle

	// Convert distance (in meters) to the zoom level to use for this.map
	this.distanceToZoom = function(distance) {
		return 25-Math.log(distance)/Math.LN2;
	}

	// Add listener to callback when user hovers over marker.
	// And listener to callback2 when user mouse out marker.
	this.addResultListener = function(callback, callback2, marker) {
        marker.addListener('mouseover', function() {
			callback();
        });
        marker.addListener('mouseout', function() {
			callback2();
        });
	}

	// Create marker at postion on map
	this.createMarker = function(position) {
		if (this.map === undefined) return undefined;
		var marker = new google.maps.Marker({map:this.map,position:position});
		mapMarkers.push(marker);
		return marker;
	}

	// Clear all markers from map
	this.clearMarkers = function() {
		if (this.map === undefined) return;
		for (var i = 0; i < mapMarkers.length; i++) {
			mapMarkers[i].setMap(null);
		}
		mapMarkers = [];
	}

	// Change the radius of rangeCircle, also create rangeCircle if it is not initialized yet
	this.setRange = function(range) {
		if (this.map === undefined) return;

		if (rangeCircle === undefined) {
			rangeCircle = new google.maps.Circle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 1.5,
				fillColor: '#FF0000',
				fillOpacity: 0.3,
				map: this.map,
				center: this.map.getCenter(),
				radius: range
			});
		}
		rangeCircle.setCenter(this.map.getCenter());
		rangeCircle.setRadius(range);
	}

	// Change zoom level of map according to distance, also calls setRange and sets range according to distance
	this.updateZoom = function(distance) {
		if (this.map === undefined) return;
		this.map.setZoom(this.distanceToZoom(distance));
		this.setRange(distance);
	}

	// Returns LatLngLiteral of this.map.getCenter
	this.getMapCenter = function() {
		if (this.map === undefined) return undefined;
		var lat = this.map.getCenter().lat();
		var lng = this.map.getCenter().lng();
		var center = {lat: 1*lat, lng: 1*lng};
		return center;
	}

	this.centerMapOnLocation = function(coord) {
		if (this.map === undefined) return new Promise((resolve, reject)=>{reject();});
		return new Promise((resolve, reject)=>{
				this.map.setCenter(coord);
				resolve();
		});
	}

	// Create map
	this.map = new google.maps.Map(document.getElementById('map'), {
		gestureHandling:"none",
		disableDefaultUI:true,
		center:{lat: 0, lng: 0},
		maxZoom:16,
		minZoom:12,
		zoom:16
	});

	// Run the callback, currently the callback is used to init some UI stuff once google maps finishes loading
	// Maybe refactor to return promise instead
	callback();
}