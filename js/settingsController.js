app.controller("SettingsController", function($scope, $http, $mdSidenav, $mdUtil, sharedService, itemManager) {
  var sc = this;
  sc.labels = ['All'];
  sc.labels = sc.labels.concat(itemManager.getLabelNames());
  sc.selected = [];

  sc.selectedLabel = 'All';

  $scope.$watch('sc.selectedLabel', function(newVal, oldVal) {
    itemManager.filterDisplayedItems(newVal);
  });

  sc.toggleNav = function() {
      sc.refreshLabels();
      $mdSidenav('left').toggle();
  };

  sc.refreshLabels = function() {
    sc.labels = ['All'];
    sc.labels = sc.labels.concat(itemManager.getLabelNames());
    return sc.labels;
  }

});
