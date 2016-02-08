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
        var body = JSON.stringify({
            "name": "Archie"
        });
        var body1 = {};

        $scope.postRoute = function () {

            $.ajax({
                url: "http://localhost:7474/db/data/node ",
                type: "POST",
                data: body,
                contentType: "application/json"
            })
                .done(function (result) {
                    console.log(result);

                })
                .fail(function (error) {
                    console.log(error.statusText);
                });
        };
        $scope.getRoute = function () {

            $.ajax({
                url: "http://localhost:7474/db/data/cypher",
                accepts: "application/json; charset=UTF-8",
                dataType: "json",
                data: {
                    "query": "start n  = node(1) return n",
                    "params": {}
                },
                type: "POST",
                success: function (data, xhr, status) {
                    $scope.node = data;
                    console.log(JSON.stringify($scope.node));
                },
                error: function (xhr, err, msg) {
                    console.log(xhr);
                    console.log(err);
                    console.log(msg);
                }
            });
        };

        //var neo4j = require('neo4j');
        //var db = new neo4j.GraphDatabase('http://username:password@localhost:7474');



        //$scope.getRoute = function () {
        //
        //    $http.get('localhost:7474/db/data/node/1').
        //        success(function (data, status, headers, config) {
        //            $scope.node = data.content;
        //            console.log($scope.node);
        //
        //        }).
        //        error(function (data, status, headers, config) {
        //            // log error
        //        });
        //};


        // $scope.journeyRequests = [];
        // jQuery.extend({
        //     getValues: function (pageNumber) {
        //         var result = null;
        //         $.ajax({
        //             url: '/api/journey/allJourneyRequests?page=' + pageNumber,
        //             type: 'get',
        //             dataType: 'JSON',
        //             async: false,
        //             success: function (data) {
        //                 result = data;
        //             }
        //         });
        //         return result;
        //     }
        // });
        // $scope.journeyRequests = $.getValues(0);
        //
        // var possibleRoutes = [];
        // var uniqueNames = [];
        // var sourceLat;
        // var sourceLng;
        // var destinationLat;
        // var destinationLng;
        // $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
        //     var source = this.source;
        //     sourceLat = this.sourceLat;
        //     sourceLng = this.sourceLng;
        //     var destination = this.destination;
        //     destinationLat = this.destinationLat;
        //     destinationLng = this.destinationLng;
        //     possibleRoutes.push(this.source, this.destination);
        //     $.each(possibleRoutes, function (i, el) {
        //         if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        //     });
        // });
        //
        // function routeGenerator(inputArr) {
        //     var results = [];
        //
        //     function permute(arr, memo) {
        //         var cur, memo = memo || [];
        //         for (var i = 0; i < arr.length; i++) {
        //             cur = arr.splice(i, 1);
        //             if (arr.length === 0) {
        //                 results.push(memo.concat(cur));
        //             }
        //             permute(arr.slice(), memo.concat(cur));
        //             arr.splice(i, 0, cur[0]);
        //         }
        //         return results;
        //     }
        //
        //     return permute(inputArr);
        // }
        //
        // var combinations = routeGenerator(uniqueNames);
        //
        // var printArray = function (arr) {
        //     if (typeof(arr) == "object") {
        //         for (var i = 0; i < arr.length; i++) {
        //             printArray(arr[i]);
        //         }
        //     }
        //     else document.write(arr);
        // };
        // printArray(combinations.join("<br>"));
        //
        //
        // var geocoder = new google.maps.Geocoder;
        // var service = new google.maps.DistanceMatrixService;
        //
        ////for (var k = 0; k < combinations.length - 1; k++) {
        //     var list = combinations[3];
        //
        //     service.getDistanceMatrix({
        //
        //         origins: list,
        //         destinations: list,
        //         travelMode: google.maps.TravelMode.DRIVING
        //
        //     }, function (response, status) {
        //
        //         var originList = response.originAddresses;
        //         var destinationList = response.destinationAddresses;
        //
        //         var output = new Array();
        //
        //         for (var i = 0; i < 1; i++) {
        //
        //             var results = response.rows[i].elements;
        //
        //             for (var j = 0; j < results.length; j++) {
        //
        //
        //                 //result += results[j].duration.text;
        //                 //if (!output[i]) output[i] = [];
        //                 var result = originList[i] + ' to ' + destinationList[j] +
        //                     ': ' + results[j].distance.text + ' in ' +
        //                     results[j].duration.text + '<br>';
        //
        //             }
        //             console.log(result);
        //             document.write('<br>' + result + '<br>');
        //         }
        //     });
        ////}
        //
        //
        // function distance(lat1, lon1, lat2, lon2, unit) {
        //     var radlat1 = Math.PI * lat1 / 180
        //     var radlat2 = Math.PI * lat2 / 180
        //     var theta = lon1 - lon2
        //     var radtheta = Math.PI * theta / 180
        //     var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        //     dist = Math.acos(dist)
        //     dist = dist * 180 / Math.PI
        //     dist = dist * 60 * 1.1515
        //     if (unit == "K") {
        //         dist = dist * 1.609344
        //     }
        //     if (unit == "N") {
        //         dist = dist * 0.8684
        //     }
        //     return Math.round(dist * 100) / 100 + " Miles<br>"
        // }

        //document.write("<br>" + distance(parseFloat(sourceLat), parseFloat(sourceLng), parseFloat(destinationLat), parseFloat(destinationLng), ""));


        //$scope.waypts = [];
        //var wayPointsArr = [];
        //for (var i = 0; i <= combinations.length - 1; i++) {
        //    var waypointsObj = ({"location": combinations[i], "stopover": true});
        //    $scope.waypts.push(waypointsObj);
        //
        //}
        //console.log(JSON.stringify(wayPointsArr));
        //
        //$scope.removeRoute = function () {
        //    $state.reload();
        //};
        //
        //var start;
        //var end;
        //$scope.add = function (value) {
        //    start = $scope.journey.source;
        //    end = $scope.journey.driverDestination;
        //};
        //
        //$scope.calcRoute = function () {
        //    var myDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
        //    var request = {
        //        origin: start,
        //        destination: end,
        //        waypoints: $scope.waypts,
        //        travelMode: google.maps.TravelMode.DRIVING
        //    };
        //    var myDirectionsService = new google.maps.DirectionsService();
        //    myDirectionsService.route(request, function (response, status) {
        //        if (status == google.maps.DirectionsStatus.OK) {
        //            myDirectionsDisplay.setDirections(response);
        //            var distance = 0;
        //            for (var i = 0; i < response.routes[0].legs.length; i++) {
        //                distance += response.routes[0].legs[i].distance.value / 1000;
        //            }
        //            var dist = Math.round(distance * 100) / 100 + " KM";
        //            //document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + dist;
        //            //document.write(dist);
        //        }
        //    });
        //};


    });
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

//function sets(input, size){
//    var results = [], result, mask, total = Math.pow(2, input.length);
//    for(mask = 0; mask < total; mask++){
//        result = [];
//        i = input.length - 1;
//        do{
//            if( (mask & (1 << i)) !== 0){
//                result.push(input[i]);
//            }
//        }while(i--);
//        if( result.length >= size){
//            results.push(result);
//        }
//    }
//
//    return results;
//}
//var combinations = sets(uniqueNames, 4);
//document.write(combinations.join("<br>"));

//var combinations2 = routeGenerator(combinations);
//var printArray = function (arr) {
//    if (typeof(arr) == "object") {
//        for (var i = 0; i < arr.length; i++) {
//            printArray(arr[i]);
//        }
//    }
//    else document.write(arr);
//};
//printArray(combinations2.join("<br>"));
