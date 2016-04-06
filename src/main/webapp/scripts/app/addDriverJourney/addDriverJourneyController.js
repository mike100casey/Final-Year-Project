/**
 *
 * Created by Michael on 2/1/2016.
 */

'use strict';

angular.module('fYPApp')
    .controller('addDriverJourneyController', function ($scope, Principal, $timeout, Auth, $http, $log, $filter) {

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

        $(".date-input").datepicker({});
        $('#timepicker').timepicker({});

        //$scope.showJourneyRequests = function (pageNumber) {
        //    $http.get('/api/journey/allJourneyRequests?page=' + pageNumber).
        //        success(function (data) {
        //            $scope.journeyRequests = data.content;
        //            $scope.currentPage = data.number + 1;
        //            $scope.numPerPage = data.size;
        //            $scope.total = data.totalElements;
        //            $scope.maxSize = 5;
        //        }).
        //        error(function (data, status, headers, config) {
        //            // log error
        //        });
        //};
        //$scope.showJourneyRequests(0);

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


//-----------------------Neo4j ----------------------------------------
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
            for (var m = 0; m < 1; m++) {
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
                        "query": " CREATE (s1:Source {source}) CREATE (d1:Destination {destination}) CREATE (s1)-[r:TO]->(d1) SET r.weight = '" + roundedDistance + "'",
                        "params": {
                            "source": {
                                "name": angular.element('#source').val()
                            },
                            "destination": {
                                "name": angular.element('#destination').val()
                            }
                        }
                    }),
                    success: function (data) {
                        console.log(JSON.stringify(data));
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

//-----------------------Driver source to ALL sources-------------------
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
        //var sourceToSourceDistance = [0, 57.85, 37.74, 130.76, 57.44, 0, 60.18, 111.06, 38.08,
        // 59.43, 0, 93.02, 131.42, 111.24, 92.32, 0];
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
        var sourceToDestinationDistances = [11.36, 37.17, 21.06, 90.85, 58.65, 24.46, 36.61, 71.15,
            49.43, 36.7, 46.84, 53.11, 136.05, 123.79, 113.39, 40.12];
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
        var driverDestinationToDestinationDistances = [27.58, 52.98, 42.58, 115.85];
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
        //var destinationToDestinationDistances = [0, 38.3, 23, 96.33, 38, 0, 15.96, 83.72,22.66,
        // 16.02, 0, 73.33, 95.93, 83.67, 73.27, 0];
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
        var destinationToSourceDistances = [11.36, 37.17, 21.06, 90.85, 58.65, 24.46, 36.61, 71.15, 49.43,
            36.7, 46.84, 53.11, 136.05, 123.79, 113.39, 40.12];
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
                            destinationToSourceDistances.push(roundedDistance);
                            console.log(roundedDistance);
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
//-------------------------------------------------------------------------------

        $scope.oldJourneyDistance = 0;
        var roundedDistance = 0;
        $scope.calculateRoute = function () {
            var start = angular.element('#source').val();
            var end = angular.element('#destination').val();

            var request = {
                origin: start,
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
                    $scope.oldJourneyDistance = Math.round(distance * 100) / 100;
                    roundedDistance = Math.round(distance * 100) / 100;
                    //document.getElementById('distanceLabel').innerHTML = "Travel Distance: " + start + " to " +
                    //    end + " " + dist;
                    //console.log(dist);
                }
            });
        };

        function routeGenerator(inputArr) {
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

        var printArray = function (arr) {
            if (typeof(arr) == "object") {
                for (var i = 0; i < arr.length; i++) {
                    printArray(arr[i]);
                }
            }
            else console.log(arr);
            //document.write(arr);
        };

        var destinationNode_Ids = [];
        destinationNode_Ids.push("1", "3", "5", "13");

        var startNode_Ids = [];
        startNode_Ids.push("0", "2", "4", "12");

        var node_ids = [];
        var node_ids_singleArray = [];
        var oneStopDistance = [];
        var twoStopDistances = [];
        var threeStopDistances = [];
        var arrayWithoutSourcesAtEnd_DestinationAsStart = [];
        var arrayLength;

        $scope.paths = function () {
            //function toSingleArray() {
            //    for(var i = 0; i < node_ids.length; i++ ){
            //        for(var j = 0; j < node_ids[0].length; j++) {
            //            node_ids_singleArray.push(node_ids[i][j])
            //        }
            //    }
            //    $log.log(node_ids_singleArray);
            //}
            //
            //toSingleArray();


            var destinationNumbers = [];
            var uniqueDestinationNumbers = [];

            var routeCombinations = routeGenerator(node_ids);
            $scope.removeDestinationsFromStart = function () {
                for (var z = 0; z < routeCombinations.length; z++) {
                    for (var i = 0; i < routeCombinations[z].length; i++) {
                        for (var j = 0; j < destinationNode_Ids.length; j++) {
                            if (routeCombinations[z][0].indexOf(destinationNode_Ids[j]) !== -1) {
                                destinationNumbers.push(z);
                                $.each(destinationNumbers, function (i, el) {
                                    if ($.inArray(el, uniqueDestinationNumbers) === -1) uniqueDestinationNumbers.push(el);
                                });
                                break;
                            }
                        }
                    }
                }
            };
            $scope.removeDestinationsFromStart();
            var arrayWithoutDestinationsAtStart = $.grep(routeCombinations, function (n, i) {
                return $.inArray(i, uniqueDestinationNumbers) == -1;
            });

            var len = arrayWithoutDestinationsAtStart[0].length - 1;
            var sourceNumbers = [];
            var uniqueNumbersToRemove = [];
            $scope.removeSourcesFromEnd = function () {
                for (var z = 0; z < arrayWithoutDestinationsAtStart.length; z++) {
                    for (var i = 0; i < arrayWithoutDestinationsAtStart[z].length; i++) {
                        for (var j = 0; j < startNode_Ids.length; j++) {
                            if (arrayWithoutDestinationsAtStart[z][len].indexOf(startNode_Ids[j]) !== -1) {
                                sourceNumbers.push(z);
                                $.each(sourceNumbers, function (i, el) {
                                    if ($.inArray(el, uniqueNumbersToRemove) === -1) uniqueNumbersToRemove.push(el);
                                });
                                break;
                            }
                        }
                    }
                }
            };
            $scope.removeSourcesFromEnd();
            arrayWithoutSourcesAtEnd_DestinationAsStart = $.grep(arrayWithoutDestinationsAtStart, function (n, i) {
                return $.inArray(i, uniqueNumbersToRemove) == -1;
            });

            arrayLength = node_ids.length;
            if (arrayLength == 2) {
                if (oneStopDistance.length > 0) {
                    oneStopDistance.splice(0, oneStopDistance.length)
                }
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
                        query: "START node1=node(6),node2=node(" + node_ids[0] + "),node3=node(" + node_ids[1] + "),node4=node(7)" +
                        "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4 RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight)",
                        "params": {}
                    }),
                    success: function (data) {
                        oneStopDistance.push(parseInt(data.data[0][0]));
                        console.log(JSON.stringify(data.data[0][0]));
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });

            }
            else if (arrayLength == 4) {
                if (twoStopDistances.length > 0) {
                    twoStopDistances.splice(0, twoStopDistances.length)
                }
                for (var i = 0; i < arrayWithoutSourcesAtEnd_DestinationAsStart.length; i++) {
                    serverURL = "http://localhost:7474/db/data";
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
                            query: "START node1=node(6)," +
                            "node2=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[i][0] + ")," +
                            "node3=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[i][1] + ")," +
                            "node4=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[i][2] + ")," +
                            "node5=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[i][3] + ")," +
                            "node8=node(7)" +
                            "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5-[r5:To]->node8 " +
                            "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)+ TOINT(r5.weight) ",
                            "params": {}
                        }),
                        success: function (data) {
                            twoStopDistances.push(parseInt(data.data[0][0]));
                            console.log(JSON.stringify(data.data[0][0]));
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
            else if (arrayLength == 6) {
                if (threeStopDistances.length > 0) {
                    threeStopDistances.splice(0, threeStopDistances.length)
                }
                for (var k = 0; k < arrayWithoutSourcesAtEnd_DestinationAsStart.length; k++) {
                    serverURL = "http://localhost:7474/db/data";
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
                            query: "START node1=node(6)," +
                            "node2=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][0] + ")," +
                            "node3=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][1] + ")," +
                            "node4=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][2] + ")," +
                            "node5=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][3] + ")," +
                            "node6=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][4] + ")," +
                            "node7=node(" + arrayWithoutSourcesAtEnd_DestinationAsStart[k][5] + ")," +
                            "node8=node(7)" +
                            "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5-[r5:To]->node6-[r6:To]->node7-[r7:To]->node8 " +
                            "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)+ TOINT(r5.weight)+ TOINT(r6.weight)+ TOINT(r7.weight) ",
                            "params": {}
                        }),
                        success: function (data) {
                            threeStopDistances.push(parseInt(data.data[0][0]));
                            console.log(JSON.stringify(data.data[0][0]));
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
            else {
            }
        };

        function getMinIndex(arr) {
            var index = 0;
            var value = arr[0];
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] < value) {
                    value = arr[i];
                    index = i;
                }
            }
            return index;
        }

        $scope.waypoints = [];
        $scope.displayWaypoints = [];
        $scope.newJourneyDistance = 0;
        $scope.minIndex = function () {
            if ($scope.waypoints.length > 0) {
                $scope.waypoints.splice(0, $scope.waypoints.length);
                $scope.displayWaypoints.splice(0, $scope.displayWaypoints.length);
            }
            var node_id_array = ["0", "1", "2", "3", "4", "5", "12", "13"];
            var town_array = ["Foynes, Ireland", "Askeaton, Ireland", "Kanturk, Ireland",
                "Dromcollogher, Ireland", "Listowel, Ireland", "Newcastle West, Ireland",
                "Cahirciveen, Ireland", "Killorglin, Ireland"];

            var idx;
            arrayLength = node_ids.length;

            if (arrayLength == 2) {
                idx = getMinIndex(oneStopDistance);
                $scope.newJourneyDistance = oneStopDistance[idx];
            }
            if (arrayLength == 4) {
                idx = getMinIndex(twoStopDistances);
                $scope.newJourneyDistance = twoStopDistances[idx];
            }
            if (arrayLength == 6) {
                idx = getMinIndex(threeStopDistances);
                $scope.newJourneyDistance = threeStopDistances[idx];
            }
            $scope.waypoints.push($scope.journey.source);
            for (var i = 0; i < arrayWithoutSourcesAtEnd_DestinationAsStart[idx].length; i++) {
                for (var j = 0; j < node_id_array.length; j++) {
                    if (arrayWithoutSourcesAtEnd_DestinationAsStart[idx][i].localeCompare(node_id_array[j]) == 0) {
                        $scope.waypoints.push(town_array[j]);
                        $scope.displayWaypoints.push(town_array[j]);
                    }
                }
            }
            $scope.waypoints.push($scope.journey.destination);
            if ($scope.waypoints.length > 0) {
                $scope.isStopping = true;
                $scope.isOld = false;
                $scope.isKnew = true;
            }

        };

        $scope.isStopping = false;
        $scope.isOld = true;
        $scope.isKnew = false;

        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(id) {
            var idx = $scope.selection.indexOf(id);
            if (idx > -1) {
                $scope.selection.splice(idx, 1);

                if (id == 2) {
                    node_ids.splice(idx, 1);
                    $log.log(JSON.stringify(idx));
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 3) {
                    node_ids.splice(idx, 1);
                    $log.log(JSON.stringify(idx));
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 4) {
                    node_ids.splice(idx, 1);
                    $log.log(JSON.stringify(idx));
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 5) {
                    node_ids.splice(idx, 1);
                }
            }
            else {
                $scope.selection.push(id);
                if (id == 2) {
                    //var stopArray1 = ["0", "1"];
                    //node_ids.push(stopArray1);
                    node_ids.push("0");
                    node_ids.push("1");
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 3) {
                    //var stopArray2 = ["2", "3"];
                    //node_ids.push(stopArray2);
                    node_ids.push("2");
                    node_ids.push("3");
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 4) {
                    //var stopArray3 = ["4", "5"];
                    //node_ids.push(stopArray3);
                    node_ids.push("4");
                    node_ids.push("5");
                    $log.log(JSON.stringify(node_ids));
                }
                if (id == 5) {
                    //var stopArray4 = ["12", "13"];
                    //node_ids.push(stopArray4);
                    node_ids.push("12");
                    node_ids.push("13");
                    $log.log(JSON.stringify(node_ids));
                }
            }
            if ($scope.selection.length < 1) {
                $scope.isStopping = false;
                $scope.isOld = true;
                $scope.isKnew = false;
            }

        };

        $scope.sendForm = function () {
            var wayPointsArray = [];
            for (var i = 0; i < $scope.displayWaypoints.length; i++) {
                var wayPointObject = {'name': $scope.displayWaypoints[i]};
                wayPointsArray.push(wayPointObject);
            }
            $scope.journey.waypts = wayPointsArray;

            $http.post("/api/journey/registerDriverJourney", $scope.journey)
                .success(function (data, status, headers, config) {
                    $scope.success = 'OK';
                })
                .error(function (response) {
                    $scope.success = null;
                    if (response.status === 500) {
                        $scope.error = 'ERROR';
                    }
                });
        };

        var journeyRequestLength = 0;
        $scope.searchByDate = function (page) {
            var searchData = {
                'date': $filter('date')($scope.journey.date, "dd/MM/yyyy")
            };
            $http.post('/api/journey/searchPassengerJourney?page=' + page, searchData).
                success(function (data, status, headers, config) {
                    $scope.journeyRequest = data.content;
                    $scope.noJourneys = $scope.journeyRequests <= 0 ? true : false;
                    journeyRequestLength = $scope.journeyRequest.length;
                }).
                error(function (data) {
                    //$log.log(data);
                });
        };

        $scope.isChecked = false;
        $scope.isNotValidDate = false;

        $scope.validate = function () {
            $scope.searchByDate();
            var remember = document.getElementById('remember');
            if (remember.checked) {

                if ($scope.journey.username == null) {
                    $scope.isNotValidDate = true;
                }
                else {
                    if (journeyRequestLength <= 0 || journeyRequestLength == null) {
                        $scope.isNotValidDate = true;
                    }
                    else {
                        $scope.isChecked = true;
                    }
                }
            }
            else {
                $scope.isChecked = false;
                $scope.journey.waypts = null;
                $scope.isNotValidDate = false;
            }
        };


    });



