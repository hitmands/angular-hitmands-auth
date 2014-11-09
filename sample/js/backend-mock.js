(function(window, angular){
   var mockedUsers = angular.fromJson(window.usersFixtures) || [];
   var ssidKey = '22f5dfe5709de8b550d0db52e94e6e38';

   angular
      .module('hitmands.auth.sample')
      .run(function($httpBackend, $hitmandsBackend, $window, $rootScope) {
         window.$hitmandsBackend = $hitmandsBackend;

         $rootScope.users = $hitmandsBackend.users();

         $httpBackend
            .whenGET(/\.html/)
            .passThrough();

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
               var validResponse = [200, user, {'x-auth-token': user.token}];

               try {
                  delete user.token;
               } catch (e) {
                  user.token = null;
               }

               return (angular.isObject(user)) ? validResponse : [401, 'Unauthorized'];
            });
      })
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
                     _user = angular.copy(mockedUsers[i]);
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
      .service('Tutorial', function() {
         var _tutorial = [
            {
               id: 1,
               slug: 'getting-started',
               title: 'Getting Started',
               content: '<strong><a target="new" href="http://bower.io/">Bower:</a>&nbsp;&nbsp;&nbsp;</strong>' +
               '<code>$ Bower install angular-hitmands-auth [--save]</code>'
            },
            {
               id: 2,
               slug: 'basic-configuration',
               title: 'Basic Configuration',
               content: ''
            }
         ];

         function getPostBySlug(slug) {
            var post = null;
            angular.forEach(_tutorial, function(item) {
               if(item.slug === slug) {
                  post = item;
               }
            });

            return post;
         }
         function getPostById(id) {
            var post = null;
            angular.forEach(_tutorial, function(item) {
               if(item.id === id) {
                  post = item;
               }
            });

            return post;
         }
         return {
            get: function(keyword) {
               if( angular.isUndefined(keyword) ) {
                  return angular.copy(_tutorial);
               }
               if( angular.isNumber(keyword) ) {
                  return angular.copy(getPostById(keyword));
               }
               if( angular.isString(keyword) ) {
                  return angular.copy(getPostBySlug(keyword));
               }
            }
         };
      })
   ;
})(window, angular);
