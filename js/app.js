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
  items.add([]);

  var container = document.getElementById('visualization');
  var options = {
    height: '300px',
    multiselect: false,
    // allow manipulation of items
    editable: true,
    showCurrentTime: true
  };
  var timeline = new vis.Timeline(container, items, options);

  $http.get("http://172.248.208.18:8000/ptl/process.php?method=getTimeline")
    .success(function(response) {
      console.log(response);
      items.clear();
      items.add(response);
      timeline.fit();
    });

  // register item select listener, so when an item is clicked, content
  // is displayed above the timeline
  timeline.on('select', function(stuff)
  {
    console.log('Item clicked: ' + stuff);
    $http.get("http://172.248.208.18:8000/ptl/process.php?method=getItem&id="+ stuff.items[0])
      .success(function(response) {
        vm.content = 'Id: ' + stuff.items[0];
        sharedService.msg = response['journal'];
        sharedService.publishId();
        $scope.$apply();
      });
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
