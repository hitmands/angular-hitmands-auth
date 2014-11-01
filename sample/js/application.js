(function(window, angular) {
   var app = angular.module('hitmands.auth.sample', ['ui.router', 'ngAnimate', 'hitmands.auth', 'ngMockE2E', 'hitmands.logger']);

   app
      .config(function(AuthServiceProvider) {

         // Configuring AuthService
         AuthServiceProvider
            .useRoutes({
            otherwise: 'login'
         })
            .setDataParser(function( data ) {
               return {
                  user: data,
                  token: data.token
               };
            })
         ;
      })
      .config(function($stateProvider, $locationProvider, $urlRouterProvider) {

         $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.url();

            if (path[path.length - 1] === '/' || path.indexOf('/?') > -1) {
               return;
            }

            if (path.indexOf('?') > -1) {
               return path.replace('?', '/?');
            }

            return path + '/';
         });

         $stateProvider
            .state('app', {
               url: '/',
               views: {
                  header: {
                     templateUrl: 'views/header.html',
                     controller: function() {}
                  },
                  main: {
                     templateUrl: 'views/home.html',
                     controller: function() {}
                  }
               }
            })
            .state('notFound', {
               url: '/404/',
               views: {
                  header: {
                     templateUrl: 'views/header.html',
                     controller: function($scope) {}
                  },
                  main: {
                     templateUrl: 'views/not-found.html',
                     controller: 'NotFoundCtrl'
                  }
               }
            })
            .state('login', {
               url: '/login/',
               views: {
                  header: {
                     templateUrl: 'views/header.html',
                     controller: function($scope) {}
                  },
                  main: {
                     templateUrl: 'views/login.html',
                     controller: 'LoginCtrl'
                  }
               }
            })
            .state('admin', {
               url: '/admin/',
               resolve: {
                  UsersModel: ['$hitmandsBackend', function($hitmandsBackend) {
                     return $hitmandsBackend.users();
                  }]
               },
               views: {
                  header: {
                     templateUrl: 'views/header.html',
                     controller: function($scope) {}
                  },
                  main: {
                     templateUrl: 'views/admin.html',
                     controller: 'AdminCtrl'
                  }
               },
               authLevel: 1000
            });

         $urlRouterProvider.otherwise('/404');
      })

      .run(function($rootScope, $state, $stateParams, AuthService) {


         $rootScope.$state = $state;
         $rootScope.$stateParams = $stateParams;
         $rootScope.currentUser = AuthService.getCurrentUser();
         $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();

         $rootScope.$on('hitmands.auth:update', function() {
            $rootScope.currentUser = AuthService.getCurrentUser();
            $rootScope.isUserLoggedIn = AuthService.isUserLoggedIn();
         });

      })
   ;
})(window, angular);
