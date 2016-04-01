/**
 *
 * Created by Michael on 2/1/2016.
 */


'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('addDriverJourneys', {
                parent: 'site',
                url: '/findPassengers',
                data: {
                    roles: [],
                    pageTitle: 'add Driver Journeys'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/addDriverJourney/addDriverJourney.html',
                        controller: 'addDriverJourneyController'
                    }
                },
                resolve: {

                }
            });
    });
