/**
 *
 * Created by Michael on 2/1/2016.
 */

'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('passengerMap', {
                parent: 'site',
                url: '/map',
                data: {
                    authorities: [],
                    pageTitle: 'Add Passenger Journey'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/addPassengerJourney/addPassengerJourney.html',
                        controller: 'MapController'
                    }
                },
                resolve: {

                }
            });
    });
