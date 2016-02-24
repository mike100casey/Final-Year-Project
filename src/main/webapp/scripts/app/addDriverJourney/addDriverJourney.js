'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('driverPost', {
                parent: 'site',
                url: '/driverPost',
                data: {
                    authorities: [],
                    pageTitle: 'Driver Post'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/addDriverJourney/addDriverJourney.html',
                        controller: 'DriverJourneyController'
                    }
                },
                resolve: {

                }
            });
    });
