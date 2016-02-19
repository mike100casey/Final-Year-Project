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
                    console.log(JSON.stringify(data));
                    $scope.make = data.make;
                    if ($scope.make == "") {
                        $scope.isDriver = false;
                    }
                    else {
                        $scope.isDriver = true;
                    }
                })
                .error(function (data, status, headers, config) {
                    // log error
                });
        };
    });
