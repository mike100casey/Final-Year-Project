'use strict';

angular.module('fYPApp')
    .controller('NavbarController', function ($scope, $location, $state, Auth, Principal, ENV, $http) {
        $scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';

        $scope.logout = function () {
            Auth.logout();
            $state.go('home');
        };

        Principal.identity().then(function (account) {
            if (account != null) {
                $scope.userName = account.login;
                $scope.getCar();
            }
        });

        $scope.$on('username', function () {
            Principal.identity().then(function (account) {
                $scope.userName = account.login;
                $scope.getCar();
            });
        });

        $scope.getCar = function () {
            $http.get('/api/car/getUserCar/' + $scope.userName).
                success(function (data, status, headers, config) {
                    $scope.make = data.make;
                    $scope.isDriver = $scope.make != "";
                })
                .error(function (data, status, headers, config) {
                    // log error
                });
        };
    });
