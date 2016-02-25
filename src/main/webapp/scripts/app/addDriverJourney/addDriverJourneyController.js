'use strict';

angular.module('fYPApp')
    .controller('DriverJourneyController', function ($scope, $log, $http, Principal) {

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

        var distance = 0;
        $scope.calculateRoute = function () {
            //var MyDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var start = angular.element('#source').val();
            var end = angular.element('#destination').val();

            var request = {
                origin: start,
                waypoints: $scope.journey.waypts,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            var MyDirectionsService = new google.maps.DirectionsService();
            MyDirectionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var distance = 0;
                    for (var i = 0; i < response.routes[0].legs.length; i++) {
                        distance += response.routes[0].legs[i].distance.value / 1000;
                    }
                    distance = Math.round(distance * 100) / 100;
                    //document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + roundedDistance;
                }
            });
        };

        $scope.deleteEdges = function () {
            $scope.node = [];
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
                    "query": "START r=rel(*) delete r", "params": {}
                }),
                success: function (data, textStatus, jqXHR) {
                    console.log(JSON.stringify(data));
                },
                error: function (jqXHR, textStatus) {
                    console.log(textStatus);
                }
            });
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
                    "CREATE (s1)-[r:TO]->(d1) SET r.weight = '" + distance + "'",
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

//-----------------------Driver source to ALL sources------------------------------
        var  driverSourceToSourceDistances = [];
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
                        var roundedDistance = Math.round(distance * 100) / 100;
                        driverSourceToSourceDistances.push(roundedDistance);
                    }
                });
            }
        };
        $scope.driverSourceToAllSourceEdges = function () {
            for (var m = 0; m < startNodes.length; m++) {
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
                        "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + driverSourceToSourceDistances[m] + "'",
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

//-----------------------source to sources------------------------------
        var sourceToSourceDistance = [];
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
                            var roundedDistance = Math.round(distance * 100) / 100;
                            sourceToSourceDistance.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var k = -1;
        $scope.sourceToSourceEdges = function () {
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + sourceToSourceDistance[k] + "'",
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

//-----------------------sources to destinations----------------------
        var sourceToDestinationDistances = [];
        $scope.sourceToDestinationDistances = function () {
            for (var i = 0; i < startNodes.length; i++) {
                for (var m = 0; m < destinationNodes.length; m++) {
                    var request = {
                        origin: startNodes[i],
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
                            var roundedDistance = Math.round(distance * 100) / 100;
                            sourceToDestinationDistances.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var j = -1;
        $scope.allSourcesToDestinationEdges = function () {
            for (var i = 0; i < startNodes.length; i++) {
                for (var m = 0; m < destinationNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    j++;
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
                            "query": "MATCH (a:Source),(b:Destination)  WHERE a.name = '" + startNodes[i] +
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + sourceToDestinationDistances[j] + "'",
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

//-----------------------Driver destination to ALL destinations----------------------
        var driverDestinationToDestinationDistances = [];
        $scope.driverDestinationToAllDestinationDistances = function () {
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
                        var roundedDistance = Math.round(distance * 100) / 100;
                        driverDestinationToDestinationDistances.push(roundedDistance);
                    }
                });
            }
        };
        $scope.driverDestinationToDestinationEdges = function () {
            for (var m = 0; m < destinationNodes.length; m++) {
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
                        "' AND b.name = '" + angular.element('#destination').val() + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + driverDestinationToDestinationDistances[m] + "'",
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

//-----------------------destination to destinations----------------------
        var destinationToDestinationDistances = [];
        $scope.destinationToDestinationDistances = function () {
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
                            var roundedDistance = Math.round(distance * 100) / 100;
                            destinationToDestinationDistances.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var l = -1;
        $scope.destinationToDestinationEdges = function () {
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
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + destinationToDestinationDistances[l] + "'",
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

//-----------------------destination to sources----------------------
        var destinationToSourceDistances = [];
        $scope.allDestinationToSourceDistances = function () {
            for (var i = 0; i < destinationNodes.length; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var request = {
                        origin: destinationNodes[i],
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
                            var roundedDistance = Math.round(distance * 100) / 100;
                            destinationToSourceDistances.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var a = -1;
        $scope.allDestinationToSourceEdges = function () {
            for (var i = 0; i < destinationNodes.length; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    a++;
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
                            "query": "MATCH (a:Destination),(b:Source)  WHERE a.name = '" + destinationNodes[i] +
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" + destinationToSourceDistances[a] + "'",
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
