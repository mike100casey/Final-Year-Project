/**
 *
 * Created by Michael on 4/11/2016.
 */

'use strict';

angular.module('fYPApp')
    .controller('ProfileController', function ($scope, $log, $http, Principal, $state) {

        $scope.isAuthenticated = Principal.isAuthenticated;
        Principal.identity().then(function (account) {
            $scope.account = account;
            if ($scope.account != null) {
                $scope.me = account.login;
            }
            else {
                $scope.me = null;
            }
        });

        $scope.isChecked = false;

        $scope.getMyJourneys = function (pageNumber) {
            $http.get('/api/journey/allJourneys/' + $scope.me + '?page=' + pageNumber).
                success(function (data) {
                    $scope.journeys = data.content;
                    $scope.noJourneys = $scope.journeys <= 0;
                }).error(function (data) {
                    $state.go('error');
                });
        };


        $scope.add = function () {
            $scope.getMyJourneys(0);
           $scope.isChecked = true;
       };

        //http://plnkr.co/edit/ToGJCbFOEmD46XDHLtt1?p=preview
        $scope.$watch('isopen', function (newvalue, oldvalue, scope) {
            scope.$parent.isopen = newvalue;
        });


    });
