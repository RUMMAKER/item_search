var divResult;
var divSearch;
var txtDistance;
var txtPostal;
var ddlLocation;
var txtSearch;
var btnSearch;
var googlemap;
var geocoder;

// Init should be called once google maps api finishes loading.
function init() {
	// Set references to UI stuff
	divResult = document.getElementById("divResult");
	divSearch = document.getElementById("divSearch");
	txtDistance = document.getElementById("txtDistance");
	txtPostal = document.getElementById("txtPostal");
	ddlLocation = document.getElementById("ddlLocation");
	txtSearch = document.getElementById("txtSearch");
	btnSearch = document.getElementById("btnSearch");

	// Init map
	googlemap = new GoogleMap(() => {
		divResult.style.display = "none";
		btnSearch.disabled = false;
	});
	geocoder = new google.maps.Geocoder();
}

// Return promise that resolves with the geographical coordinates of user's position, or rejects with error.
function getCurrentLocation() {
	return new Promise((resolve, reject)=>{
		navigator.geolocation.getCurrentPosition((position) => {
			var currPos = {lat: position.coords.latitude, lng: position.coords.longitude};
			resolve(currPos);
		}, (error) => {
			reject(error);
		});
	});
}

// Return promise that resolves with the geographical coordinates of the postalCode, or rejects with geocoder api status.
function postalToGeo(postalCode) {
	return new Promise((resolve, reject)=>{
		var req = {componentRestrictions: {country: "CA"}, address: postalCode};
		geocoder.geocode(req, (result, status) => {
			if (status != google.maps.GeocoderStatus.OK) {
				reject(status);
			} else {
				var lat = result[0].geometry.location.lat();
				var lng = result[0].geometry.location.lng();
				resolve({lat:lat,lng:lng});
			}
		});
	});
}

// Get currentLocation using user position or postal code.
function getLocation() {
	var location;
	if (ddlLocation.options[ddlLocation.selectedIndex].value === "1") { 
		location = getCurrentLocation();
	} else { 
		// Use postalCode for map center.
		if (txtPostal.value.trim().length == 0) {
			location = getCurrentLocation();
		} else {
			location = postalToGeo(txtPostal.value);
		}
	}
	return location;
}

// Search for item in nearby stores then display results on map.
function itemSearch() {
	getLocation()
	.then((loc) => {
		var distance = txtDistance.value * 1000;
		var itemQuery = txtSearch.value;

		bestbuy.getNearbyStores(loc, distance)
		.then((stores) => {
			for (var i = 0; i < stores.length; i++) {
				markStoreIfContainItem(itemQuery, stores[i].store);
			}
		}).then(() => {
			// Center map on location.
			googlemap.clearMarkers();
			googlemap.setSearchCenter(loc);
			googlemap.setSearchRange(distance);
			googlemap.setSearchCenter(loc);
		});
	})
	.catch(() => {
		console.log('something went wrong...');
	});
}

// Use best buy api to check if an item (itemQuery should be item name)
// is sold in store. Create marker and infowindow on map at the location of store if item is sold in store.
function markStoreIfContainItem(itemQuery, store) {
	bestbuy.getItemsInStore(itemQuery, store.id)
	.then((items) => {
		if (items.length > 0) {
			var lat = store.storeDetails.latitude;
			var lng = store.storeDetails.longitude;
			var marker = googlemap.createMarker({lat: 1*lat, lng: 1*lng});
			var content = itemsToString(store, items);
			googlemap.addResultListener(() => {
				divResult.innerHTML = content;
				divResult.style.display = "block";
				divSearch.style.display = "none";
			}, () => {
				divResult.style.display = "none";
				divSearch.style.display = "block";
			}, marker);
		}
	})
	.catch(() => {console.log('markStore went wrong...')});
}

// Helper function to convert api response to innerHtml content for display purposes.
function itemsToString(store, items) {
	var itemStr = '';
	for (var i = 0; i < items.length && i < 3; i++) {
		var imgStr = '';
		if (items[i].summary.media.primaryImage != undefined) {
			imgStr = '<img src="' + items[i].summary.media.primaryImage.thumbnailUrl + '">';
		}
		itemStr += '<br><p>' + imgStr + items[i].summary.names.short + '</p>';
	}
	return  '<h1>' + store.storeDetails.name + '(Best Buy)' + '</h1>'+
            '<p> Top 3 relevant items in store:</p>'+ itemStr;
}

// Restricts distanceField value to 1-10
// if user enters NaN will change value to 1
function restrictDistanceInput() {
	if (isNaN(txtDistance.value)) {
		txtDistance.value = 1;
	}
	if (txtDistance.value * 1 > 10) {
		txtDistance.value = 10;
	}
	if (txtDistance.value * 1 < 1) {
		txtDistance.value = 1;
	}
}

// Show/Hide txtPostalCode depending on ddlLocation value.
function changeLocationType() {
	var locType = ddlLocation.options[ddlLocation.selectedIndex].value;
	if (locType === "1") {
		txtPostal.style.display = "none";
	}
	else {
		txtPostal.style.display = "inline";
	}
}