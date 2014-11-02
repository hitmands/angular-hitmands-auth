/* @ngInject */
function AuthLoginDirectiveFactory(AuthService) {
   var _form = null;

   return {
      restrict: 'A',
      link: function(iScope, iElement, iAttributes) {
         var credentials = iScope[ iAttributes['authLogin'] ];

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



angular
   .module('hitmands.auth')
   .directive('authLogin', AuthLoginDirectiveFactory)
   .directive('authLogout', AuthLogoutDirectiveFactory)
;
