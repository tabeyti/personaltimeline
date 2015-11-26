app.controller('ListViewController', function($scope, $http, sharedService, itemManager, $mdDialog, $mdToast) {
  var vm = this;
  vm.items = itemManager.items;
  $scope.letterLimit = 3;

  $scope.$watchCollection('itemManager.items', function(newVal, oldVal) {
    vm.items = itemManager.items;
  }, true);
});
