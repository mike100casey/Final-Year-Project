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
        $scope.waypts = [];
        var my_delay = 5000;

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
        var driverSourceToSourceDistances = [64.14, 59.76, 26.9, 66.44];
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
                    setTimeout: 10000,
                    data: JSON.stringify({
                        "query": "MATCH (a:Source),(b:Source)  WHERE a.name = '" + angular.element('#source').val() +
                        "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + driverSourceToSourceDistances[m] + " return r",
                        "params": {}
                    }),
                    beforeSend: function (xhr) {
                        //setTimeout (10000 );
                    },
                    success: function (data, textStatus, jqXHR) {
                        console.log(JSON.stringify(data));
                        //setTimeout ($.ajax, 1000 );
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

//-----------------------source to sources------------------------------
        //var sourceToSourceDistance = [0, 57.85, 37.74, 130.76, 57.44, 0, 60.18, 111.06, 38.08, 59.43, 0, 93.02, 131.42, 111.24, 92.32, 0];
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
                            var roundedDistance = (Math.round(distance * 100) / 100);
                            sourceToSourceDistance.push(roundedDistance);
                        }
                    });
                }
            }
        };

        var sourceToSourceDistance1 = [0, 57.85, 37.74, 130.76];
        var k = -1;
        $scope.sourceToSourceEdges1 = function () {
            for (var i = 0; i < 1; i++) {
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + sourceToSourceDistance1[k] + " return r",
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

        var sourceToSourceDistance2 = [57.44, 0, 60.18, 111.06];
        var w = -1;
        $scope.sourceToSourceEdges2 = function () {
            for (var i = 1; i < 2; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    w++;
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + sourceToSourceDistance2[w] + " return r",
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

        var sourceToSourceDistance3 = [38.08, 59.43, 0, 93.02];
        var t = -1;
        $scope.sourceToSourceEdges3 = function () {
            for (var i = 2; i < 3; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    t++;
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + sourceToSourceDistance3[t] + " return r",
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

        var sourceToSourceDistance4 = [131.42, 111.24, 92.32, 0];
        var o = -1;
        $scope.sourceToSourceEdges4 = function () {
            for (var i = 3; i < 4; i++) {
                for (var m = 0; m < startNodes.length; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    o++;
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + sourceToSourceDistance4[o] + " return r",
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
        var sourceToDestinationDistances = [11.36, 37.17, 21.06, 90.85, 58.65, 24.46, 36.61, 71.15, 49.43, 36.7, 46.84,  53.11, 136.05, 123.79, 113.39, 40.12];
        $scope.sourceToDestinationDistances = function () {
            for (var i = 3; i < 4; i++) {
                for (var m = 0; m < destinationNodes.length; m++) {
                    var request = {
                        origin: startNodes[i],
                        destination: destinationNodes[m],
                        waypoints: $scope.waypts,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    console.log(destinationNodes[m]);
                    var myDirectionsService = new google.maps.DirectionsService();
                    myDirectionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            var distance = 0;
                            for (var i = 0; i < response.routes[0].legs.length; i++) {
                                distance += response.routes[0].legs[i].distance.value / 1000;
                            }
                            var roundedDistance = Math.round(distance * 100) / 100;
                            sourceToDestinationDistances.push(roundedDistance);
                            console.log(roundedDistance);
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
                            "query": "MATCH (a:Source),(b:Destination) WHERE a.name = '" + startNodes[i] +
                            "'AND b.name = '" + destinationNodes[m] + "'CREATE (a)-[r:To]->(b) SET r.weight = " + sourceToDestinationDistances[j] + " return r",
                            "params": {}
                        }),
                        success: function (data, textStatus, jqXHR) {
                            console.log(JSON.stringify(data));
                            setTimeout($.ajax, 5000);
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
        };

//-----------------------Driver destination to ALL destinations----------------------
        var driverDestinationToDestinationDistances = [27.58, 52.98,42.58, 115.85 ];
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
                    console.log(driverDestinationToDestinationDistances);
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
                        "' AND b.name = '" + angular.element('#destination').val() + "'   CREATE (a)-[r:To]->(b) SET r.weight = " +
                        driverDestinationToDestinationDistances[m] + " return r",
                        "params": {}
                    }),
                    success: function (data, textStatus, jqXHR) {
                        console.log(JSON.stringify(data));
                        setTimeout($.ajax, 5000);
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

//-----------------------destination to destinations----------------------
        //var destinationToDestinationDistances = [0, 38.3, 23, 96.33, 38, 0, 15.96, 83.72,22.66, 16.02, 0, 73.33, 95.93, 83.67, 73.27, 0];
        var destinationToDestinationDistances1 = [0, 38.3, 23, 96.33];
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
                            destinationToDestinationDistances1.push(roundedDistance);
                        }
                    });
                }
            }
        };
        var l = -1;
        $scope.destinationToDestinationEdges1 = function () {
            for (var i = 0; i < 1; i++) {
                for (var m = 0; m < 4; m++) {
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
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " +
                            destinationToDestinationDistances1[l] + " return r",
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

        var f = -1;
        var destinationToDestinationDistances2 = [38, 0, 15.96, 83.72];
        $scope.destinationToDestinationEdges2 = function () {
            for (var i = 1; i < 2; i++) {
                for (var m = 0; m < 4; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    f++;
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
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " +
                            destinationToDestinationDistances2[f] + " return r",
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

        var p = -1;
        var destinationToDestinationDistances3 = [22.66, 16.02, 0, 73.33];
        $scope.destinationToDestinationEdges3 = function () {
            for (var i = 2; i < 3; i++) {
                for (var m = 0; m < 4; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    p++;
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
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " +
                            destinationToDestinationDistances3[p] + " return r",
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

        var q = -1;
        var destinationToDestinationDistances4 = [95.93, 83.67, 73.27, 0];
        $scope.destinationToDestinationEdges4 = function () {
            for (var i = 3; i < 4; i++) {
                for (var m = 0; m < 4; m++) {
                    var serverURL = "http://localhost:7474/db/data";
                    q++;
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
                            "' AND b.name = '" + destinationNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = '" +
                            destinationToDestinationDistances4[q] + "' return r",
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
        var destinationToSourceDistances = [11.36, 37.17, 21.06, 90.85, 58.65, 24.46, 36.61, 71.15, 49.43, 36.7, 46.84,  53.11, 136.05, 123.79, 113.39, 40.12];
        $scope.allDestinationToSourceDistances = function () {
            for (var i = 3; i < 4; i++) {
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
                            destinationToSourceDistances.push(roundedDistance);console.log(roundedDistance);
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
                            "' AND b.name = '" + startNodes[m] + "'   CREATE (a)-[r:To]->(b) SET r.weight = " + destinationToSourceDistances[a] + " return r",
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

        $scope.paths = function () {
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
                    query:"START node1=node(6),node2=node(12),node3=node(13),node4=node(3),node5=node(7)" +
                            "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5 " +
                            "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight) ",

                    //"query": "START from=node(6),to=node(7) " +
                    //"MATCH paths = allShortestPaths((from)-[:To*]->(to)) " +
                    //"WITH REDUCE(dist = 0, rel in rels(paths) | dist + rel.weight) AS distance, paths" +
                    //" RETURN  distance",
                    "params": {}
                }),
                success: function (data, textStatus, jqXHR) {
                    console.log(JSON.stringify(data));
                    //for(var m=0; m < data.data.length ; m++) {
                    //    for(var i=0; i < data.data[0][0].length ; i++){
                    //        console.log(JSON.stringify(data.data[m][0][i].data.name));
                    //    }
                    //}
                },
                error: function (jqXHR, textStatus) {
                    console.log(textStatus);
                }
            });
        };
        //query:"START node1=node(6),node2=node(12),node3=node(13),node4=node(3),node5=node(7) MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5 RETURN TOINT(r1.weight) + TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)",
        //console.log(JSON.stringify(data.data[m][1]));
        //console.log(JSON.stringify(data.data[m][0][i].data.journeyId));
        //console.log(JSON.stringify(data.data[0][0]));nodes(paths),

    });
