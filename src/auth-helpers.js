/**
 *
 * @param {Number} stateAuthLevel
 * @param {Number} userAuthLevel
 * @returns {Boolean}
 * @private
 */
function _authorizeLevelBased(stateAuthLevel, userAuthLevel) {
   if( !angular.isNumber(userAuthLevel) ) {
      userAuthLevel = 0;
   }

   return ( userAuthLevel >= stateAuthLevel );
}
/**
 *
 * @param {Array} stateAuthRoles
 * @param {Array} userAuthRoles
 * @returns {Boolean}
 * @private
 */
function _authorizeRoleBased(stateAuthRoles, userAuthRoles) {
   userAuthRoles = angular.isArray(userAuthRoles) ? userAuthRoles : [userAuthRoles];

   for(var i = 0, len = stateAuthRoles.length; i < len; i++) {
      for(var j = 0, jLen = userAuthRoles.length; j < jLen; j++) {
         if( angular.equals(stateAuthRoles[i], userAuthRoles[j]) ) {
            return true;
         }
      }
   }

   return false;
}
/**
 * @param parsedData
 * @returns {{user: Object|null, token: string|null}}
 * @private
 */
function _sanitizeParsedData( parsedData, $exceptionHandler ) {
   if( !angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
      $exceptionHandler('AuthServiceProvider.parseHttpAuthData', 'Invalid callback passed. The Callback must return an object like {user: Object, token: String, authLevel: Number|Array}');

      parsedData = {
         user: null,
         token: null,
         authLevel: 0
      };
   }
   return parsedData;
}

/**
 * Get the CurrentUser Object or Null
 *
 * @preserve
 * @returns {Object|null}
 */
function _getLoggedUser() {

   return currentUser;
}
