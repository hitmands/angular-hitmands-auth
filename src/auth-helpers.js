/**
 *
 * @param userData
 * @param token
 * @returns {Boolean}
 * @private
 */
function _validAuthData(userData, token) {
   var res = true;


   if(angular.isArray(userData) || !angular.isObject( userData )) {
      res = false;
   }

   if(!angular.isString(token) || token.length < 1) {
      res = false;
   }

   return res;
}

/**
 *
 * @param {Number} stateAuthLevel
 * @param {Number} userAuthLevel
 * @returns {Boolean}
 * @private
 */
function _authorizeLevelBased( stateAuthLevel, userAuthLevel ) {
   if( !angular.isNumber(userAuthLevel) ) {
      userAuthLevel = 0;
   }

   return ( userAuthLevel >= stateAuthLevel );
}

/**
 *
 * @param {Array} haystack
 * @param {Array} needle
 * @returns {Boolean}
 * @private
 */
function _inArray( haystack, needle ) {
   needle = angular.isArray(needle) ? needle : [needle];

   if(haystack.length < 1) {
      return true;
   }

   for(var i = 0, len = haystack.length; i < len; i++) {
      for(var j = 0, jLen = needle.length; j < jLen; j++) {
         if( angular.equals(haystack[i], needle[j]) ) {
            return true;
         }
      }
   }

   return false;
}


