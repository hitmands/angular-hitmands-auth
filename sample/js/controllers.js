(function(window, angular){
   angular
      .module('hitmands.auth.sample')
      .controller('AdminCtrl', function($scope, AuthService, $hitmandsBackend, UsersModel, $filter) {
         var sorter = $filter('orderBy');


         $scope.reverseAuthLevels = true;
         $scope.reverseIds = true;
         $scope.sortedBy = 'id';

         $scope.sortByAuthLevel = function() {
            $scope.$root.users = sorter(UsersModel, 'authLevel', $scope.reverseAuthLevels);
            $scope.reverseAuthLevels = !$scope.reverseAuthLevels;
            $scope.sortedBy = 'authLevel';
         };
         $scope.sortById = function() {
            $scope.$root.users = sorter(UsersModel, 'id', $scope.reverseIds);
            $scope.reverseIds = !$scope.reverseIds;
            $scope.sortedBy = 'id';
         };
      })
      .controller('NotFoundCtrl', function($scope, AuthService, $hitmandsBackend, $filter) {})
      .controller('LoginCtrl', function($scope, AuthService, $hitmandsBackend) {
         var randUser = $hitmandsBackend.findOne();
         $scope.fields = {
            username: randUser.username,
            password: randUser.password,
            rememberMe: false
         };
         $scope.fields = {
            username: 'hitmands',
            password: 'asdasd',
            rememberMe: true
         };

         $scope.loginSamples = [];
         $scope.reRands = function() {
            var res = [];
            for(var i = 0, len = 5; i < len; i++) {
               res.push($hitmandsBackend.findOne());
            }
            return $scope.loginSamples = res;
         };
         $scope.reRands();
         $scope.randomLogin = function() {
            var credentials = $hitmandsBackend.findOne();
            AuthService.login({
               username: credentials.username,
               password: credentials.password,
               rememberMe: true
            });
         };

      })
      .controller('TutorialCtrl', function(Tutorial, $location, $anchorScroll) {
         this.posts = Tutorial.get();
         this.goToPost = function(id) {
            $location.hash(id);

            $anchorScroll();
         }
      })

   ;
})(window, angular);
