'use strict';

angular.module('fYPApp')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


