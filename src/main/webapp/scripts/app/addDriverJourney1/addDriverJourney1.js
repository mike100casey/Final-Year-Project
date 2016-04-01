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
                        templateUrl: 'scripts/app/addDriverJourney1/addDriverJourney1.html',
                        controller: 'DriverJourneyController1'
                    }
                },
                resolve: {

                }
            });
    });
