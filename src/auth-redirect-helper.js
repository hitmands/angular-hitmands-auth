var routes = {
   "otherwise": "login"
};

/* @ngInject */
function AuthRedirectHelper() {
   var state = null;
   var params = null;

   this.useRoutes = function AuthRedirectHelperUseRoutesSetter(newRoutes) {
      if( angular.isArray(newRoutes) || !angular.isObject(newRoutes) ) {
         return;
      }

      angular.extend(routes, newRoutes)
   };

   this.$get = function($state, AuthService, $rootScope, $location) {

      var _unsetRedirect = function() {
         state  = null;
         params = null;
      };
      var _getRedirect = function() {
         return {
            state: state,
            params: params
         };
      };

      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
         if(toState.name !== routes.login) {
            _unsetRedirect();
         }
      });

      return {

         set: function(toState, toParams) {
            if(angular.isArray(toState) || !angular.isObject(toState)) {
               return;
            }
            if(angular.isUndefined(toParams)) {
               toParams = {};
            }

            state  = toState;
            params = toParams;
         },

         get: function() {

            return _getRedirect();
         },

         isSetted: function() {

            return angular.isObject(_getRedirect().state);
         },

         unset: function() {

            _unsetRedirect();
         },

         go: function() {
            if( angular.isObject(state) && AuthService.authorize(state) ) {
               $state.go(state, params);
            }

            _unsetRedirect();
         },

         otherwise: function() {

            return $state.go(routes.otherwise);
         },

         goHome: function() {

            return $location.path('/');
         }

      };
   };
}

/* @ngInject */
function moduleRun() {}

angular
   .module('hitmands.auth')
   .provider('AuthRedirectHelper', AuthRedirectHelper)
   .run(moduleRun);
