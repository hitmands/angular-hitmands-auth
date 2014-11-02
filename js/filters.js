(function(window, angular){
   angular
      .module('hitmands.auth.sample')
      .filter('role', function($filter) {
         var uppercase = $filter('uppercase');
         return function( authLevel ) {
            authLevel = parseInt(authLevel) || 0;

            var role = '';

            switch (authLevel) {
               case 10:
                  role = 'author';
                  break;

               case 100:
                  role = 'editor';
                  break;

               case 1000:
                  role = 'manager';
                  break;

               case 10000:
                  role = 'administrator';
                  break;

               case 100000:
                  role = 'god';
                  break;

               default:
                  role = 'follower';
            }

            return uppercase(role);
         }
      })
   ;
})(window, angular);
