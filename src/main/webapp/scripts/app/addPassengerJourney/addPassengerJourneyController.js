'use strict';

angular.module('fYPApp')
    .controller('MapController', function ($scope, $log, $filter, $http, Principal, $document, $state, $timeout, Auth) {

        var username = null;
        Principal.identity().then(function (account) {
            $scope.account = account;
            username = account.login;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        $scope.journey = {};
        $scope.journey.source = "";
        $scope.journey.destination = "";
        $scope.addUsername = function () {
            $scope.journey.username = username;
        };

        $scope.display = function () {
            $log.log(JSON.stringify($scope.journey));
        };

        $scope.sendForm = function () {
            $http.post("/api/journey/registerPassengerJourney", $scope.journey).
                success(function (data, status, headers, config) {
                    $scope.success = 'OK';
                })
                .error(function (response) {
                    $scope.success = null;
                    if (response.status === 500) {
                        $scope.error = 'ERROR';
                    }
                });
        };

        $scope.calcRoute = function () {
            var MyDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var start = angular.element('#source').val();
            var end = angular.element('#destination').val();
            google.maps.event.addListener(MyDirectionsDisplay, 'directions_changed', function (e) {
                var routeLeg = MyDirectionsDisplay.directions.routes[0].legs[0];
                var legSize = MyDirectionsDisplay.directions.routes[0].legs.length;
                var routeLegEnd = MyDirectionsDisplay.directions.routes[0].legs[legSize - 1];

                $scope.journey.sourceLat = routeLeg.start_location.lat();
                $scope.journey.sourceLng = routeLeg.start_location.lng();
                $scope.journey.destinationLat = routeLegEnd.end_location.lat();
                $scope.journey.destinationLng = routeLegEnd.end_location.lng();
            });
            var request = {
                origin: start,
                waypoints: $scope.journey.waypts,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            var MyDirectionsService = new google.maps.DirectionsService();
            MyDirectionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    MyDirectionsDisplay.setDirections(response);
                    var distance = 0;
                    for (var i = 0; i < response.routes[0].legs.length; i++) {
                        distance += response.routes[0].legs[i].distance.value / 1000;
                    }
                    var dist = Math.round(distance * 100) / 100 + " KM";
                    document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + dist;
                }
            });
        };

        $(".date-input").datepicker({});
        $('#timepicker').timepicker({});


    });
