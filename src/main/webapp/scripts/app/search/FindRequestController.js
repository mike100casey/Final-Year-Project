/**
 *
 * Created by Michael on 2/1/2016.
 */

'use strict';

angular.module('fYPApp')
    .controller('FindRequestController', function ($scope, Principal, $timeout, Auth, $http, $filter, $log) {
        Principal.identity().then(function (account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        $(".date-input").datepicker({});
        $('#timepicker').timepicker({});


        $scope.showJourneyRequests = function (pageNumber) {
            $http.get('/api/journey/allJourneyRequests?page=' + pageNumber).
                success(function (data, status, headers, config) {
                    $scope.journeyRequests = data.content;
                    $scope.currentPage = data.number + 1;
                    $scope.numPerPage = data.size;
                    $scope.total = data.totalElements;
                    $scope.maxSize = 5;
                    //$log.log(JSON.stringify($scope.journeyRequests));
                }).
                error(function (data, status, headers, config) {
                    // log error
                });
        };
        $scope.showJourneyRequests(0);

        var addedWayPoints = [];
        var address = "";

        var start;
        var end;
        var stop;
        $scope.addSource = function (value) {
            stop = String(value);
            addedWayPoints.push({
                location: stop,
                stopover: true
            });
        }
        var count = 0;
        $scope.myFun = function () {
            count++;
        }

        $scope.add = function (value) {
            start = $scope.journey.source;
            end = $scope.journey.driverDestination;

        }


        $scope.calcRoute = function () {
            var myDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var request = {
                origin: start,
                destination: end,
                waypoints: addedWayPoints,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING
            };
            var myDirectionsService = new google.maps.DirectionsService();
            myDirectionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    myDirectionsDisplay.setDirections(response);

                    var distance = 0;
                    for (var i = 0; i < response.routes[0].legs.length; i++) {
                        distance += response.routes[0].legs[i].distance.value / 1000;
                    }
                    var dist = Math.round(distance * 100) / 100 + " KM";
                    document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + dist;
                }
            });
            google.maps.event.addListener(myDirectionsDisplay, 'directions_changed', function (e) {



            });
        };


    });
