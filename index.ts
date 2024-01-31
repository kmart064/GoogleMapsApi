let infoWindow: google.maps.InfoWindow;
let map: google.maps.Map;

async function initMap(): Promise<void> {
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  const { PlacesService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
  infoWindow = new google.maps.InfoWindow();

	// The location of Uluru
  const position = { lat: -25.344, lng: 131.031 };

	map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      center: position,
      mapId: 'DEMO_MAP_ID',
    }
  );

  var request = {
		query: 'restaurant',
		fields: ['name', 'formatted_address', 'types', 'geometry', 'place_id'],
  };

  let service = new PlacesService(map);
	service.textSearch(request, function(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i], infoWindow);
			}
			map.setCenter(results[0].geometry.location);
		}
	});
}

/**
 * Places a marker on the Map for a given PlaceResult.
 * Also adds an infoWindow to the marker that will pop up when
 * the marker is clicked, containing information, such as
 * the name, address, and placeId for the place.
 * @param place A PlaceResult obtained from querying the PlacesAPI
 * 	for a specific place, which should contain at least the name,
 * 	placeId, formatted address, and geometry.
 */
function createMarker(place: google.maps.places.PlaceResult, infoWindow) {
	if (!place.geometry || !place.geometry.location) return;
  
	const marker = new google.maps.Marker({
	  map,
	  position: place.geometry.location,
	});
  
	google.maps.event.addListener(marker, "click", () => {
	  const content = document.createElement("div");

    const nameElement = document.createElement("h2");
    nameElement.textContent = place.name;
    content.appendChild(nameElement);

    const placeIdElement = document.createElement("p");
    placeIdElement.textContent = place.place_id;
    content.appendChild(placeIdElement);

    const placeAddressElement = document.createElement("p");
    placeAddressElement.textContent = place.formatted_address;
    content.appendChild(placeAddressElement);

    if (place.types) {
      const placeTypeElement = document.createElement("p");
      placeTypeElement.textContent = place.types.join(", ");
      content.appendChild(placeTypeElement);
    }
    
    infoWindow.setContent(content);
	  infoWindow.open({
			anchor: marker,
			map,
	  });
	});
}

initMap();