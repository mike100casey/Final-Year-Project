'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('map', {
                parent: 'site',
                url: '/map',
                data: {
                    authorities: [],
                    pageTitle: 'Map'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/map/map.html',
                        controller: 'MapController'
                    }
                },
                resolve: {

                }
            });
    });
