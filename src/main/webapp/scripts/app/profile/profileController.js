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
                $scope.userName = account.login;
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

        $scope.getMyPassengerJourneys = function (pageNumber) {
            $http.get('/api/journey/allPassengerJourneys/' + $scope.me + '?page=' + pageNumber).
                success(function (data) {
                    $scope.journeys = data.content;
                    $scope.noJourneys = $scope.journeys <= 0;
                }).error(function (data) {
                    $state.go('error');
                });
        };

        $scope.add = function () {
            $scope.getCar();
       };

        //http://plnkr.co/edit/ToGJCbFOEmD46XDHLtt1?p=preview
        $scope.$watch('isopen', function (newvalue, oldvalue, scope) {
            scope.$parent.isopen = newvalue;
        });

        $scope.$on('username', function () {
            Principal.identity().then(function (account) {
                $scope.userName = account.login;
                //$scope.getCar();
            });
        });

        $scope.getCar = function () {
            $http.get('/api/car/getUserCar/' + $scope.me)
                .success(function (data, status, headers, config) {
                    $scope.make = data.make;
                    $scope.isDriver = $scope.make != "";
                    if($scope.isDriver){
                        $scope.getMyJourneys(0);
                        $scope.isChecked = true;
                    }
                    else{
                        $scope.getMyPassengerJourneys(0);
                    }
                })
                .error(function (data, status, headers, config) {
                    $log.log(data);
                });
        };



    });
