/**
 * All what you need...
 */
angular
   .module('hitmands.auth')
   .config(['AuthServiceProvider', function(AuthServiceProvider) {

      AuthServiceProvider
         .useRoutes({
            login: '/your-login-api-endpoint',
            logout: '/your-logout-api-endpoint',
            fetch: '/your-fetch-api-endpoint'
         })
         .parseHttpAuthData(function(data, header, statusCode) {
            var authData = {};

            authData.user = {}; // An Object representing the CurrentUser
            authData.token = ''; // A String representing the token for the current session
            authData.authLevel = []; // An Array (or Number) representing the user claim/roles (ACL).

            return authData;
         });
   }])
   .run(['$rootScope', 'AuthService', function($rootScope, AuthService) {
      $rootScope.currentUser = AuthService.getCurrentUser();
      $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();

      $rootScope.$on('hitmands.auth:update', function () {
         $rootScope.currentUser = AuthService.getCurrentUser();
         $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();
      });

      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {

         if(error.publisher === 'AuthService.authorize') {
            console.log('Route Protected', error);
         }
      });
   }]);
