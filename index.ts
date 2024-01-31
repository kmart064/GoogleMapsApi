let infoWindow: google.maps.InfoWindow;
let map: google.maps.Map;
enum PriceLevel {
  Free = 0,
  Inexpensive,
  Moderate,
  Expensive,
  Very_Expensive,
  Unknown
}

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
		fields: ['geometry', 'place_id'],
  };

  let service = new PlacesService(map);
	const textSearchPromise = new Promise((resolve, reject) => {
		service.textSearch(request, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					createMarker(results[i], infoWindow);
				}
				map.setCenter(results[0].geometry.location);
				resolve(results);
			}
			else {
				reject("The call to the PlacesAPI textSearch failed with code: " + status);
			}
		});
	});
	textSearchPromise.then((res: google.maps.places.PlaceResult[]) => {
    for (let i = 0; i < res.length; i++) {
      var request = {
        placeId: res[i].place_id,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'price_level', 'geometry', 'place_id'],
      };
      service.getDetails(request, function(result, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          createMarker(result, infoWindow);
        }
      });
    }
  }, (error) => {
		alert(error);
	});
}

/**
 * Places a Marker on the Map for a given PlaceResult.
 * Also adds an InfoWindow to the marker that will pop up when
 * the marker is clicked, containing information, such as
 * the name, address, and placeId for the place.
 * @param place A PlaceResult obtained from querying the PlacesAPI
 * 	for a specific place, which should contain at least the name,
 * 	placeId, formatted address, and geometry.
 */
function createMarker(place: google.maps.places.PlaceResult, infoWindow: google.maps.InfoWindow) {
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

    const placeAddressElement = document.createElement("p");
    placeAddressElement.textContent = place.formatted_address;
    content.appendChild(placeAddressElement);
		
		const phoneNumberElement = document.createElement("p");
    phoneNumberElement.textContent = place.formatted_phone_number;
    content.appendChild(phoneNumberElement);

    const websiteElement = document.createElement("p");
    websiteElement.textContent = place.website;
    content.appendChild(websiteElement);

    const priceLevelElement = document.createElement("p");
    let priceLevel: PriceLevel;
    if (place.price_level) {
      priceLevel = place.price_level;
    }
    else {
      priceLevel = PriceLevel.Unknown;
    }
		priceLevelElement.textContent = "Price level: " + PriceLevel[priceLevel];
		content.appendChild(priceLevelElement);
    
    infoWindow.setContent(content);
	  infoWindow.open({
			anchor: marker,
			map,
	  });
	});
}

initMap();