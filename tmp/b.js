var resCoordinateArray = [];
var resObj = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": []
    },
    "properties": {
      "name": "a",
      "id": "b"
    }
  }]
}

data = [{lon:25.5, lat:24.4}];

data.forEach(function (planeData) {
  resCoordinateArray.push([planeData.lon, planeData.lat]);
});

resObj.features[0].geometry.coordinates = resCoordinateArray;