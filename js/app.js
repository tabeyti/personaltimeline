var app = angular.module("app", ['ui.bootstrap.contextMenu', 'ngMaterial']);

app.config( function($mdThemingProvider){
    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();
  });

  /*
    Shared services between app controllers
  */
  app.factory('sharedService', function($rootScope){
    var sharedService = {};

    sharedService.broadcast = function(item, bcEvent, isNewItem) {
      this.item = item;
      this.bcEvent = bcEvent;
      this.isNewItem = isNewItem;
      $rootScope.$broadcast('handlePublish');
    };
    return sharedService;
  });

  app.factory('itemManager', function($rootScope){
    var itemManager = new vis.DataSet({
      type: { start: 'ISODate', end: 'ISODate' }
    });

    itemManager.labels = new Array();

    itemManager.addSet = function(json) {
      this.add(json);
      this.forEach(function(item) {
        for (i = 0; i < item.labels.length; ++i){
          itemManager.labels[item.labels[i]] = item.labels[i];
        }
      });
    };

    itemManager.hide = function(label){
    };

    return itemManager;
  });
