angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading, $http) {
  $scope.mapCreated = function(map) {
    $scope.map = map;

    var openSRDataCallFirst = "http://data.cityofnewyork.us/resource/erm2-nwe9.json?$where=within_circle(location,"
    var openSRDataCallSecond = ",50)%20and%20created_date%3E%272014-01-01%27";

    // List of Markers
    var markers = [];
    var dataList = [];

    // When center moved by the user
    map.addListener('idle', function() {
      var latLng = map.getCenter();
      var openSRDataCallURL = openSRDataCallFirst + latLng.lat() + "," + latLng.lng() + openSRDataCallSecond;
      
      // When call response is successful
      $http.get(openSRDataCallURL).then(function(response) {
        var responseArray = response.data.slice(0, 50);
        
        // Clear all markers on Map
        markers = deleteMarkers(markers);

        // Clear the data list
        dataList = [];

        // Add markers on map
        addMarkersToMap(map, responseArray, markers, dataList);
        setMapOnAll(map, markers);

        // Sent data to scope for List display
        $scope.dataList = dataList;

      }, function(error) {
        alert('error call');
      });
    });
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };
});



// Goolge Map Functions
  function addMarkersToMap(map, responseArray, markers, dataList) {
    for (i=0; i<responseArray.length; i++) {
      var latLng = {
        lat: Number(responseArray[i].latitude),
        lng: Number(responseArray[i].longitude)
      }
      addMarker(map, latLng, markers);

      data = {
        complaintType: responseArray[i].complaint_type,
        latLng: latLng,
        incidentAddress: responseArray[i].incident_address,
        createdDate: responseArray[i].created_date,
        status: responseArray[i].status
      }
      dataList.push(data)
    }
  }

  // Adds a marker to the map and push to the array.
  function addMarker(map, location, markers) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
  
}
  // Sets the map on all markers in the array.
  function setMapOnAll(map, markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers(markers) {
    setMapOnAll(null, markers);
  }

  // Shows any markers currently in the array.
  function showMarkers(map, markers) {
    setMapOnAll(map, markers);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers(markers) {
    clearMarkers(markers);
    markers = [];
    return markers;
  }