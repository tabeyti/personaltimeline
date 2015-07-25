app.controller("SettingsController", function($scope, $http, $mdSidenav, $mdUtil, sharedService, itemManager) {

  $scope.toggleNav = toggle('left');
  $scope.items = itemManager;
  
  function toggle(navID) {
    console.log('nav toggled');
    var debounceFn =  $mdUtil.debounce(function(){
      $mdSidenav(navID)
        .toggle()
        .then(function () {

        });
    }, 200);

    return debounceFn;
  };
});
