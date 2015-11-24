'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('map', {
                parent: 'account',
                url: '/map',
                data: {
                    authorities: [],
                    pageTitle: 'Map'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/map/map.html',
                        controller: 'MapController'
                    }
                },
                resolve: {

                }
            });
    });
