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

        var allNodes = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            //sourceNodes.push({"name": this.source, "source_id": this.id});.push(,
            allNodes.push(this.source);
            allNodes.push(this.destination);
        });

        var destinationNodes = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            destinationNodes.push(this.destination);
        });

        var startNodes = [];
        $(jQuery.parseJSON(JSON.stringify($scope.journeyRequests.content))).each(function () {
            startNodes.push(this.source);
        });

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
        };

        var combinations = routeGenerator(allNodes);

        var numbers = [];
        var uniqueNumbers = [];
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
        console.log(startNodes.toString());

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
        var arrayWithoutSourcesAtEnd = $.grep(arrayWithoutDestinationsAtStart, function (n, i) {
            return $.inArray(i, uniqueNumbersToRemove) == -1;
        });

        //console.log(combinations[0].length);

        printArray(arrayWithoutSourcesAtEnd.join("<br>"));
        var x = new Array();
        $scope.waypts = [];
        for (var i = 0; i <  1; i++) {
            for (var j = 0; j < arrayWithoutSourcesAtEnd[arrayWithoutSourcesAtEnd.length - 1].length; j++) {
                //for (var k = 0; k < 1; k++) {
                    $scope.waypts.push(
                        x.push({
                            location: arrayWithoutSourcesAtEnd[0][j],
                            stopover: true
                        }));
                //}
            }
        }
        console.log(JSON.stringify(x));
        $scope.calcRoute = function () {
            var myDirectionsDisplay = new google.maps.DirectionsRenderer({'map': map, 'draggable': true});
            var request = {
                origin: "Cahirciveen, Kerry",
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


        var source = JSON.stringify({
            "name": "Tralee"

        });
        $scope.postRoute = function () {
            $.ajax({
                url: "http://localhost:7474/db/data/node ",
                type: "POST",
                data: source,
                contentType: "application/json"
            })
                .done(function (result) {
                    //console.log(result);
                    console.log("Success");
                })
                .fail(function (error) {
                    console.log(error.statusText);
                });
        };
        var dis = 34;

        var query = "CREATE (s1:Town { name : 'Abbeyfeale'})" +
            "CREATE (s2:Town { name : 'Tralee'})" +
            "CREATE (s3:Town { name : 'Castleisland'})" +
            "CREATE (s4:Town { name : 'Listowel'})" +
            "CREATE (s5:Town { name : 'Newcastle'})" +
            "CREATE (s6:Town { name : 'Knocknagosel'})" +
            "CREATE (s1)-[:Goes_To]->(s2) " +
            "CREATE (s1)-[:Goes_To ]->(s3) " +
            "CREATE (s1)-[:Goes_To ]->(s4) " +
            "CREATE (s1)-[:Goes_To ]->(s5) " +
            "CREATE (s1)-[:Goes_To ]->(s4) " +
            "CREATE (s1)-[:Goes_To ]->(s6) " +
            "CREATE (s2)-[:Goes_To ]->(s3) " +
            "CREATE (s2)-[:Goes_To ]->(s4) " +
            "CREATE (s2)-[:Goes_To ]->(s6) ";


        var query1 = "MATCH ({ name: 'Abbeyfeale' })-[:contains*0..]->(parentDir)-[:leaf]->(file) RETURN file";
        var query2 = "MATCH (a)        WHERE a.name='Tralee'        RETURN size((a)-->()-->()) AS fof";

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
                    "query": query2,

                    //"query": "CREATE (a:Person { name:'Tom Hanks', born:1956 })-[r:ACTED_IN ]->(m:Movie { title:'Forrest Gump',released:1994 })"+
                    //   "CREATE (d:Person { name:'Robert Zemeckis', born:1951 })-[:DIRECTED]->(m)RETURN a,d,r,m",
                    //"query": " UNWIND { props } AS map  CREATE (n) SET n = map",
                    // "query": "START n=node(*) match n-[r?]-() where r is null return n",
                    //START a=node(...), b=node(...) CREATE UNIQUE a-[r:CONNECTED_TO]-b SET r.weight = coalesce(r.weight?, 0) + 1
                    // "query" : " CREATE (n:Destination { props }) ",
                    //"query" : " START n=node:nameIdx(name='Abbeyfeale')return id(n)",

                    //"query" : " START n=node(*) WHERE n.name = 'Tralee' return id(n)",

                    //"query" : " CREATE (jdoe {name:'John Doe'})-[r:friend]->(mj {name:'Mary Joe'}) return r, jdoe, mj",;
                    //"query" : " START n=node(*) where n.name = 'Bob' return n",
                    //"query" : "START first = node(18), second = node(19) CREATE first-[r:CONNECTED_TO]->second SET r.weight = "+dis +" return r",
                    // "query" : "start n = node(*) return n;",
                    "params": {
                        //"props": destinationNodes
                    }
                }),
                success: function (data, textStatus, jqXHR) {

                    console.log(JSON.stringify(data));
                },
                error: function (jqXHR, textStatus) {
                    console.log(textStatus);
                }
            });//end of ajax
        };

        $scope.delRelations = function () {
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
        //


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
