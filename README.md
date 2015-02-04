# Angular Hitmands Auth
[![Build Status](https://travis-ci.org/hitmands/angular-hitmands-auth.svg?branch=master)](https://travis-ci.org/hitmands/angular-hitmands-auth) [![Code Climate](https://codeclimate.com/github/hitmands/angular-hitmands-auth/badges/gpa.svg)](https://codeclimate.com/github/hitmands/angular-hitmands-auth) [![Test Coverage](https://codeclimate.com/github/hitmands/angular-hitmands-auth/badges/coverage.svg)](https://codeclimate.com/github/hitmands/angular-hitmands-auth)

#### Simple implementation of Authentication System in [AngularJS](http://angularjs.org) based Applications.
___

**Note:** *This module requires [AngularJS ^1.3](http://angularjs.org) and [Angular UI-Router ^0.2](http://angular-ui.github.io/ui-router/).*

Table of Content:
* [Getting Started](#getting-started)
* [Configuration](#module-config)
* [Usage](#module-run)
* [Events](#module-events)
* [Directives](#module-directives-login)
  * [Login](#module-directives-login)
  * [Logout](#module-directives-logout)
  * [Classes Authentication](#module-directives-authclasses)
* [API - AuthServiceProvider](#module-provider-useroutes)
  * [useRoutes](#module-provider-useroutes)
  * [tokenizeHttp](#module-provider-tokenizehttp)
  * [useBasicAuthentication](#module-provider-usebasicauthentication)
  * [parseHttpAuthData](#module-provider-parsehttpauthdata)
  * [setLoggedUser](#module-provider-setloggeduser)
* [API - AuthService](#module-service)
  * [setCurrentUser](#module-service-setcurrentuser)
  * [unsetCurrentUser](#module-service-unsetcurrentuser)
  * [getCurrentUser](#module-service-getcurrentuser)
  * [isUserLoggedIn](#module-service-isuserloggedin)
  * [authorize](#module-service-authorize)
  * [fetchLoggedUser](#module-service-fetchloggeduser)
  * [login](#module-service-login)
  * [logout](#module-service-logout)

##<a name="getting-started"></a> Get Started
```shell
$ bower install --save angular-hitmands-auth
```


```html
<!doctype html>
<html data-ng-app="myApp">
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
    .config(function(AuthServiceProvider, $stateProvider, $provide) {


        // Set API ENDPOINTS
        AuthServiceProvider.useRoutes({
                login: '/api/v1/users/login',
                logout: '/api/v1/users/logout',
                fetch: '/api/v1/users/logged-in'
            });

        // Append AUTH TOKEN to the headers for all http requests
        AuthServiceProvider.tokenizeHttp('MY-CUSTOM-HEADER-KEY');

        // Encrypt login requests like headers['Authorization'] = 'Basic ' + btoa(credentials.username + ':' + credentials.password)
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
        if(angular.isDefined(window.persistentUserData) && ...) {
            AuthServiceProvider.setLoggedUser(
                window.persistentUserData,
                'token',
                ['public', 'author']
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
            .state(dashboard);


        // if you want change the behaviour of AuthService, you can register a Service Decorator.
        $provide.decorator('AuthService', function($delegate) {
            $delegate.authorize = function(state, user) {
                if(user.disposition === 'nice') {
                    return true
                }

                return false;
            };

            return $delegate;
        });

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

        $rootScope.$on('hitmands.auth:update', function(event) {
            $rootScope.currentUser = AuthService.getCurrentUser();
            $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();
        });

    })
    .controller('LoginCtrl', function($scope) {
        $scope.credentials = {
            username: '',
            password: ''
        };
    });
```

##<a name="module-events"></a> Events
Whenever a change occurs, the module generates an event via `$rootScope.$broadcast` method. You can register a listener via `$rootScope.$on` and the callback passed will be invoked with the following params:

NAME                                 | PARAMS PASSED                                              | Publisher
------------------------------------ | ---------------------------------------------------------- | -------------
hitmands.auth:update                 | event                                                      | *All methods that updating the CurrentUser Object*
hitmands.auth:login.resolved         | event, result                                              | AuthService.login **success**
hitmands.auth:login.rejected         | event, error                                               | AuthService.login **error**
hitmands.auth:logout.resolved        | event, result                                              | AuthService.logout **success**
hitmands.auth:logout.rejected        | event, error                                               | AuthService.logout **error**
hitmands.auth:fetch.resolved         | event, result                                              | AuthService.fetchLoggedUser **success**
hitmands.auth:fetch.rejected         | event, error                                               | AuthService.fetchLoggedUser **error**
$stateChangeError                    | event, toState, toParams, fromState, fromParams, error     | AuthService.authorize (when user try to access states without authorization)


```javascript
angular
    .module('myApp')
    .run(function($rootScope) {

        $rootScope.$on('hitmands.auth:login.resolved', function(event, httpResult) {
            console.info('Hey, we have a new user logged in', httpResult);
        });
        $rootScope.$on('hitmands.auth:login.error', function(event, httpError) {
            console.warn('Hey, something went wrong in user authentication', httpError);
        });

        $rootScope.$on('hitmands.auth:update', function(event) {
            console.log('There is a change in currentUser Object, user: ', AuthService.getCurrentUser());
            console.log('There is a change in currentUser Object, user is logged in? ', AuthService.isUserLoggedIn());
            console.log('There is a change in currentUser Object, token: ', AuthService.getAuthenticationToken());
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            if(error.publisher === 'AuthService.authorize') {
                console.log('User Cannot Access the state ' + toState.name, error);
            }
        });

    });
```



##<a name="module-directives-login"></a> Login
This directive requires a **FORM HTML ELEMENT**, if the `name` attribute is set, the directive performs a basic validation. You need to pass a Javascript Object to the directive, like `{username: '', password=''[, ...]}`, (The properties username and password are required if the [Basic Access Authentication](#module-provider-usebasicauthentication) is enabled).

```html
<div>
    Howdy, <strong>{{ currentUser.name || 'Guest' }}</strong>
</div>
<div ng-controller="LoginCtrl" ng-hide="isUserLoggedIn">

    <!-- Directive for login -->
    <form name="userLoginForm" auth-login="credentials">
        <input type="text" required ng-model="credentials.username"/>
        <input type="password" required ng-model="credentials.password"/>
        <button class="btn btn-primary" type="submit">Login</button>
    </form>

</div>
```


##<a name="module-directives-logout"></a> Logout
```html
<div class="" ng-show="isUserLoggedIn">

    <!-- Directive for logout -->
    <button class="btn btn-default" auth-logout>Logout</button>

</div>
```


##<a name="module-directives-authclasses"></a> Authentication Classes
```html
<!-- class="user-is-logged-in || user-not-logged-in" -->
<body auth-classes>...</body>

```

##<a name="module-provider-useroutes"></a> AuthServiceProvider.useRoutes
This method configures API endpoints for *login*, *logout*, *fetching* authentication data.

PARAM         | TYPE          | DESCRIPTION
------------- | ------------- | -------------
newRoutes     | Object        | A map of strings (login, logout, fetch) that defines the routes for user authentication.

```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider) {

        AuthServiceProvider.useRoutes({
            login: '/api/v1/users/login.json',
            logout: '/api/v1/users/logout.json',
            fetch: '/api/v1/users/current.json'
        });

        // or:

        AuthServiceProvider
            .useRoutes({
                login: '/api/v1/users/login.json'
            })
            .useRoutes({
                logout: '/api/v1/users/logout.json'
            })
            .useRoutes({
                fetch: '/api/v1/users/current.json'
            });

    });
```


##<a name="module-provider-parsehttpauthdata"></a> AuthServiceProvider.parseHttpAuthData
This method sets a *middleware* between the $http responses and the AuthService.

PARAM        | TYPE          | DESCRIPTION
------------ | ------------- | -------------
Callback     | Function      | This callback handles the $http responses (AuthService.login, AuthService.fetchLoggedUser) and returns the `{user: Object, token: String, authLevel:Number/Array}` to the AuthService.


```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider) {

        AuthServiceProvider.parseHttpAuthData(function(data, headers, statusCode) {
            var authenticationData = {};

            /**
                The authenticationData Object must have the following properties:
                user = Object,
                authLevel = Number|Array,
                token = String
                The type of the authLevel property must match with the type of the authLevel
                property set on ui-router $state definition Object.
            **/

            // example:
            authenticationData.user = data.user; // Object
            authenticationData.authLevel = 1000; // Number|Array
            authenticationData.token = headers['x-authentication-token']; // String

            return authenticationData;
        });

    });
```


##<a name="module-provider-tokenizehttp"></a> AuthServiceProvider.tokenizeHttp
This method enables the interceptor and hangs the **Authentication Token** to the **headers** of each **$http request**.

PARAM                    | TYPE          | DESCRIPTION
------------------------ | ------------- | -------------
headerKey (optional)     | String        | Default `'x-auth-token'`, the key-header for hanging the token as value

```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider) {

        AuthServiceProvider.tokenizeHttp('X-MY-CUSTOM-AUTH-KEY');

    });
```

##<a name="module-provider-usebasicauthentication"></a> AuthServiceProvider.useBasicAuthentication
This method enables the **Basic Access Authentication** for http login request.

```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider) {

        AuthServiceProvider.useBasicAuthentication();

    });
```


##<a name="module-provider-setloggeduser"></a> AuthServiceProvider.setLoggedUser
This method sets the AuthCurrentUser before your app starts to run (Angular Bootstrap Phase).

PARAM         | TYPE                | DESCRIPTION
------------- | ------------------- | -------------
user          | Object              | The Object for AuthCurrentUser instance.
token         | String              | The session token
authLevel     | Number or Array        | The **type** of this param must match with the type of the authLevel property set on ui-router $state definition Object.

```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider) {

        if(window.persistentUserData && ...) {
            AuthServiceProvider.setLoggedUser(window.persistentUserData, 'tokenString', ['public', 'author', 'editor']);
        }

    });
```


##<a name="module-service-setcurrentuser"></a> AuthService.setCurrentUser
This method sets the AuthCurrentUser.
Returns `true {Boolean}` if the AuthCurrentUser is instantiated, otherwise `false {Boolean}`.

PARAM         | TYPE                | DESCRIPTION
------------- | ------------------- | -------------
user          | Object              | The Object for AuthCurrentUser instance.
authLevel     | Number/Array        | The **type** of this param must match with the type of the authLevel property set on ui-router $state definition Object.
token         | String              | The session token

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

        if(window.persistentUserData && ...) {
            AuthService.setCurrentUser(window.persistentUserData, ['public', 'author', 'editor'], 'tokenString');
        }

    });
```

##<a name="module-service-unsetcurrentuser"></a> AuthService.unsetCurrentUser
This method removes the AuthCurrentUser.
Returns `true {Boolean}`.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService.unsetCurrentUser();

    });
```

##<a name="module-service-getcurrentuser"></a> AuthService.getCurrentUser
Returns `AuthCurrentUser {Object}` if the user is logged in, `null {Null}` otherwise.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService.getCurrentUser();

    });
```


##<a name="module-service-isuserloggedin"></a> AuthService.isUserLoggedIn
Returns `{Boolean}`.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService.isUserLoggedIn();

    });
```


##<a name="module-service-authorize"></a> AuthService.authorize
This method checks if the AuthCurrentUser is authorized, is called on each $stateChangeStart and hitmands.auth:update events.
Returns `{Boolean}`.

PARAM               | TYPE                | DESCRIPTION
------------------- | ------------------- | -------------
state               | Object              | The state (ui-router.$state) object.
user (optional)     | Object              | Default `AuthCurrentUser|Null`

```javascript
angular
    .module('myApp')
    .config(function(AuthServiceProvider, $stateProvider) {
        $stateProvider
            .state('admin', {
                url: '/admin/',
                data: {
                    authLevel: 1000 // if the authLevel property is on the data object, it will inherited from other child states.
                }
            })
            .state('admin-2', {
                url: '/another-admin/',
                authLevel: ['author', 'editor', 'manager', 'administrator']
            });
    })
    .run(function(AuthService, $state) {

        // Of course you have to implement only one type of authentication methods (by Number or by Roles).
        // This module works well with both.

        AuthService.setCurrentUser({ name: 'Giuseppe' }, 100, 'authToken');
        AuthService.authorize($state.get('admin'), AuthService.getCurrentUser()); // false

        AuthService.unsetCurrentUser();
        AuthService.setCurrentUser({ name: 'Giuseppe' }, ['administrator'], 'authToken');
        AuthService.authorize($state.get('admin-2'), AuthService.getCurrentUser()); // true

    });
```


##<a name="module-service-fetchloggeduser"></a> AuthService.fetchLoggedUser
This method performs a **$http GET request** to routes.fetch, updates the AuthCurrentUser Object and triggers the 'hitmands.auth:fetch.success' or 'hitmands.auth:fetch.error' angular event.
Returns `{Promise}`.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService
            .fetchLoggedUser()
            .then(
            function(result) {
                console.log('Fetch AuthData Success', result);
            },
            function(error) {
                console.log('Fetch AuthData Error', error);
            );

    });
```

##<a name="module-service-login"></a> AuthService.login
This method performs a **$http POST request** to routes.login, updates the AuthCurrentUser Object and triggers the 'hitmands.auth:login.success' or 'hitmands.auth:login.error' angular event. This method is also invoked by [login directive](#module-directives-login).
Returns `{Promise}`.

PARAM               | TYPE                | DESCRIPTION
------------------- | ------------------- | -------------
credentials         | Object              | An object to send, if the Basic Access Authentication is enabled, the following properties are required: username, password.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService
            .login({
                username: 'myusername',
                password: 'mypassword'
            })
            .then(
            function(result) {
                console.log('Login Success', result);
            },
            function(error) {
                console.log('Login Error', error);
            );

    });
```

##<a name="module-service-logout"></a> AuthService.logout
This method performs a **$http POST request** to routes.logout, remove the AuthCurrentUser Object and triggers the 'hitmands.auth:logout.success' or 'hitmands.auth:logout.error' angular event. This method is also invoked by [logout directive](#module-directives-logout).
Returns `{Promise}`.

```javascript
angular
    .module('myApp')
    .run(function(AuthService) {

            AuthService
            .logout()
            .then(
            function(result) {
                console.log('Logout Success', result);
            },
            function(error) {
                console.log('Logout Error', error);
            );

    });
```
