app.controller('ListViewController', function($scope, $http, sharedService, itemManager, $mdDialog, $mdToast) {

  $scope.items = itemManager.items;
  $scope.letterLimit = 3;

  $scope.openDialog = function(item, event) {
    if (undefined == item) { return; }
    sharedService.broadcast(itemManager.get(item.id), 'itemSelect', false);
  }


});
