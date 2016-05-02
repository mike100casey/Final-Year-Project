'use strict';

angular.module('fYPApp')
    .controller('RegisterController', function ($scope,Principal, $timeout, Auth, $http) {

        $scope.$on('username', function(){
            Principal.identity().then(function(account) {
                $scope.account = account;
                $scope.me = account.login;
                $scope.registerAccount.login = $scope.me;
            });
        });

        $scope.success = null;
        $scope.error = null;
        $scope.carError = null;
        $scope.userType = "driver";
        $scope.doNotMatch = null;
        $scope.errorUserExists = null;
        $scope.registerAccount = {};
        $timeout(function () {
            angular.element('[ng-model="registerAccount.login"]').focus();
        });

        /**
         *
         * Created by Michael on 2/1/2016.
         */
        $scope.getMakes = function () {
            $http.get('/api/dropdown/makes').
                success(function (data, status, headers, config) {
                    $scope.makes = data.makes;
                }).
                error(function (data, status, headers, config) {
                    // log error
                });
        };

        $scope.getModels = function (make) {
            $http.get('/api/dropdown/models/' + make).
                success(function (data, status, headers, config) {
                    $scope.models = data.MakeAndModel;
                }).
                error(function (data, status, headers, config) {
                    console.log(data);
                });
        };
        $scope.getMakes();

        $scope.car = {};
        $scope.isDriver = true;
        $scope.years = [];
        $scope.currentYear = (new Date).getFullYear();
        $scope.minYear = 1960;
        for(var i = $scope.currentYear; i >= $scope.minYear; i--){
            $scope.years.push(i);
        }
        $(' a #radioBtn').on('click', function(){
            var sel = $(this).data('title');
            var tog = $(this).data('toggle');
            $('#'+tog).prop('value', sel);

            $('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
            $('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
        });

        $scope.registerCar = function(){
            if($scope.userType == "driver")
            {
                var carData = {
                    'userName': $scope.registerAccount.login,
                        'makeAndModel': $scope.car.model,
                        'year':$scope.car.year
                };
                $http.post('/api/car/registration',carData).
                    success(function(data, status, headers, config){
                        $scope.carSuccess = true;
                    }).
                    error(function(data, status, headers, config){
                        $scope.carError = true;
                    });
            }
        };

        $scope.register = function () {
            if ($scope.registerAccount.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                $scope.registerAccount.langKey = 'en';
                $scope.doNotMatch = null;
                $scope.error = null;
                $scope.errorUserExists = null;
                $scope.errorEmailExists = null;

                Auth.createAccount($scope.registerAccount).then(function () {
                    $scope.success = 'OK';
                    $scope.registerCar();
                }).catch(function (response) {
                    $scope.success = null;
                    if (response.status === 400 && response.data === 'login already in use') {
                        $scope.errorUserExists = 'ERROR';
                    } else if (response.status === 400 && response.data === 'e-mail address already in use') {
                        $scope.errorEmailExists = 'ERROR';
                    } else {
                        $scope.error = 'ERROR';
                    }
                });
            }
        };

    });
