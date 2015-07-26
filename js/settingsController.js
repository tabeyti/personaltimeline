app.controller("SettingsController", function($scope, $http, $mdSidenav, $mdUtil, sharedService, itemManager) {
  var sc = this;
  sc.labels = itemManager.getLabelNames();

  sc.toggleNav = function() {
      sc.refreshLabels();
      $mdSidenav('left').toggle();
  };

  sc.refreshLabels = function() {
    sc.labels = itemManager.getLabelNames();
  }

  sc.filterTimeLine = function(label) {
    console.log(label);
  }

});
