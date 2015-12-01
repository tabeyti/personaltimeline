app.controller('ListViewController', function($scope, $http, sharedService, itemManager, $mdDialog, $mdToast) {

  $scope.items = itemManager.items;
  $scope.letterLimit = 3;

  $scope.$watch('itemManager.items', function(newVal, oldVal) {
    $scope.items =  itemManager.items;
  }, true);

});
