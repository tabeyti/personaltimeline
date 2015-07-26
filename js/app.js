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

////////////////////////////////////////////////////////////////////////////////
// Handles the management of item sets: data views, groups, adding/chaning/deleting
// and all that jazz.
////////////////////////////////////////////////////////////////////////////////
app.factory('itemManager', function($rootScope){
  var itemManager = this;
  itemManager.items = new vis.DataSet({
    type: { start: 'ISODate', end: 'ISODate' }
  });
  itemManager.labels = {};

  itemManager.addSet = function(json) {
    itemManager.items.add(json);
    itemManager.updateLabels();
  };

  itemManager.updateLabels = function() {
    itemManager.labels = {};
    itemManager.items.forEach(function(item) {
      for (i = 0; i < item.labels.length; ++i) {
        if (undefined == itemManager.labels[item.labels[i]])
        {
          itemManager.labels[item.labels[i]] = [];
        }
        itemManager.labels[item.labels[i]].push(item.id);
      }
    });
  };

  itemManager.clear = function() {
    itemManager.items.clear();
  }

  itemManager.get = function(item) {
    return itemManager.items.get(item);
  }

  itemManager.remove = function(item) {
    itemManager.items.remove(item);
  }

  itemManager.add = function(item) {
    itemManager.items.add(item);
  }

  itemManager.updateItem = function(item) {
    itemManager.items.update(item);
    itemManager.items.updateLabels();
  }

  itemManager.filterDisplayedItems = function(filterLabel, display){
    itemManager.items.forEach(function(item) {
      angular.forEach(item.labels, function(label) {
        if (label == filterLabel) {

          (display) ? item.style = "display:inline" : item.style = "display:none";
          itemManager.items.update(item);
        }
      });
    });
  };

  itemManager.getLabelNames = function() {
    itemManager.updateLabels();
    var results = [];
    angular.forEach(itemManager.labels, function(v, k) {
      results.push(k);
    });
    console.log(results);
    return results;
  }

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
