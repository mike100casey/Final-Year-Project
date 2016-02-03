'use strict';

angular.module('fYPApp')
    .controller('RegisterController', function ($scope, $timeout, Auth, $http) {
        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.errorUserExists = null;
        $scope.registerAccount = {};
        $timeout(function () {
            angular.element('[ng-model="registerAccount.login"]').focus();
        });

        $scope.userType = "driver";
        $scope.registerAccount.userType = "driver";
        $scope.car = {};

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

        $("[name='my-checkbox']").bootstrapSwitch();
        $('input[name="my-checkbox"]').on('switchChange.bootstrapSwitch', function (event, state) {
            if (state == true) {
                $('#carDetails').show();
                $scope.userType = "driver";
                $scope.registerAccount.userType = "driver";
            } else {
                $('#carDetails').hide();
                $scope.userType = "passenger";
                $scope.registerAccount.userType = "passenger";
                alert($scope.registerAccount.userType);
            }
        });

        $scope.years = [];
        $scope.currentYear = (new Date).getFullYear();
        $scope.minYear = 1980;

        for (var i = $scope.currentYear; i >= $scope.minYear; i--) {
            $scope.years.push(i);
        }

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
