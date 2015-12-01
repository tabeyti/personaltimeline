var app = angular.module("app", ['ui.bootstrap.contextMenu', 'ngMaterial', 'ui.bootstrap.datetimepicker']);

app.config( function($mdThemingProvider){
    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();
  });

  app.filter("toArray", function(){
      return function(obj) {
          var result = [];
          angular.forEach(obj, function(val, key) {
              result.push(val);
          });
          return result;
      };
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
  var itemManager = {};
  itemManager.items = new vis.DataSet({
    type: { start: 'ISODate', end: 'ISODate' }
  });
  itemManager.labels = {};
  itemManager.periods = [];
  itemManager.selectedLabel = 'All';

  itemManager.addSet = function(json) {
    itemManager.items.add(json);
    itemManager.updateLabels();
    itemManager.updatePeriods();
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

  itemManager.updatePeriods = function() {
    itemManager.periods.length = 0;
    itemManager.items.forEach(function(item) {
      if (item.type == 'background') {
         itemManager.periods.push(item);
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
    itemManager.updateLabels();
    itemManager.updatePeriods();
  }

  itemManager.add = function(item) {
    itemManager.items.add(item);
  }

  itemManager.getItems = function() {
    console.log(itemManager.items.length);
    return itemManager.items.get();
  }

  itemManager.addBlankItem = function(type, id, labels, start, end) {
    switch (type)
    {
      case 'point':
      case 'box':
        itemManager.add({'id':id, 'content': 'blank', 'start': start, 'type':type, 'journal':'', 'labels':labels, className:'default'});
        break;
      case 'range':
        itemManager.add({'id':id, 'content': 'blank', 'start': start, 'end':end, 'type':type, 'journal':'', 'labels':labels, className:'default'});
        break;
      case 'period':
        var item = {'id':id, 'content': 'blank', 'start': start, 'end':end, 'type':'background', 'journal':'', 'labels':labels, className:'default', editable: true};
        itemManager.add(item);
        itemManager.periods.push(item);
        itemManager.updateLabels();
    }
  }

  itemManager.updateItem = function(item) {
    itemManager.items.update(item);
    itemManager.updateLabels();
  }

  itemManager.filterDisplayedItems = function(filterLabel){
    itemManager.selectedLabel = filterLabel;
    if ('All' == filterLabel) {
      itemManager.items.forEach(function(item) {
        item.className = item.storedClassName;
        itemManager.items.update(item);
      });
    }
    else { // only show items with the label passed
      itemManager.items.forEach(function(item) {
        var found = false;
        angular.forEach(item.labels, function(label) {
          if (label == filterLabel) {
            found = true;
          }
        });
        (found) ? item.className = item.storedClassName : item.className = "hidden";
        itemManager.items.update(item);
      });
    }
  };

  itemManager.getLabelNames = function() {
    itemManager.updateLabels();
    var results = ['All'];
    angular.forEach(itemManager.labels, function(v, k) {
      results.push(k);
    });
    console.log(results);
    return results;
  }

  itemManager.cloneItem = function(item) {
    var tempItem = {
      start: item.start,
      end: item.end,
      journal: item.journal,
      content: item.content,
      type: item.type,
      labels: [],
      className:item.className,
      style:item.style
    };
    angular.forEach(item.labels, function (label) {
      tempItem.labels.push(label);
    });
    return tempItem;
  };

  itemManager.getData = function() {
    itemManager.filterDisplayedItems('All');
    return itemManager.items.get();
  };

  return itemManager;
});
