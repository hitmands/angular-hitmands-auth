/* @ngInject */
function AuthLoginDirectiveFactory(AuthService) {

   return {
      restrict: 'A',
      link: function(iScope, iElement, iAttributes) {
         var credentials = iScope[ iAttributes['authLogin'] ];

         var resolve = angular.isFunction(iScope.$eval( iAttributes['authLoginOnResolve'] )) ?
            iScope.$eval( iAttributes['authLoginOnResolve'] ) : angular.noop;

         var reject = angular.isFunction(iScope.$eval( iAttributes['authLoginOnReject'] )) ?
            iScope.$eval( iAttributes['authLoginOnReject'] ) : angular.noop;

         var _form = null;

         try {
            _form = iScope[iElement.attr('name')];
         } catch (error) {}


         iElement.bind('submit', function( event ) {

            if( !angular.isObject(credentials) ) {
               event.preventDefault();
               return reject({ attrName: 'auth-login', attrValue: credentials });
            }

            if( angular.isObject(_form) && _form.hasOwnProperty('$invalid') && _form.$invalid ) {
               event.preventDefault();
               return reject({'form.$invalid' : _form.$invalid, '$form.$pristine' : _form.$pristine});
            }

            return AuthService.login(credentials).then(resolve, reject);
         });

         iScope.$on('$destroy', function() {
            iElement.unbind('submit');
         });
      }
   };
}

/* @ngInject */
function AuthLogoutDirectiveFactory(AuthService) {

   return function(scope, element, attrs) {

      element.bind('click', function() {
         AuthService.logout();
      });

      scope.$on('$destroy', function() {
         element.unbind('click');
      });
   };
}


/* @ngInject */
function AuthClassesDirectiveFactory(AuthService) {
   var classes = {
      loggedIn: 'user-is-logged-in',
      notLoggedIn: 'user-not-logged-in',
      last: ''
   };

   return {
      restrict: 'A',
      scope: false,
      link: function(iScope, iElement, iAttributes) {
         function _toggleClass() {
            var newClasses = '';


            if( AuthService.isUserLoggedIn() ) {
               try {
                  newClasses = ' user-has-role-' + AuthService.getCurrentUser()[AUTHPROPERTY].join(' user-has-role-');
               } catch(e) { }

               iAttributes.$updateClass(classes.loggedIn + newClasses, classes.notLoggedIn);
               classes.last = newClasses;
            } else {
               iAttributes.$updateClass(classes.notLoggedIn, classes.loggedIn + classes.last);
            }

         }

         _toggleClass();
         iScope.$on(EVENTS.update, function() {
            _toggleClass();
         });

      }
   };
}
