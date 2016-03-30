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
                }).
                error(function (data, status, headers, config) {
                    // log error
                });
        };
        $scope.showJourneyRequests(0);

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
                    success: function (data, textStatus, jqXHR) {
                        console.log(JSON.stringify(data));
                    },
                    error: function (jqXHR, textStatus) {
                        console.log(textStatus);
                    }
                });
            }
        };

        $scope.calculateRoute = function () {
            var myDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var start = angular.element('#source').val();
            var end = angular.element('#destination').val();

            var request = {
                origin: start,
                destination: "Limerick, Ireland",
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
                    console.log(dist);
                }
            });
        };

        $scope.getRoute = function () {
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
                    //"query": query2,
                    //"query": "CREATE (a:Person { name:'Tom Hanks', born:1956 })-[r:ACTED_IN ]->(m:Movie { title:'Forrest Gump',released:1994 })"+
                    //"CREATE (d:Person { name:'Robert Zemeckis', born:1951 })-[:DIRECTED]->(m)RETURN a,d,r,m",
                    //"query": " UNWIND { props } AS map  CREATE (n) SET n = map",
                    //"query": "START n=node(*) match n-[r?]-() where r is null return n",
                    //START a=node(...), b=node(...) CREATE UNIQUE a-[r:CONNECTED_TO]-b SET r.weight = coalesce(r.weight?, 0) + 1
                    "query": " CREATE (n:Destination { props }) ",
                    //"query" : " START n=node:nameIdx(name='Abbeyfeale')return id(n)",
                    //"query" : " START n=node(*) WHERE n.name = 'Tralee' return id(n)",
                    //"query" : " CREATE (jdoe {name:'John Doe'})-[r:friend]->(mj {name:'Mary Joe'}) return r, jdoe, mj",;
                    //"query" : " START n=node(*) where n.name = 'Tralee' return n",
                    //"query" : "START first = node(18), second = node(19) CREATE first-[r:CONNECTED_TO]->second SET r.weight = "+dis +" return r",
                    // "query" : "start n = node(*) return n;",
                    "params": {
                        "props": {
                            "position": "Developer",
                            "name": "Andres"
                        }
                    }
                }),
                success: function (data, textStatus, jqXHR) {

                    console.log(JSON.stringify(data));
                },
                error: function (jqXHR, textStatus) {

                    console.log(jqXHR);
                }
            });//end of ajax
        };

        $scope.delNodes = function () {
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
                    "query": " START n=node(*) delete n", "params": {}
                }),
                success: function (data, textStatus, jqXHR) {
                    console.log(JSON.stringify(data));
                },
                error: function (jqXHR, textStatus) {
                    console.log(textStatus);
                }
            });//end of ajax
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

        var destinationNodes = [];
        destinationNodes.push("1");
        destinationNodes.push("3");
        destinationNodes.push("5");
        destinationNodes.push("13");

        var startNodes = [];
        startNodes.push("0");
        startNodes.push("2");
        startNodes.push("4");
        startNodes.push("12");
        var node_ids = [];
        var oneStopDistance = [];
        var twoStopDistances = [];
        var threeStopDistances = [];
        var arrayWithoutSourcesAtEnd = [];


        var arrayLength;

        $scope.paths = function () {
            var numbers = [];
            var uniqueNumbers = [];

            var combinations = routeGenerator(node_ids);
            $scope.removeDestinationsFromStart = function () {
                for (var z = 0; z < combinations.length; z++) {
                    for (var i = 0; i < combinations[z].length; i++) {
                        for (var j = 0; j < destinationNodes.length; j++) {
                            if (combinations[z][0].indexOf(destinationNodes[j]) !== -1) {
                                numbers.push(z);
                                $.each(numbers, function (i, el) {
                                    if ($.inArray(el, uniqueNumbers) === -1) uniqueNumbers.push(el);
                                });
                                break;
                            }
                        }
                    }
                }
            };
            $scope.removeDestinationsFromStart();
            var arrayWithoutDestinationsAtStart = $.grep(combinations, function (n, i) {
                return $.inArray(i, uniqueNumbers) == -1;
            });

            var len = arrayWithoutDestinationsAtStart[0].length - 1;
            var sourceNumbers = [];
            var uniqueNumbersToRemove = [];
            $scope.removeSourcesFromEnd = function () {
                for (var z = 0; z < arrayWithoutDestinationsAtStart.length; z++) {
                    for (var i = 0; i < arrayWithoutDestinationsAtStart[z].length; i++) {
                        for (var j = 0; j < startNodes.length; j++) {
                            if (arrayWithoutDestinationsAtStart[z][len].indexOf(startNodes[j]) !== -1) {
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
            arrayWithoutSourcesAtEnd = $.grep(arrayWithoutDestinationsAtStart, function (n, i) {
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
                    success: function (data, textStatus, jqXHR) {
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
                for (var i = 0; i < arrayWithoutSourcesAtEnd.length; i++) {
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
                            "node2=node(" + arrayWithoutSourcesAtEnd[i][0] + ")," +
                            "node3=node(" + arrayWithoutSourcesAtEnd[i][1] + ")," +
                            "node4=node(" + arrayWithoutSourcesAtEnd[i][2] + ")," +
                            "node5=node(" + arrayWithoutSourcesAtEnd[i][3] + ")," +
                            "node8=node(7)" +
                            "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5-[r5:To]->node8 " +
                            "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)+ TOINT(r5.weight) ",
                            "params": {}
                        }),
                        success: function (data, textStatus, jqXHR) {
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
                for (var k = 0; k < arrayWithoutSourcesAtEnd.length; k++) {
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
                            "node2=node(" + arrayWithoutSourcesAtEnd[k][0] + ")," +
                            "node3=node(" + arrayWithoutSourcesAtEnd[k][1] + ")," +
                            "node4=node(" + arrayWithoutSourcesAtEnd[k][2] + ")," +
                            "node5=node(" + arrayWithoutSourcesAtEnd[k][3] + ")," +
                            "node6=node(" + arrayWithoutSourcesAtEnd[k][4] + ")," +
                            "node7=node(" + arrayWithoutSourcesAtEnd[k][5] + ")," +
                            "node8=node(7)" +
                            "MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5-[r5:To]->node6-[r6:To]->node7-[r7:To]->node8 " +
                            "RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)+ TOINT(r5.weight)+ TOINT(r6.weight)+ TOINT(r7.weight) ",
                            "params": {}
                        }),
                        success: function (data, textStatus, jqXHR) {
                            threeStopDistances.push(parseInt(data.data[0][0]));
                            console.log(JSON.stringify(data.data[0][0]));
                        },
                        error: function (jqXHR, textStatus) {
                            console.log(textStatus);
                        }
                    });
                }
            }
            else {}
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
        $scope.minIndex = function () {
            var node_id_array = ["0", "1", "2", "3", "4", "5", "12", "13"];
            var town_array = ["Foynes, Ireland", "Askeaton, Ireland", "Kanturk, Ireland",
                "Dromcollogher, Ireland", "Listowel, Ireland", "Newcastle West, Ireland",
                "Cahirciveen, Ireland", "Killorglin, Ireland"];

            var idx;
            var arrayLength = node_ids.length;

            if (arrayLength == 2){
                idx = getMinIndex(oneStopDistance);
                console.log(oneStopDistance[idx]);
                document.getElementById("combinedJourneyDistance").innerHTML = "Journey distance from" +
                    " Tralee to Limerick with selected stops is " + oneStopDistance[idx] + " km";
            }
            if (arrayLength == 4){
                idx = getMinIndex(twoStopDistances);
                console.log(twoStopDistances[idx]);
                document.getElementById("combinedJourneyDistance").innerHTML = "Journey distance from" +
                    " Tralee to Limerick with selected stops is " + twoStopDistances[idx] + " km";
            }
            if (arrayLength == 6) {
                idx = getMinIndex(threeStopDistances);
                console.log(threeStopDistances[idx]);
                document.getElementById("combinedJourneyDistance").innerHTML = "Journey distance from" +
                    " Tralee to Limerick with selected stops is " + threeStopDistances[idx] + " km";
            }
            console.log(idx);

            for (var i = 0; i < arrayWithoutSourcesAtEnd[idx].length; i++) {
                for (var j = 0; j < node_id_array.length; j++) {
                    if (arrayWithoutSourcesAtEnd[idx][i].localeCompare(node_id_array[j]) == 0) {
                        $scope.waypoints.push(town_array[j]);
                    }
                }
            }
        };

        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(id) {
            var idx = $scope.selection.indexOf(id);
            if (idx > -1) {
                $scope.selection.splice(idx, 1);

                if (id == 19) {
                    node_ids.splice(idx, 1);
                    node_ids.splice(idx, 1);
                }
                if (id == 20) {
                    node_ids.splice(idx, 1);
                    node_ids.splice(idx, 1);
                }
                if (id == 21) {
                    node_ids.splice(idx, 1);
                    node_ids.splice(idx, 1);
                }
                if (id == 22) {
                    node_ids.splice(idx, 1);
                    node_ids.splice(idx, 1);
                }
            }
            else {
                $scope.selection.push(id);
                if (id == 19) {
                    node_ids.push("0");
                    node_ids.push("1");
                }
                if (id == 20) {
                    node_ids.push("2");
                    node_ids.push("3");
                }
                if (id == 21) {
                    node_ids.push("4");
                    node_ids.push("5");
                }
                if (id == 22) {
                    node_ids.push("12");
                    node_ids.push("13");
                }
            }
        };


    });


//$scope.getRoute = function () {
//    $scope.node = [];
//    $.ajax({
//        url: "http://localhost:7474/db/data/cypher",
//        // url: "http://localhost:7474/db/data/node/2/relationships/cypher",
//        accepts: "application/json; charset=UTF-8",
//        dataType: "json",
//        data: {
//            "query": "start n  = node(*) return n",
//            //"query":"MATCH (*) RETURN node.property",
//            "params": {}
//        },
//        type: "POST",
//        success: function (data, xhr, status) {
//            //$scope.node = data.data[0][0].data;
//            for (var i = 0; i < data.data.length; i++) {
//                $scope.node.push(data.data[i][0].data.name);
//            }
//            console.log(JSON.stringify($scope.node));
//            //console.log(JSON.stringify(data));
//        },
//        error: function (xhr, err, msg) {
//            console.log(xhr);
//            console.log(err);
//            console.log(msg);
//        }
//    });
//};

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
//}

////$scope.waypts = [];
////var wayPointsArr = [];
////for (var i = 0; i <= combinations.length - 1; i++) {
////    var waypointsObj = ({"location": combinations[i], "stopover": true});
////    $scope.waypts.push(waypointsObj);
////
////}
////console.log(JSON.stringify(wayPointsArr));
////
////$scope.removeRoute = function () {
////    $state.reload();
////};
////
////var start;
////var end;
////$scope.add = function (value) {
////    start = $scope.journey.source;
////    end = $scope.journey.driverDestination;
////};
//


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
//
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
//

////console.log(destinationNodes.length);
////printArray(arrayWithoutSourcesAtEnd.join("<br>"));
//var x = [];
//$scope.waypts = [];
//for (var i = 0; i < 1; i++) {
//    for (var j = 0; j < arrayWithoutSourcesAtEnd[arrayWithoutSourcesAtEnd.length - 1].length; j++) {
//        //for (var k = 0; k < 1; k++) {
//        $scope.waypts.push(
//            x.push({
//                location: arrayWithoutSourcesAtEnd[0][j],
//                stopover: true
//            }));
//        //}
//    }
//}

//var serverURL = "http://localhost:7474/db/data";
//$.ajax({
//    type: "POST",
//    url: serverURL + "/cypher",
//    accepts: "application/json",
//    dataType: "json",
//    contentType: "application/json",
//    headers: {
//        "X-Stream": "true"
//    },
//    data: JSON.stringify({
//        query: query1,
//        //query: "START node1=node(6)," +
//        //"node2=node(" + arrayWithoutSourcesAtEnd[i][0] + ")," +
//        //"node3=node(" + arrayWithoutSourcesAtEnd[i][1] + ")," +
//        //"node4=node(" + arrayWithoutSourcesAtEnd[i][2] + ")," +
//        //"node5=node(" + arrayWithoutSourcesAtEnd[i][3] + ")," +
//        ////"node6=node(" + arrayWithoutSourcesAtEnd[i][4] + ")," +
//        ////"node7=node(" + arrayWithoutSourcesAtEnd[i][5] + ")," +
//        //"node8=node(7)" +
//        //"MATCH paths = node1-[r1:To]->node2-[r2:To]->node3-[r3:To]-node4-[r4:To]->node5-[r5:To]->node8 " +
//        //"RETURN TOINT(r1.weight)+ TOINT(r2.weight) + TOINT(r3.weight) + TOINT(r4.weight)+ TOINT(r5.weight) ",
//        "params": {}
//    }),
//    success: function (data, textStatus, jqXHR) {
//        //bestDistance.push(parseInt(data.data[0][0]));
//        console.log(JSON.stringify(data.data[0][0]));
//        //for(var m=0; m < data.data.length ; m++) {
//        //    for(var i=0; i < data.data[0][0].length ; i++){
//        //        console.log(JSON.stringify(data.data[m][0][i].data.name));node6-[r6:To]->node7-[r7:To]-+ TOINT(r6.weight)+ TOINT(r7.weight)
//        //    }
//        //}
//    },
//    error: function (jqXHR, textStatus) {
//        console.log(textStatus);
//    }
//});
//var query1 = "MATCH ({ name: 'Abbeyfeale' })-[:contains*0..]->(parentDir)-[:leaf]->(Town) RETURN Town";
//var query2 = "MATCH (a) WHERE a.name='Tralee' RETURN size((a)-->()-->()) AS fof";
//for(var m=0; m < data.data.length ; m++) {
//    for(var i=0; i < data.data[0][0].length ; i++){
//        console.log(JSON.stringify(data.data[m][0][i].data.name));node6-[r6:To]->node7-[r7:To]-+ TOINT(r6.weight)+ TOINT(r7.weight)
//    }
//}
