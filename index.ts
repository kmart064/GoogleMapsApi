import { restaurantTypes } from "./restaurantTypes.js";
let infoWindow: google.maps.InfoWindow;
let map: google.maps.Map;
let directionsRenderer: google.maps.DirectionsRenderer;
let directionsService: google.maps.DirectionsService;
interface LocLatLng {
  lat: number
  lng: number
};
interface PlacesQuery {
  query: string
  responseMask: string
}
var placesResponse; // memory storage of the results of the most recent search query
let markerMap = new Map<string, google.maps.marker.AdvancedMarkerElement>(); // memory storage mapping of placeId's to map markers

const RESPONSE_MASK = "places.displayName.text,places.formatted_address,places.types,places.nationalPhoneNumber,places.websiteUri,places.location,places.id"

async function initMap(): Promise<void> {
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes") as google.maps.RoutesLibrary;
  infoWindow = new google.maps.InfoWindow();
	directionsRenderer = new DirectionsRenderer();
  directionsService = new DirectionsService();

	map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
			center: { lat: 35.6764, lng: 139.7600 }, //Tokyo
      mapId: 'DEMO_MAP_ID',
    }
  );
}

/**
 * Retrieves detailed location information (name, phone number, website, etc.) from 
 * the provided PlacesQuery, and places a Marker at each of these locations on the map.
 * @param req The PlacesQuery which should have a query parameter and the
 * 	desired response fields.
 */
async function findPlaces(req: PlacesQuery) {
	const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

	// reset the map and marker map upon a new search
	map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      mapId: 'DEMO_MAP_ID',
    }
  );
  markerMap.clear();
 
  placesResponse = await textSearchPlaces(req);

  // Mark the places on the map
  for (const place of placesResponse.places) {
    createMarker(place, infoWindow);
  }
  map.setCenter(new google.maps.LatLng(placesResponse.places[0].location.latitude, placesResponse.places[0].location.longitude));
}

/**
 * Sends a POST request to the Google Places API (new) textSearch
 * endpoint.
 * @param req The PlacesQuery which should have a query parameter and the
 * 	desired response fields.
 */
async function textSearchPlaces(req: PlacesQuery): Promise<string> {
  let endpoint = 'https://places.googleapis.com/v1/places:searchText'; 
  let data = { "textQuery": req.query };
  try {
    const request = await fetch(endpoint, { 
      method: "POST", 
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyCYtLFv-zDLUhBWy-whiBQx0WFlot_6dts",
        "X-Goog-FieldMask": req.responseMask
      },
    });
    
    const response = await request.json();
    return response;
  } catch (error) {
    alert(error);
  }
}

/**
 * Places a Marker on the Map for a given PlaceResult.
 * Also adds an InfoWindow to the marker that will pop up when
 * the marker is clicked, containing information, such as
 * the name, address, and placeId for the place.
 * @param place A PlaceResult obtained from querying the PlacesAPI
 * 	for a specific place, which should contain at least the name,
 * 	placeId, formatted address, lat and lng.
 */
async function createMarker(place, infoWindow: google.maps.InfoWindow) {
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  if (!place.location) return;
  
	const marker = new AdvancedMarkerElement({
	  map,
	  position: new google.maps.LatLng(place.location.latitude, place.location.longitude),
	});
  // Add the marker to the marker map
  markerMap.set(place.id, marker);
  
	google.maps.event.addListener(marker, "click", () => {
	  const content = document.createElement("div");

    const nameElement = document.createElement("h2");
    nameElement.textContent = place.displayName.text;
    content.appendChild(nameElement);

    const placeAddressElement = document.createElement("p");
    placeAddressElement.textContent = place.formattedAddress;
    content.appendChild(placeAddressElement);
		
		const phoneNumberElement = document.createElement("p");
    phoneNumberElement.textContent = place.nationalPhoneNumber;
    content.appendChild(phoneNumberElement);

    const websiteElement = document.createElement("p");
    websiteElement.textContent = place.websiteUri;
    content.appendChild(websiteElement);

    const typesElement = document.createElement("p");
		typesElement.textContent = toTitleCase(place.types.join(", ").replaceAll("_"," "));
		content.appendChild(typesElement);

		var directionsButton = document.createElement("button");
    directionsButton.innerHTML = 'Directions';
    directionsButton.onclick = function()
    {
      // Use HTML5 Geolocation API to get the user's current location as the starting point
			const findCurrentLocationPromise = new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos: LocLatLng = {
								lat: position.coords.latitude,
								lng: position.coords.longitude
							}
              resolve(pos);
            },
            () => {
              handleLocationError(true, infoWindow, map.getCenter());
            },
          )
        }
        else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
			});
      findCurrentLocationPromise.then((res: LocLatLng) => {
        getDirectionsToPlace(res, place.id);
      });
    }
		content.appendChild(directionsButton);
    
    infoWindow.setContent(content);
	  infoWindow.open({
			anchor: marker,
			map,
	  });
	});
}

// Filters the current location results for the selected restaurant type
document.getElementById('filter').onclick = () => {
  let restType = (<HTMLSelectElement>document.getElementById('restaurantType')).value;
	for (const place of placesResponse.places) {
    let found = false;
    for (const type of place.types) {
      // if the selected restaurant type is all, or if one of the types matches the selected type, show the marker
      if (restType == restaurantTypes[restaurantTypes.all] || type == restType) {
        found = true;
        break;
      }
    }
    if (!found) {
      // hide the marker
      markerMap.get(place.id).map = null;
    }
    else {
      // show the marker
      markerMap.get(place.id).map = map;
    }
  }
};

/**
 * Draws a route from the given source and destination on the map.
 * @param sourceLoc Must contain the latitude and longitude values for
 * 	the starting point using the LocLatLng interface
 * @param destPlaceId Must be a place_id string for the destination
 */
async function getDirectionsToPlace(sourceLoc: LocLatLng, destPlaceId: string, travelChoice: google.maps.TravelMode = google.maps.TravelMode.DRIVING) {
  var latLng = new google.maps.LatLng(sourceLoc.lat, sourceLoc.lng);
  directionsRenderer.setMap(map);
	directionsRenderer.setPanel(
    document.getElementById("sidebar") as HTMLElement
  );
  const control = document.getElementById("floating-panel") as HTMLElement;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  directionsService
    .route({
      origin: latLng,
      destination: {
        placeId: destPlaceId,
      },
      travelMode: travelChoice,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
    })
    .catch((e) => window.alert(e));
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
  );
  infoWindow.open(map);
}

document.getElementById('submit').onclick = () => {
  let userQuery = (<HTMLSelectElement>document.getElementById('search')).value;
  const request: PlacesQuery = {
    query: userQuery,
    responseMask: RESPONSE_MASK,
  };
  findPlaces(request);
};

/**
 * Capitalizes the first letter of each word in str
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

initMap();