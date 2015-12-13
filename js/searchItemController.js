app.controller("SearchItemController", function($scope, $http, $q, sharedService, itemManager) {
  var self = this;
  self.rawItems = itemManager.itemsSource;
  self.items = loadAll();

  self.simulateQuery = false;
  self.isDisabled    = false;
  self.querySearch   = querySearch;

  function loadAll() {
    console.log('loading items into search!');
    var list = [];
    for (var key in itemManager.itemsSource) {
      var tempObj = {};
      tempObj[key] = inputObj[key];
      list.push(tempObj);
    }

    return list.map( function (item) {
      item.value = item.content.toLowerCase();
      return item;
    });
  };

  function querySearch (query) {
    var results = query ? self.itemNames.filter( createFilterFor(query) ) : self.items, deferred;
    return results;
  }

  /**
   * Create filter function for a query string
   */
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(item) {
      return (item.value.indexOf(lowercaseQuery) === 0);
    };

  }

});
