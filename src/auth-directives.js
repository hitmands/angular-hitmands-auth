/* @ngInject */
function AuthLoginDirectiveFactory(AuthService) {

   return {
      restrict: 'A',
      link: function(iScope, iElement, iAttributes) {
         var credentials = iScope[ iAttributes['authLogin'] ];
         var _form = null;

         try {
            _form = iScope[iElement.attr('name')];
         } catch (error) {}

         iElement.bind('submit', function( event ) {

            if( !angular.isObject(credentials) ) {
               event.preventDefault();
               return;
            }

            if( angular.isObject(_form) && _form.hasOwnProperty('$invalid') && _form.$invalid ) {
               event.preventDefault();
               return;
            }
            AuthService.login(credentials);
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
   };
}


/* @ngInject */
function AuthClassesDirectiveFactory(AuthService) {
   var classes = {
      loggedIn: 'user-is-logged-in',
      notLoggedIn: 'user-not-logged-in'
   };

   return {
      restrict: 'A',
      scope: false,
      link: function(iScope, iElement, iAttributes) {
         function _toggleClass() {

            if( AuthService.isUserLoggedIn() ) {
               iAttributes.$removeClass(classes.notLoggedIn);
               iAttributes.$addClass(classes.loggedIn);
            } else {
               iAttributes.$removeClass(classes.loggedIn);
               iAttributes.$addClass(classes.notLoggedIn);
            }

         }

         _toggleClass();
         iScope.$on(EVENTS.update, function() {
            _toggleClass();
         });

      }
   };
}
