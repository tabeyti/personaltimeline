var app = angular.module("app", ['xeditable', 'ui.bootstrap.contextMenu', 'ngMaterial']);

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
    console.log('item published');
    $rootScope.$broadcast('handlePublish');
  };
  return sharedService;
});

////////////////////////////////////////////////////////////////////////////////
// controllers
////////////////////////////////////////////////////////////////////////////////
app.controller("MainController", function($scope, $http, sharedService){
  var vm = this;
  vm.title = 'Personal Timeline';
  var itemTitle = '';
  var itemContent = '';

  var clickedTime = '';
  var nextId = 1;
  var itemDump = '';


  // create item structure for timeline
  var items = new vis.DataSet({
    type: { start: 'ISODate', end: 'ISODate' }
  });

  // register timeline
  var container = document.getElementById('visualization');
  var options = {
    height: '300px',
    multiselect: false,
    // allow manipulation of items
    editable: {
      add: false,
      remove: false,
      updateTime: true,
      updateGroup: true
    },
    showCurrentTime: true
  };
  var timeline = new vis.Timeline(container, items, options);

  // // reteive items from server
  // $http.get("http://172.248.208.18:8000/ptl/process.php?method=getTimeline")
  //   .success(function(response) {
  //     console.log(response);
  //     items.clear();
  //     items.add(response);
  //     timeline.fit();
  //
  //     // find the nextId id
  //     items.forEach(function(element) {
  //       if (nextId <= element.id) {
  //         nextId = element.id + 1;
  //       }
  //     });
  //   });

  function getNextId() {
    return nextId++;
  };

  vm.getData = function() {
    var data = items.get({
      type: {
        start: 'ISODate',
        end: 'ISODate'
      }
    });
    vm.itemDump = JSON.stringify(data, null, 2);
    console.log(itemDump);
    return itemDump;
  };

  // register item select listener, so when an item is clicked, content
  // is displayed above the timeline
  timeline.on('select', function(stuff) {
    sharedService.prepForPublish('Item: ' + stuff.items[0]);
    sharedService.publishId();
    $scope.$apply();
    // $http.get("http://172.248.208.18:8000/ptl/process.php?method=getItem&id="+ stuff.items[0])
    //   .success(function(response) {
    //     vm.content = 'Id: ' + stuff.items[0];
    //     sharedService.msg = response['journal'];
    //     sharedService.publishId();
    //     $scope.$apply();
    //   });
  });
  timeline.on('contextmenu', function(props) {
      console.log(props);
      timeline.setSelection(props.item);
      clickedTime = props.snappedTime;
    });

  // context-menu
  $scope.menuOptions = function(item) {
    // item context menu
    if (timeline.getSelection().length == 0) {
      return [
        ['Add Range', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, end: clickedTime, type:"range"});
        }],
        ['Add Box', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"box"});
        }],
        ['Add Point', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"point"});
        }]
      ];
    }
    // timeline background context menu
    else {
      return [
        ['Delete', function ($itemScope) {
          items.remove(timeline.getSelection()[0]);
        }]
      ];
    }
  };
});



app.controller("ItemDisplayController", function($scope, $filter, sharedService){
  $scope.$on('handlePublish', function(){
    $scope.itemDisplay = {
      title: sharedService.sharedId,
      journal: sharedService.sharedId
    };
    $scope.$apply();
  });

  $scope.itemDisplay = {
    title: 'Something',
    journal: 'alksdjf;alksdjf;laksjdf;laksjdf;laksjdf;lkasjdf;lkasjdf;lkjasdf'
  };
});
