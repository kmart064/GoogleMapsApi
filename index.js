var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { restaurantTypes } from "./restaurantTypes.js";
var infoWindow;
var map;
var directionsRenderer;
var directionsService;
;
var placesResponse; // memory storage of the results of the most recent search query
var markerMap = new Map(); // memory storage mapping of placeId's to map markers
var RESPONSE_MASK = "places.displayName.text,places.formatted_address,places.types,places.nationalPhoneNumber,places.websiteUri,places.location,places.id";
function initMap() {
    return __awaiter(this, void 0, void 0, function () {
        var Map, _a, DirectionsService, DirectionsRenderer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, google.maps.importLibrary("maps")];
                case 1:
                    Map = (_b.sent()).Map;
                    return [4 /*yield*/, google.maps.importLibrary("routes")];
                case 2:
                    _a = _b.sent(), DirectionsService = _a.DirectionsService, DirectionsRenderer = _a.DirectionsRenderer;
                    infoWindow = new google.maps.InfoWindow();
                    directionsRenderer = new DirectionsRenderer();
                    directionsService = new DirectionsService();
                    map = new Map(document.getElementById('map'), {
                        zoom: 14,
                        center: { lat: 35.6764, lng: 139.7600 }, //Tokyo
                        mapId: 'DEMO_MAP_ID',
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Retrieves detailed location information (name, phone number, website, etc.) from
 * the provided PlacesQuery, and places a Marker at each of these locations on the map.
 * @param req The PlacesQuery which should have a query parameter and the
 * 	desired response fields.
 */
function findPlaces(req) {
    return __awaiter(this, void 0, void 0, function () {
        var Map, _i, _a, place;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, google.maps.importLibrary("maps")];
                case 1:
                    Map = (_b.sent()).Map;
                    // reset the map and marker map upon a new search
                    map = new Map(document.getElementById('map'), {
                        zoom: 14,
                        mapId: 'DEMO_MAP_ID',
                    });
                    markerMap.clear();
                    return [4 /*yield*/, textSearchPlaces(req)];
                case 2:
                    placesResponse = _b.sent();
                    // Mark the places on the map
                    for (_i = 0, _a = placesResponse.places; _i < _a.length; _i++) {
                        place = _a[_i];
                        createMarker(place, infoWindow);
                    }
                    map.setCenter(new google.maps.LatLng(placesResponse.places[0].location.latitude, placesResponse.places[0].location.longitude));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends a POST request to the Google Places API (new) textSearch
 * endpoint.
 * @param req The PlacesQuery which should have a query parameter and the
 * 	desired response fields.
 */
function textSearchPlaces(req) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, data, request, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'https://places.googleapis.com/v1/places:searchText';
                    data = { "textQuery": req.query };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(endpoint, {
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: {
                                "Content-Type": "application/json",
                                "X-Goog-Api-Key": "AIzaSyCYtLFv-zDLUhBWy-whiBQx0WFlot_6dts",
                                "X-Goog-FieldMask": req.responseMask
                            },
                        })];
                case 2:
                    request = _a.sent();
                    return [4 /*yield*/, request.json()];
                case 3:
                    response = _a.sent();
                    return [2 /*return*/, response];
                case 4:
                    error_1 = _a.sent();
                    alert(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
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
function createMarker(place, infoWindow) {
    return __awaiter(this, void 0, void 0, function () {
        var AdvancedMarkerElement, marker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, google.maps.importLibrary("marker")];
                case 1:
                    AdvancedMarkerElement = (_a.sent()).AdvancedMarkerElement;
                    if (!place.location)
                        return [2 /*return*/];
                    marker = new AdvancedMarkerElement({
                        map: map,
                        position: new google.maps.LatLng(place.location.latitude, place.location.longitude),
                    });
                    // Add the marker to the marker map
                    markerMap.set(place.id, marker);
                    google.maps.event.addListener(marker, "click", function () {
                        var content = document.createElement("div");
                        var nameElement = document.createElement("h2");
                        nameElement.textContent = place.displayName.text;
                        content.appendChild(nameElement);
                        var placeAddressElement = document.createElement("p");
                        placeAddressElement.textContent = place.formattedAddress;
                        content.appendChild(placeAddressElement);
                        var phoneNumberElement = document.createElement("p");
                        phoneNumberElement.textContent = place.nationalPhoneNumber;
                        content.appendChild(phoneNumberElement);
                        var websiteElement = document.createElement("p");
                        websiteElement.textContent = place.websiteUri;
                        content.appendChild(websiteElement);
                        var typesElement = document.createElement("p");
                        typesElement.textContent = toTitleCase(place.types.join(", ").replaceAll("_", " "));
                        content.appendChild(typesElement);
                        var directionsButton = document.createElement("button");
                        directionsButton.innerHTML = 'Directions';
                        directionsButton.onclick = function () {
                            // Use HTML5 Geolocation API to get the user's current location as the starting point
                            var findCurrentLocationPromise = new Promise(function (resolve, reject) {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(function (position) {
                                        var pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        };
                                        resolve(pos);
                                    }, function () {
                                        handleLocationError(true, infoWindow, map.getCenter());
                                    });
                                }
                                else {
                                    // Browser doesn't support Geolocation
                                    handleLocationError(false, infoWindow, map.getCenter());
                                }
                            });
                            findCurrentLocationPromise.then(function (res) {
                                getDirectionsToPlace(res, place.id);
                            });
                        };
                        content.appendChild(directionsButton);
                        infoWindow.setContent(content);
                        infoWindow.open({
                            anchor: marker,
                            map: map,
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// Filters the current location results for the selected restaurant type
document.getElementById('filter').onclick = function () {
    var restType = document.getElementById('restaurantType').value;
    for (var _i = 0, _a = placesResponse.places; _i < _a.length; _i++) {
        var place = _a[_i];
        var found = false;
        for (var _b = 0, _c = place.types; _b < _c.length; _b++) {
            var type = _c[_b];
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
function getDirectionsToPlace(sourceLoc, destPlaceId, travelChoice) {
    if (travelChoice === void 0) { travelChoice = google.maps.TravelMode.DRIVING; }
    return __awaiter(this, void 0, void 0, function () {
        var latLng, control;
        return __generator(this, function (_a) {
            latLng = new google.maps.LatLng(sourceLoc.lat, sourceLoc.lng);
            directionsRenderer.setMap(map);
            directionsRenderer.setPanel(document.getElementById("sidebar"));
            control = document.getElementById("floating-panel");
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
            directionsService
                .route({
                origin: latLng,
                destination: {
                    placeId: destPlaceId,
                },
                travelMode: travelChoice,
            })
                .then(function (response) {
                directionsRenderer.setDirections(response);
            })
                .catch(function (e) { return window.alert(e); });
            return [2 /*return*/];
        });
    });
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.");
    infoWindow.open(map);
}
document.getElementById('submit').onclick = function () {
    var userQuery = document.getElementById('search').value;
    var request = {
        query: userQuery,
        responseMask: RESPONSE_MASK,
    };
    findPlaces(request);
};
/**
 * Capitalizes the first letter of each word in str
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
initMap();
//# sourceMappingURL=index.js.map