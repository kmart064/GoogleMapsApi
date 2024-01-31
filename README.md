# GoogleMapsApi

This is a project for utilizing various APIs from GoogleMaps to locate any desired facility and find detailed information, as well as an efficient route to get there from your current location.

## Installation

Note: a portable, zipped project is available in the repository for immediate use. If you'd prefer to install it manually, please follow the directions below.

1. Download the files from this repo into an empty folder of your choice.
2. You will need to download the DefinitelyTyped project to the directory you chose in step 1.
   
From: https://developers.google.com/maps/documentation/javascript/using-typescript

The DefinitelyTyped project is an open source project that maintains type declaration files for many packages including Google Maps. The Google Maps JavaScript declaration files (see source files on GitHub) can be installed using NPM from the @types/google.maps package.
```bash
npm i -D @types/google.maps
```
3. Open the folder with VSCode, run the command:
```bash
tsc
```
4. After transpiling, launch index.html with a local development server (such as Live Server).

## Usage

When the page first loads, you should see the map centered near Tokyo, Japan, with no markers. You can then search for any kind of place or facility in the search box and click submit to find multiple relevant locations based on your query. You can click on any of the markers to bring up an info window with details about the location, such as the name, phone number, address, etc.

You can also filter the locations by price level by selecting a desired level from the price dropdown and clicking filter. Finally, you can generate a route and directions to any of the markers by clicking the Directions button in the info window. You will be asked for permission to share your current location if you wish to receive directions, which is required for this application.

## License

[MIT](https://choosealicense.com/licenses/mit/)
