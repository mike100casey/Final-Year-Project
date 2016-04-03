'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('postedJourneys', {
                parent: 'site',
                url: '/postedJourneys',
                data: {
                    authorities: [],
                    pageTitle: 'Posted Journeys'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/showPostedJourneys/showPostedJourneys.html',
                        controller: 'DriverJourneyController1'
                    }
                },
                resolve: {

                }
            });
    });
