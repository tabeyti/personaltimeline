var app = angular.module("app", ["xeditable"]);

/*
  Shared services between app controllers
*/
app.factory('sharedService', function($rootScope){
  var sharedService = {};
  sharedService.prepForPublish = function(msg) {
    this.sharedId = msg;
    this.publishId();
  };

  sharedService.publishId = function() {
    $rootScope.$broadcast('handlePublish');
  };
  return sharedService;
});

/*
  CONTROLLERS
*/
app.controller("MainController", function($scope, $http, sharedService){
  var vm = this;
  vm.title = 'Personal Timeline';
  vm.content = 'asdfasdf';

  // VIS TIMELINE SETUP
  var items = new vis.DataSet({
    type: { start: 'ISODate', end: 'ISODate' }
  });

  // add items to the DataSet
  items.add([
    {id: 1, content: 'item 1<br>start', start: '2014-01-23'},
    {id: 2, content: 'item 2', start: '2014-01-18'},
    {id: 3, content: 'item 3', start: '2014-01-21'},
    {id: 4, content: 'item 4', start: '2014-01-19', end: '2014-01-24'},
    {id: 5, content: 'item 5', start: '2014-01-26'}
  ]);

  var container = document.getElementById('visualization');
  var options = {
    height: '300px',
    multiselect: false,
    // allow manipulation of items
    editable: true,
    showCurrentTime: true
  };
  var timeline = new vis.Timeline(container, items, options);

  // register item select listener, so when an item is clicked, content
  // is displayed above the timeline
  timeline.on('select', function(stuff)
  {
    $http.get("https://dl.dropboxusercontent.com/u/9040177/test.json")
      .success(function(response)
      {
        console.log(response);
        items.clear();
        items.add(response);
        timeline.fit();
      });

    vm.content = stuff.items[0];
    sharedService.msg = stuff.items[0];
    sharedService.publishId();
    $scope.$apply();
  });

});

app.controller("ItemDisplayController", function($scope, $filter, sharedService){
  $scope.$on('handlePublish', function(){
    $scope.itemDisplay = {
      desc: sharedService.msg
    };
    $scope.$apply();
  });

  $scope.itemDisplay = {
    desc: 'Bacon is king\nyes'
  };
});
