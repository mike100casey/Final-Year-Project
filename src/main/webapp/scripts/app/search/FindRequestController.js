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

        $scope.showJourneyRequests = function (pageNumber) {
            $http.get('/api/journey/allJourneyRequests?page=' + pageNumber).
                success(function (data, status, headers, config) {
                    $scope.journeyRequests = data.content;
                    //callback($scope.journeyRequests);
                    $scope.currentPage = data.number + 1;
                    $scope.numPerPage = data.size;
                    $scope.total = data.totalElements;
                    $scope.maxSize = 5;

                }).
                error(function (data, status, headers, config) {
                    // log error
                });
        };
        $scope.showJourneyRequests(0);

        $(".date-input").datepicker({});
        $('#timepicker').timepicker({});

        $scope.journeyRequests = [];
        jQuery.extend({
            getValues: function (pageNumber) {
                var result = null;
                $.ajax({
                    url: '/api/journey/allJourneyRequests?page=' + pageNumber,
                    type: 'get',
                    dataType: 'JSON',
                    async: false,
                    success: function (data) {
                        result = data;
                    }
                });
                return result;
            }
        });
        $scope.journeyRequests = $.getValues(0);

        var sources = [];
        var uniqueNames = [];
        var sourceLat;
        var sourceLng;
        var destinationLat;
        var destinationLng;
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            var source = this.source;
            sourceLat = this.sourceLat;
            sourceLng = this.sourceLng;
            var destination = this.destination;
            destinationLat = this.destinationLat;
            destinationLng = this.destinationLng;
            sources.push(this.source, this.destination);
            $.each(sources, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
        });

        function permutator(inputArr) {
            var results = [];
            function permute(arr, memo) {
                var cur, memo = memo || [];
                for (var i = 0; i < arr.length; i++) {
                    cur = arr.splice(i, 1);
                    if (arr.length === 0) {
                        results.push(memo.concat(cur));
                    }
                    permute(arr.slice(), memo.concat(cur));
                    arr.splice(i, 0, cur[0]);
                }
                return results;
            }
            return permute(inputArr);
        }

        var combinations = permutator(uniqueNames);
        var printArray = function (arr) {
            if (typeof(arr) == "object") {
                for (var i = 0; i < arr.length; i++) {
                    printArray(arr[i]);
                }
            }
            else document.write(arr);
        };
        printArray(combinations.join("<br>"));

        //var names = ["Mike","Matt","Nancy","Adam","Jenny","Nancy","Carl"];
        //var uniqueNames = [];
        //$.each(names, function(i, el){
        //    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        //});
        //console.log(uniqueNames);

        //function getCombinations(chars) {
        //    var result = [];
        //    var f = function(prefix, chars) {
        //        for (var i = 0; i < chars.length; i++) {
        //            result.push(prefix + chars[i]);
        //            f(prefix + chars[i], chars.slice(i + 1));
        //        }
        //    }
        //    f('', chars);
        //    return result;
        //}
        //var combinations = getCombinations(sources);
        //document.write(combinations.join("<br>"));

        function distance(lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180
            var radlat2 = Math.PI * lat2 / 180
            var theta = lon1 - lon2
            var radtheta = Math.PI * theta / 180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180 / Math.PI
            dist = dist * 60 * 1.1515
            if (unit == "K") {
                dist = dist * 1.609344
            }
            if (unit == "N") {
                dist = dist * 0.8684
            }
            return Math.round(dist * 100) / 100 + " Miles<br>"
        }

        document.write(distance(parseFloat(sourceLat), parseFloat(sourceLng), parseFloat(destinationLat), parseFloat(destinationLng), ""));


        $scope.waypts = [];
        var wayPointsArr = [];
        for (var i = 0; i <= combinations.length - 1; i++) {
            var waypointsObj = ({"location": combinations[i], "stopover": true});
            $scope.waypts.push(waypointsObj);

        }
        console.log(JSON.stringify(wayPointsArr));

        $scope.removeRoute = function () {
            $state.reload();
        };

        var start;
        var end;
        $scope.add = function (value) {
            start = $scope.journey.source;
            end = $scope.journey.driverDestination;
        };

        $scope.calcRoute = function () {
            var myDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var request = {
                origin: start,
                destination: end,
                waypoints: $scope.waypts,
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
                    //document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + dist;
                    //document.write(dist);
                }
            });
        };


    });
