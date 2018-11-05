var GoogleMap = function (callback) {
	this.map; // google.maps.Map
	this.geocoder; // google.maps.Geocoder
	var mapMarkers = []; // references to existing google.maps.Marker

	var centerOffsetX = 0; // offsets map center from searchCenter by vw.
	this.searchCenter; // center of rangeCircle
	this.searchRange; // radius of rangeCircle
	var rangeCircle; // google.maps.Circle

	// Add listener to callback when user clicks over marker.
	this.addResultListener = function(callback, marker) {
        marker.addListener('click', function() {
			callback();
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
	this.setSearchRange = function(range) {
		if (this.map === undefined) return;
		this.searchRange = range;
		if (rangeCircle === undefined) {
			rangeCircle = new google.maps.Circle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 1.5,
				fillColor: '#FF0000',
				fillOpacity: 0.3,
				map: this.map,
				center: this.searchCenter,
				radius: this.searchRange
			});
		}
		rangeCircle.setCenter(this.searchCenter);
		rangeCircle.setRadius(this.searchRange);
		this.map.fitBounds(rangeCircle.getBounds());
	}

	// Center map on searchCenter + centerOffsetX
	this.setSearchCenter = function(coord) {
		if (this.map === undefined) return;
		this.searchCenter = coord;
		this.map.setCenter(this.searchCenter);
		this.map.panBy(vwToPx(centerOffsetX), 0);
	}

	this.resize = function() {
		this.setSearchCenter(this.searchCenter);
		this.setSearchRange(this.searchRange);
		this.setSearchCenter(this.searchCenter);
	}

	// Create map
	this.map = new google.maps.Map(document.getElementById('map'), {
		gestureHandling:"none",
		disableDefaultUI:true,
		center:{lat: 49.1987, lng: 122.8125},
		maxZoom:16,
		minZoom:11,
		zoom:16
	});
	this.searchCenter = this.map.getCenter();

	self = this;
	google.maps.event.addDomListener(window, "resize", function() {
		google.maps.event.trigger(self.map, "resize");
		if (rangeCircle != undefined) {
			self.resize();
		}
	});

	// Run the callback, currently the callback is used to init some UI stuff once google maps finishes loading
	// Maybe refactor to return promise instead
	callback();
}