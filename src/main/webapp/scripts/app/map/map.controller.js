'use strict';

angular.module('fYPApp')
    .controller('MapController', function ($scope, $log, $filter, $http, Principal, $document, $state, $timeout, Auth) {

        $scope.calcRoute = function() {
            var MyDirectionsDisplay = new google.maps.DirectionsRenderer({ 'map': map, 'draggable': true});
            var start = angular.element('#source').val();
            var end = angular.element('#destination').val();

            var request = {
                origin:start,
                waypoints: $scope.journey.waypts,
                destination:end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            var MyDirectionsService = new google.maps.DirectionsService();
            MyDirectionsService.route( request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    MyDirectionsDisplay.setDirections(response);
                    var distance = 0;
                    for(var i = 0; i < response.routes[0].legs.length; i++){
                        distance += response.routes[0].legs[i].distance.value / 1000;
                    }
                    var dist = Math.round(distance * 100) / 100 + " KM";
                    //document.getElementById('distanceLabel').innerHTML = dist;
                }
            });

            var MyDirectionsService = new google.maps.DirectionsService();
            MyDirectionsService.route( request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    MyDirectionsDisplay.setDirections(response);
                    var distance = 0;
                    for(var i = 0; i < response.routes[0].legs.length; i++){
                        distance += response.routes[0].legs[i].distance.value / 1000;
                    }
                    var dist = Math.round(distance * 100) / 100 + " KM";
                    document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + dist;
                }
            });
        };

        $(".date-input").datepicker({
        });


    });
