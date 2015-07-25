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

  itemManager.labels = {};

  itemManager.addSet = function(json) {
    this.add(json);
    itemManager.updateLabels();
  };

  itemManager.updateLabels = function() {
    itemManager.labels = {};
    this.forEach(function(item) {
      for (i = 0; i < item.labels.length; ++i) {
        if (undefined == itemManager.labels[item.labels[i]])
        {
          itemManager.labels[item.labels[i]] = [];
        }
        itemManager.labels[item.labels[i]].push(item.id);
      }
    });
    console.log(itemManager.labels);
  };

  itemManager.updateItem = function(item) {
    itemManager.update(item);
    itemManager.updateLabels();
  }

  itemManager.hide = function(label){
  };

  itemManager.cloneItem = function(item) {
    var tempItem = {
      journal: item.journal,
      content: item.content,
      labels: []
    };
    angular.forEach(item.labels, function (label) {
      tempItem.labels.push(label);
    });
    return tempItem;
  };

  return itemManager;
});

// app.module('filters', )
