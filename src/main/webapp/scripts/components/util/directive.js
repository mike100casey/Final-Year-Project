/**
 *
 * Created by Michael on 11/24/2015.
 */
angular.module('fYPApp.directive.map', [])
    .directive('myMap', function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div></div>',
            link: function(scope, element, attrs) {
                var element = document.getElementById("map_canvas");
                var mapTypeIds = [];
                for(var type in google.maps.MapTypeId) {
                    mapTypeIds.push(google.maps.MapTypeId[type])
                }
                mapTypeIds.push("OSM");
                 map = new google.maps.Map(element, {
                    center: new google.maps.LatLng(53.5, -8.623056),
                    zoom: 7,
                    mapTypeId: "OSM",
                    mapTypeControlOptions: {
                        mapTypeIds: mapTypeIds
                    }
                });
                map.mapTypes.set("OSM", new google.maps.ImageMapType({
                    getTileUrl: function(coord, zoom) {
                        return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                    },
                    tileSize: new google.maps.Size(256, 256),
                    name: "OpenStreetMap",
                    maxZoom: 11}));
            }
        };


        //return {
        //    restrict: 'E',
        //    replace: true,
        //    template: '<div></div>',
        //    link: function(scope, element, attrs) {
        //        var myOptions = {
        //            zoom: 6,
        //            draggable: true,
        //            center: new google.maps.LatLng(53.312800596408394, -7.910156247500026),
        //            mapTypeId: google.maps.MapTypeId.ROADMAP,
        //            region: "ireland"
        //        };
        //        map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
        //    }//Link
        //}; //return
    });

