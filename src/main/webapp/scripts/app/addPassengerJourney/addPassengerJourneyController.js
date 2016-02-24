'use strict';

angular.module('fYPApp')
    .controller('MapController', function ($scope, $log, $filter, $http, Principal, $document, $state, $timeout, Auth) {

        var username = null;
        Principal.identity().then(function (account) {
            $scope.account = account;
            username = account.login;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        $(".date-input").datepicker({});
        $('#timepicker').timepicker({});

        $scope.journey = {};
        $scope.journey.source = "";
        $scope.journey.destination = "";
        $scope.addUsername = function () {
            $scope.journey.username = username;
        };

        $scope.display = function () {
            $log.log(JSON.stringify(roundedDistance + $scope.journey.source + $scope.journey.destination));
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

        var roundedDistance = 0;
        $scope.calculateRoute = function () {
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
                    roundedDistance = Math.round(distance * 100) / 100 + " KM";
                    document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + roundedDistance;
                }
            });
        };

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

        var startNodes = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            startNodes.push(this.source);
        });
        var destinationNodes = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            destinationNodes.push(this.destination);
        });
        var sourceAndDestination = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            sourceAndDestination.push(this.source);
            sourceAndDestination.push(this.destination);
        });

        var sourceDistances = [];
        $scope.driverSourceToSourceDistances = function () {
            for (var i = 0; i < startNodes.length; i++) {
                var start = angular.element('#source').val();
                var request = {
                    origin: start,
                    destination: startNodes[i],
                    waypoints: $scope.waypts,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                var myDirectionsService = new google.maps.DirectionsService();
                myDirectionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        var distance = 0;
                        for (var i = 0; i < response.routes[0].legs.length; i++) {
                            distance += response.routes[0].legs[i].distance.value / 1000;
                        }
                        var roundedDistance = Math.round(distance * 100) / 100 + " KM";
                        sourceDistances.push(roundedDistance);
                    }
                });
            }
        };
        $scope.driverSourceToAllSourceNodes = function () {
            for (var m = 1; m < startNodes.length; m++) {
                var serverURL = "http://localhost:7474/db/data";
                $.ajax({
                    type: "POST",
                    url: serverURL + "/cypher",
                    accepts: "application/json",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "X-Stream": "true"
                    },
                    data: JSON.stringify({
                        "query": "MATCH (a:Source),(b:Source)  WHERE a.name = '" + angular.element('#source').val() +
                        "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + sourceDistances[m] + "' RETURN r",
                        "params": {}
                    }),
                    success: function (data, textStatus, jqXHR) {
                        console.log(JSON.stringify(data));
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

        $scope.driverDestinationToDestinationNodes = function () {
            for (var m = 1; m < destinationNodes.length; m++) {
                var serverURL = "http://localhost:7474/db/data";
                $.ajax({
                    type: "POST",
                    url: serverURL + "/cypher",
                    accepts: "application/json",
                    dataType: "json",
                    contentType: "application/json",
                    headers: {
                        "X-Stream": "true"
                    },
                    data: JSON.stringify({
                        "query": "MATCH (a:Destination),(b:Destination)  WHERE a.name = '" + destinationNodes[m] +
                        "' AND b.name = '" + angular.element('#destination').val() + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + destinationDistances[m] + "' RETURN r",
                        "params": {}
                    }),
                    success: function (data, textStatus, jqXHR) {
                        console.log(JSON.stringify(data));
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

        $scope.createNodes = function () {
            var serverURL = "http://localhost:7474/db/data";
            $.ajax({
                type: "POST",
                url: serverURL + "/cypher",
                accepts: "application/json",
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "X-Stream": "true"
                },
                data: JSON.stringify({
                    "query": "CREATE (s1:Source {source}) CREATE (d1:Destination {destination}) " +
                    "CREATE (s1)-[r:TO]->(d1) SET r.weight = '" + roundedDistance + "'",
                    "params": {
                        "source": {
                            "name": angular.element('#source').val()
                        },
                        "destination": {
                            "name": angular.element('#destination').val()
                        }
                    }
                }),
                success: function (data, textStatus, jqXHR) {
                    console.log(JSON.stringify(data));
                },
                error: function (jqXHR, textStatus) {
                    console.log(textStatus);
                }
            });

        };


        var destinationDistances = [];
        $scope.getDestinationDistances = function () {
            for (var i = 0; i < destinationNodes.length; i++) {
                var end = angular.element('#destination').val();
                var request = {
                    origin: destinationNodes[i],
                    destination: end,
                    waypoints: $scope.waypts,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                var myDirectionsService = new google.maps.DirectionsService();
                myDirectionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        var distance = 0;
                        for (var i = 0; i < response.routes[0].legs.length; i++) {
                            distance += response.routes[0].legs[i].distance.value / 1000;
                        }
                        var roundedDistance = Math.round(distance * 100) / 100 + " KM";
                        destinationDistances.push(roundedDistance);
                    }
                });
            }
        };

        var distancesSourceToSource = [];
        $scope.sourceToSourceDistances = function () {
            for (var i = 0; i < startNodes.length; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var request = {
                        origin: startNodes[i],
                        destination: startNodes[m],
                        waypoints: $scope.waypts,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    var myDirectionsService = new google.maps.DirectionsService();
                    myDirectionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            var distance = 0;
                            for (var i = 0; i < response.routes[0].legs.length; i++) {
                                distance += response.routes[0].legs[i].distance.value / 1000;
                            }
                            var roundedDistance = Math.round(distance * 100) / 100 + " KM";
                            distancesSourceToSource.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var k = -1;
        $scope.sourceToSource = function () {
            for (var i = 0; i < startNodes.length; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    k++;
                    $.ajax({
                        type: "POST",
                        url: serverURL + "/cypher",
                        accepts: "application/json",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "X-Stream": "true"
                        },
                        data: JSON.stringify({
                            "query": "MATCH (a:Source),(b:Source)  WHERE a.name = '" + startNodes[i] +
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + distancesSourceToSource[k] + "' RETURN r ",
                            "params": {}
                        }),
                        success: function (data, textStatus, jqXHR) {
                            //console.log(JSON.stringify(data));
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
        };

        var distancesDestinationToDestination = [];
        $scope.DestinationToDestinationDistances = function () {
            for (var i = 0; i < destinationNodes.length; i++) {
                for (var m = 0; m < destinationNodes.length; m++) {
                    var request = {
                        origin: destinationNodes[i],
                        destination: destinationNodes[m],
                        waypoints: $scope.waypts,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    var myDirectionsService = new google.maps.DirectionsService();
                    myDirectionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            var distance = 0;
                            for (var i = 0; i < response.routes[0].legs.length; i++) {
                                distance += response.routes[0].legs[i].distance.value / 1000;
                            }
                            var roundedDistance = Math.round(distance * 100) / 100 + " KM";
                            distancesDestinationToDestination.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var l = -1;
        $scope.DestinationToDestination = function () {
            for (var i = 0; i < destinationNodes.length; i++) {
                for (var m = 0; m < destinationNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    l++;
                    $.ajax({
                        type: "POST",
                        url: serverURL + "/cypher",
                        accepts: "application/json",
                        dataType: "json",
                        contentType: "application/json",
                        headers: {
                            "X-Stream": "true"
                        },
                        data: JSON.stringify({
                            "query": "MATCH (a:Destination),(b:Destination)  WHERE a.name = '" + destinationNodes[i] +
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + distancesDestinationToDestination[l] + "' RETURN r ",
                            "params": {}
                        }),
                        success: function (data, textStatus, jqXHR) {
                            console.log(JSON.stringify(data));
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
        };




    });
