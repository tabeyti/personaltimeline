app.controller("SettingsController", function($scope, $http, $mdSidenav, $mdUtil, sharedService, itemManager) {
  var sc = this;
  $scope.toggleNav = toggle('left');
  sc.items = itemManager;

  function toggle(navID) {
    var debounceFn =  $mdUtil.debounce(function(){
      $mdSidenav(navID)
        .toggle()
        .then(function () {

        });
    }, 200);

    return debounceFn;
  };

  sc.filterLabel = function(items) {
    var results = [];

    angular.forEach(items, function(v, k) {
      results.push(k);
    });

    return results;
  }

});
