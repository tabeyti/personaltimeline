var app = angular.module("app", ['xeditable', 'ui.bootstrap.contextMenu', 'ngMaterial']);

/*
  Shared services between app controllers
*/
app.factory('sharedService', function($rootScope){
  var sharedService = {};

  sharedService.broadcast = function(id, bcEvent, isNewItem, title) {
    this.sharedId = id;
    this.bcEvent = bcEvent;
    this.isNewItem = isNewItem;
    this.title = title;
    $rootScope.$broadcast('handlePublish');
  };
  return sharedService;
});

////////////////////////////////////////////////////////////////////////////////
// Main timeline controller
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

  // ===========================================================================
  // Timeline setup
  // ===========================================================================
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

  // reteive items from server
  $http.get("http://172.248.208.18:8000/ptl/process.php?method=getTimeline")
    .success(function(response) {
      console.log(response);
      items.clear();
      items.add(response);
      timeline.fit();

      // find the nextId id
      items.forEach(function(element) {
        if (nextId <= element.id) {
          nextId = element.id + 1;
        }
      });
    });

  function getNextId() {
    return nextId++;
  };

  function getLastId() {
    return nextId - 1;
  }

  vm.getData = function() {
    var data = items.get({
      type: {
        start: 'ISODate',
        end: 'ISODate'
      }
    });
    vm.itemDump = JSON.stringify(data, null, 2);
    return itemDump;
  };

  // ===========================================================================
  // Event Listeners
  // ===========================================================================

  // register item select listener, so when an item is clicked, content
  // is displayed above the timeline
  timeline.on('select', function(stuff) {
    if (stuff.items.length == 0) {
      sharedService.broadcast(0, 'nullSelect', false);
    }
    else {
      sharedService.broadcast(stuff.items[0], 'itemSelect', false, items.get(stuff.items[0]).content);
    }
  });

  timeline.on('contextmenu', function(props) {
    console.log(props);
    timeline.setSelection(props.item);
    clickedTime = props.snappedTime;

    if (props.item == null) {
      sharedService.broadcast(0, 'nullSelect', false, "");
    }
    else {
      sharedService.broadcast(props.item, 'itemSelect', false, timeline.getSelection()[0].content);
    }
  });

  // ===========================================================================
  // Right Click Context Menu
  // ===========================================================================
  $scope.menuOptions = function(item) {
    // timeline background context menu
    if (timeline.getSelection().length == 0) {
      return [
        ['Add Range', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, end: clickedTime, type:"range"});
          timeline.setSelection(getLastId());
          sharedService.broadcast(getLastId(), 'itemAdd', true, "blank");
        }],
        ['Add Box', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"box"});
          timeline.setSelection(getLastId());
          sharedService.broadcast(getLastId(), 'itemAdd', true, "blank");
        }],
        ['Add Point', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"point"});
          timeline.setSelection(getLastId());
          sharedService.broadcast(getLastId(), 'itemAdd', true, "blank");
        }]
      ];
    }
    // item context menu
    else {
      return [
        ['Delete', function ($itemScope) {
          items.remove(timeline.getSelection()[0]);
          sharedService.broadcast(0, 'nullSelect', false);
        }]
      ];
    }
  };
});

////////////////////////////////////////////////////////////////////////////////
// Item information/editing display controller
////////////////////////////////////////////////////////////////////////////////
app.controller("ItemInfoController", function($scope, $mdDialog, $http, sharedService){
  var vm = this;
  var item = {
    title: 'blank',
    journal: ''
  };
  $scope.editEnabled = false;
  $scope.itemDisplay = {
    title: '',
    journal: ''
  };

  $scope.$on('handlePublish', function(){
    if (sharedService.bcEvent == 'nullSelect') {
      // if background is selected, don't show anything and disable edit icon
      $scope.editEnabled = false;
    }
    else {
      $http.get("http://172.248.208.18:8000/ptl/process.php?method=getItem&id="+ sharedService.sharedId)
        .success(function(response, status) {
          console.log(status);
          if (status == 204) {
            $scope.itemDisplay = {
              title: 'blank',
              journal: ''
            };
          }
          else {
            $scope.itemDisplay = {
              title: sharedService.title,
              journal: response['journal']
            };
            item.title = sharedService.title;
            item.journal = response['journal'];
          }
          //sharedService.journal = response['journal'];
          //$scope.$apply();
        });
      $scope.editEnabled = true;
    }

    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.showItemEdit = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'item.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      locals: {
        item: item
      },
    })
    .then(function(answer) {

    }, function() {

    });
  };
});

function DialogController($scope, $mdDialog, item) {
  $scope.item = item;

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}
