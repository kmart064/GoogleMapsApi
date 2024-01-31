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
  infoWindow = new google.maps.InfoWindow();

	map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      mapId: 'DEMO_MAP_ID',
    }
  );

  var request = {
		query: 'restaurant',
		fields: ['geometry', 'place_id'],
  };

	await findPlaces(request);
}

/**
 * Retrieves detailed location information (name, phone number, website, etc.)
 * from the provided PlacesAPI TextSearchRequest. Will also filter the results
 * if a PriceLevel is provided, otherwise all possible locations will be shown.
 * @param req The TextSearchRequest which should have a query parameter and the
 * 	geometry and place_id fields.
 * @param priceLevel Optional. Will filter the results by price_level if 
 * 	provided.
 */
async function findPlaces(req: google.maps.places.TextSearchRequest, priceLevel?: PriceLevel) {
	const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	const { PlacesService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

	// reset the map upon a new search
	map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      mapId: 'DEMO_MAP_ID',
    }
  );

	let service = new PlacesService(map);
	const textSearchPromise = new Promise((resolve, reject) => {
		service.textSearch(req, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
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
      // Use the placeIds to get the detailed location information
			var request = {
        placeId: res[i].place_id,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'price_level', 'geometry', 'place_id'],
      };
      // if the price filter is set, only show places that match the price level
			if (priceLevel == null || priceLevel == res[i].price_level) {
				service.getDetails(request, function(result, status) {
					if (status === google.maps.places.PlacesServiceStatus.OK) {
						createMarker(result, infoWindow);
					}
				});
			}
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

// Adds a listener which sends a TextSearchRequest to the Places API with the selected priceLevel
document.getElementById('filter').onclick = () => {
  let priceLevel = (<HTMLSelectElement>document.getElementById('priceLevel')).value;
  var price;
  switch (priceLevel) {
    case ('free'):
      price = PriceLevel.Free;
      break;
    case ('inexpensive'):
      price = PriceLevel.Inexpensive;
      break;
    case ('moderate'):
      price = PriceLevel.Moderate;
      break;
    case ('expensive'):
      price = PriceLevel.Expensive;
      break;
    case ('very_expensive'):
      price = PriceLevel.Very_Expensive;
      break;
    default:
      price = null;
  }
  var request = {
    query: 'restaurant',
    fields: ['geometry', 'place_id', 'price_level'],
  };
  findPlaces(request, price);
};

initMap();