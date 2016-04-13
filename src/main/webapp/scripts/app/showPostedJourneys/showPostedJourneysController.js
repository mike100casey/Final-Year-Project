'use strict';

angular.module('fYPApp')
    .controller('PostedJourneyController', function ($scope, $log, $http, Principal) {

        Principal.identity().then(function (account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        $scope.showJourney = function (pageNumber) {
            $http.get('/api/journey/allJourneyRequests?page=' + pageNumber).
                success(function (data) {
                    $scope.journeyRequests = data.content;
                }).
                error(function (data, status, headers, config) {
                    // log error
                });
        };
        $scope.showJourney(0);


    });
