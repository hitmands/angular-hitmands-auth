(function(window, angular){
   var mockedUsers = angular.fromJson(window.usersFixtures) || [];
   var ssidKey = '22f5dfe5709de8b550d0db52e94e6e38';

   angular
      .module('hitmands.auth.sample')
      .factory('$hitmandsBackend', function($window, AuthService) {


         var _authPersistent = null;
         var _authPersistentToken = null;

         try {
            _authPersistent = angular.fromJson($window.sessionStorage.getItem(ssidKey));
            _authPersistentToken = _authPersistent.token;
         } catch (e) {}

         AuthService.setCurrentUser(_authPersistent, _authPersistentToken);

         return {
            users: function() {
               return mockedUsers;
            },

            findOne: function() {
               return mockedUsers[Math.floor(Math.random()*mockedUsers.length)];
            },

            authorize: function( credentials ) {
               var _user = null;
               for( var i = 0, len = mockedUsers.length; i < len; i++ ) {
                  if( mockedUsers[i].username === credentials.username && mockedUsers[i].password === credentials.password ) {
                     _user = mockedUsers[i];
                     if(credentials.rememberMe === true) {
                        try {
                           $window.sessionStorage.setItem(ssidKey, angular.toJson(_user));
                        } catch (e) {}
                     }
                     break;
                  }
               }

               return _user;
            }
         }
      })
      .run(function($httpBackend, $hitmandsBackend, $window, $rootScope) {
         window.$hitmandsBackend = $hitmandsBackend;

         $rootScope.users = $hitmandsBackend.users();

         $httpBackend
            .whenGET(/\.html/).passThrough();

         $httpBackend
            .whenPOST('/users/logout')
            .respond(function() {
               try {
                  $window.sessionStorage.removeItem(ssidKey);
               } catch (e) {}
               return [200, null];
            });

         $httpBackend
            .whenPOST('/users/login')
            .respond(function( method, url, credentials, headers ) {
               credentials = angular.fromJson(credentials);
               var user = $hitmandsBackend.authorize(credentials);

               return (angular.isObject(user)) ? [200, user] : [401, 'Unauthorized'];
            });
      })
   ;
})(window, angular);

