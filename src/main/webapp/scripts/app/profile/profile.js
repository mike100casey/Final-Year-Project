/**
 *
 * Created by Michael on 4/11/2016.
 */

'use strict';

angular.module('fYPApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('profile', {
                parent: 'site',
                url: '/profile',
                data: {
                    roles: [],
                    pageTitle: 'user profile'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/profile/profile.html',
                        controller: 'ProfileController'
                    }
                },
                resolve: { }
            });
    });
