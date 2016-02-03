/**
 *
 * Created by Michael on 2/1/2016.
 */


'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('findPassengers', {
                parent: 'site',
                url: '/findPassengers',
                data: {
                    roles: [],
                    pageTitle: 'findPassengers.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/search/PassengerRequest.html',
                        controller: 'FindRequestController'
                    }
                },
                resolve: {

                }
            });
    });
