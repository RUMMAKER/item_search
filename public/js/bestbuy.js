var BestBuy = function() {
	var bestbuyBaseUrl = 'https://bizhacks.bbycastatic.ca/mobile-si/si/';

	// Query best buy and find the closest 10 stores around position (position is a LatLngLiteral)
	// Filter results to only include stores within distance (in meters) of position
	// Returns promise, will resolve once query completes
	this.getNearbyStores = function(position, distance) {
		return client.get(bestbuyBaseUrl + 'stores/' + position.lat + ',' + position.lng + '?start=1&limit=10')
		.then(JSON.parse)
		.then((response) => {return response.si.response.stores.filter((response) => {
			return response.store.distance <= distance/1000; // keep stores which in distance
		})});
	}

	// Query best buy and find items(query = item name) sold in store with storeid
	// Returns promise, will resolve once query completes
	this.getItemsInStore = function(query, storeid) {
		return client.get(bestbuyBaseUrl + 'v3/products/search?query=' + query + '&sort=relevance%20desc&storeId=' + storeid + '&facetsOnly=false&lang=en')
		.then(JSON.parse)
		.then((response) => {return response.searchApi.documents.filter((response) => {
			if(response.summary.availability.pickup != null) {
				return response.summary.availability.pickup.available; // keep items with pickup avaliability
			}
		})});
	}
}

var bestbuy = new BestBuy();