app.controller("SearchItemController", function($scope, $http, $q, sharedService, itemManager) {
  var self = this;
  self.items = itemManager.items;

  self.simulateQuery = false;
  self.isDisabled    = false;
  self.querySearch   = querySearch;
  self.selectedItemChange = selectedItemChange;

  function querySearch (query) {
    var results = [];
    angular.forEach(self.items['_data'], function (item) {
      var lowercaseQuery = angular.lowercase(query);
      var lowercaseContent = angular.lowercase(item.content);
      if (lowercaseContent.indexOf(lowercaseQuery) === 0) { results.push(item); }
    });
    return results;
  }

  function selectedItemChange(item) {
    if (item == undefined) { return; }
    sharedService.broadcast(itemManager.get(item.id), 'itemSelect', false);
  };

});
