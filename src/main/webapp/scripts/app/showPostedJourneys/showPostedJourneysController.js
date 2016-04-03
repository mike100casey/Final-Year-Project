'use strict';

angular.module('fYPApp')
    .controller('DriverJourneyController1', function ($scope, $log, $http, Principal) {

        var username = null;
        Principal.identity().then(function (account) {
            $scope.account = account;
            username = account.login;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

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

    });

//$scope.paths = function () {
//    var serverURL = "http://localhost:7474/db/data";
//    a++;
//    $.ajax({
//        type: "POST",
//        url: serverURL + "/cypher",
//        accepts: "application/json",
//        dataType: "json",
//        contentType: "application/json",
//        headers: {
//            "X-Stream": "true"
//        },
//        data: JSON.stringify({
//            query:"START node1=node(6),node2=node(12),node3=node(13),node4=node(3),node5=node(7)" +
//                    "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5 " +
//                    "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight) ",
//
//            //"query": "START from=node(6),to=node(7) " +
//            //"MATCH paths = allShortestPaths((from)-[:To*]->(to)) " +
//            //"WITH REDUCE(dist = 0, rel in rels(paths) | dist + rel.weight) AS distance, paths" +
//            //" RETURN  distance",
//            "params": {}
//        }),
//        success: function (data, textStatus, jqXHR) {
//            console.log(JSON.stringify(data));
//            //for(var m=0; m < data.data.length ; m++) {
//            //    for(var i=0; i < data.data[0][0].length ; i++){
//            //        console.log(JSON.stringify(data.data[m][0][i].data.name));
//            //    }
//            //}
//        },
//        error: function (jqXHR, textStatus) {
//            console.log(textStatus);
//        }
//    });
//};

//$scope.createNodes = function () {
//    var serverURL = "http://localhost:7474/db/data";
//    $.ajax({
//        type: "POST",
//        url: serverURL + "/cypher",
//        accepts: "application/json",
//        dataType: "json",
//        contentType: "application/json",
//        headers: {
//            "X-Stream": "true"
//        },
//        data: JSON.stringify({
//            "query": "CREATE (s1:Source {source}) CREATE (d1:Destination {destination}) " +
//            "CREATE (s1)-[r:TO]->(d1) SET r.weight = '" + distance + "'",
//            "params": {
//                "source": {
//                    "name": angular.element('#source').val()
//                },
//                "destination": {
//                    "name": angular.element('#destination').val()
//                }
//            }
//        }),
//        success: function (data, textStatus, jqXHR) {
//            console.log(JSON.stringify(data));
//        },
//        error: function (jqXHR, textStatus) {
//            console.log(textStatus);
//        }
//    });
//};

//var distance = 0;
//$scope.calculateRoute = function () {
//    var start = angular.element('#source').val();
//    var end = angular.element('#destination').val();
//
//    var request = {
//        origin: start,
//        waypoints: $scope.journey.waypts,
//        destination: end,
//        travelMode: google.maps.TravelMode.DRIVING
//    };
//    var MyDirectionsService = new google.maps.DirectionsService();
//    MyDirectionsService.route(request, function (response, status) {
//        if (status == google.maps.DirectionsStatus.OK) {
//            var distance = 0;
//            for (var i = 0; i < response.routes[0].legs.length; i++) {
//                distance += response.routes[0].legs[i].distance.value / 1000;
//            }
//            distance = Math.round(distance * 100) / 100;
//            document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + roundedDistance;
//        }
//    });
//};
