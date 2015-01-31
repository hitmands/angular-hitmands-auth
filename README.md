# Angular Hitmands Auth
[![Build Status](https://travis-ci.org/hitmands/angular-hitmands-auth.svg?branch=master)](https://travis-ci.org/hitmands/angular-hitmands-auth) [![Code Climate](https://codeclimate.com/github/hitmands/angular-hitmands-auth/badges/gpa.svg)](https://codeclimate.com/github/hitmands/angular-hitmands-auth) [![Test Coverage](https://codeclimate.com/github/hitmands/angular-hitmands-auth/badges/coverage.svg)](https://codeclimate.com/github/hitmands/angular-hitmands-auth)

#### Simple implementation of Authentication System in [AngularJS](http://angularjs.org) based Applications.
___

**Note:** *This module requires [AngularJS ^1.3](http://angularjs.org) and [Angular UI-Router ^0.2](http://angular-ui.github.io/ui-router/).*

Table of Content:
* [Getting Started](#getting-started)
* [Configuration](#module-config)
* [Usage](#module-run)


##<a name="getting-started"></a> Get Started
```
$ bower install --save angular-hitmands-auth
```


```html
<!doctype html>
<html ng-app="myApp">
<head>
    <!-- Install AngularJS -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.7/angular.min.js"></script>

    <!-- Install Angular UI-Router -->
    <script src="js/angular-ui-router.min.js"></script>

    <!-- Install Angular Hitmands Auth -->
    <script src="js/angular-hitmands-auth.min.js"></script>

    <!-- Create Your App-->
    <script>
        var myApp = angular.module('myApp', ['ui.router', 'hitmands.auth']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```

##<a name="module-config"></a> Configuration
```javascript
// app/configs/auth.config.js

angular
    .module('myApp')
    .config(function(AuthServiceProvider, $stateProvider) {


        // Sets API ENDPOINTS
        AuthServiceProvider.useRoutes({
                login: '/api/v1/users/login',
                logout: '/api/v1/users/logout',
                fetch: '/api/v1/users/logged-in'
            });

        // Append AUTH TOKEN to the headers for all http requests
        AuthServiceProvider.tokenizeHttp('MY-CUSTOM-HEADER-KEY');

        // Encrypt login requests like headers['Authorization'] = 'Basic' + ' ' + btoa(credentials.username + ':' + credentials.password)
        AuthServiceProvider.useBasicAuthentication();


        // Callback that handles the $http Response and returns the AuthData to the AuthService
        AuthServiceProvider.parseHttpAuthData(function(data, headers, statusCode) {
            // Logic
            var authLevel = 1000; // ['public', 'author', 'editor'];

            return {
                user: data,
                authLevel: authLevel,
                token: headers['X-AUTH-AUTHTOKEN']
            };
        });

        // If the user is already logged-in
        if(angular.isDefined(window.persistentUserData) && angular.isDefined(window.persistentAuthLevel && angular.isDefined(window.persistentAuthToken) {
            AuthServiceProvider.setLoggedUser(
                window.persistentUserData,
                window.persistentAuthToken,
                window.persistentAuthLevel
            );
        }

        //Define protected states
        var dashboard = {
            name: 'dashboard',
            url: '/admin/dashboard',
            views: { ... },
            data: { someValue: ..., otherValue: ... }
        };

        // the authLevel property can be attached on dashboard or dashboard.data object,
        // if attached on dashboard.data it will be inherited from other child states.
        Object.defineProperty(dashboard.data, 'authLevel', {
            value: 1000, // or ['author', 'editor', 'administrator']
            writable: false,
            configurable: false,
            enumerable: true
        });
        $stateProvider
            .state(dashboard)
    });
```

##<a name="module-run"></a> Usage
```javascript
// app/auth.run.js

angular
    .module('myApp')
    .run(function($rootScope, AuthService) {

        $rootScope.currentUser = AuthService.getCurrentUser();
        $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();

        $rootScope.$on('hitmands.auth:update', function() {
            $rootScope.currentUser = AuthService.getCurrentUser();
            $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();
        });

    });
```


