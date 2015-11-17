'use strict';

angular.module('fYPApp')
    .controller('RegisterController', function ($scope, $timeout, Auth,$http) {
        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.errorUserExists = null;
        $scope.registerAccount = {};
        $timeout(function (){angular.element('[ng-model="registerAccount.login"]').focus();});

        $scope.register = function () {
            if ($scope.registerAccount.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                $scope.registerAccount.langKey =  'en' ;
                $scope.doNotMatch = null;
                $scope.error = null;
                $scope.errorUserExists = null;
                $scope.errorEmailExists = null;

                Auth.createAccount($scope.registerAccount).then(function () {
                    $scope.success = 'OK';
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
        $("[name='my-checkbox']").bootstrapSwitch();
        $('input[name="my-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
            if(state == true){
                $('#carDetails').show();
            }else {
                $('#carDetails').hide();
            }
        });

        $scope.getMakes = function(){
            $http.get('/api/dropdown/makes').
                success(function(data, status, headers, config){
                    $scope.makes = data.makes;
                }).
                error(function(data, status, headers, config) {
                    // log error
                });
        };
        $scope.getMakes();
    });
