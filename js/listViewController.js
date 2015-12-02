app.controller('ListViewController', function($scope, $http, sharedService, itemManager, $mdDialog, $mdToast) {

  $scope.items = itemManager.items;
  $scope.letterLimit = 3;
  $scope.years = itemManager.years;

  $scope.openDialog = function(item, event) {
    if (undefined == item) { return; }
    sharedService.broadcast(itemManager.get(item.id), 'itemSelect', false);
  }

  $scope.test = function() {
    console.log($scope.years);
  }

  $scope.matchesYear = function(item, year) {
    var itemYear = new Date(item.start).getFullYear();
    if (itemYear == year) { return true; }
  }

});
