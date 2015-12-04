app.controller("SettingsController", function($scope, $http, $mdSidenav, $mdUtil, sharedService, itemManager) {
  var sc = this;
  sc.labels = [];
  sc.labels = sc.labels.concat(itemManager.getLabelNames());
  sc.selected = [];
  $scope.isOpen = function(){
      return $mdSidenav('left').isOpen();
    };

  sc.selectedLabel = 'All';

  $scope.$watch('sc.selectedLabel', function(newVal, oldVal) {
    itemManager.filterDisplayedItems(newVal);
  });

  /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

  sc.toggleNav = function() {
      sc.refreshLabels();
      $mdSidenav('left').toggle();
  };

  sc.refreshLabels = function() {
    sc.labels = [];
    sc.labels = sc.labels.concat(itemManager.getLabelNames());
    return sc.labels;
  }

});
