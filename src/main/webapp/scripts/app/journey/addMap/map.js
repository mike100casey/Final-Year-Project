'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('map', {
                parent: 'map',
                url: '/map',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: 'Map'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/journey/addMap/map.html',
                        controller: 'MapController'
                    }
                },
                resolve: {

                }
            });
    });
