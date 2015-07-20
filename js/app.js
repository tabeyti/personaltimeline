var app = angular.module("app", ['ui.bootstrap.contextMenu', 'ngMaterial']);

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
// Main timeline controller
////////////////////////////////////////////////////////////////////////////////
app.controller("MainController", function($scope, $http, sharedService){
  var vm = this;
  vm.title = 'Personal Timeline';
  var itemTitle = '';
  var itemContent = '';
  var nextId = 1;


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

  function getNextId() { return nextId++; };
  function getLastId() { return nextId - 1; };

  vm.getData = function() {
    var data = items.get({
      type: {
        start: 'ISODate',
        end: 'ISODate'
      }
    });
    return JSON.stringify(data, null, 2);
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
      sharedService.broadcast(items.get(stuff.items[0]), 'itemSelect', false);
    }
  });

  timeline.on('contextmenu', function(props) {
    timeline.setSelection(props.item);
    clickedTime = props.snappedTime;

    if (props.item == null) {
      sharedService.broadcast(0, 'nullSelect', false, "");
    }
    else {
      sharedService.broadcast(items.get(props.item), 'itemSelect', false);
    }
  });

  // ===========================================================================
  // Right Click Context Menu
  // ===========================================================================
  $scope.menuOptions = function(item) {
    // timeline background context menu
    console.log(vm.getData());
    if (timeline.getSelection().length == 0) {
      return [
        ['Add Range', function ($itemScope) {
          var rangeSize = (timeline.getWindow().end.getTime() - timeline.getWindow().start.getTime())/5;
          var endDate = new Date(clickedTime.getTime()+rangeSize);
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, end: endDate, type:"range", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(items.get(getLastId()), 'itemAdd', true);
        }],
        ['Add Box', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"box", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(items.get(getLastId()), 'itemAdd', true);
        }],
        ['Add Point', function ($itemScope) {
          items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"point", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(items.get(getLastId()), 'itemAdd', true);
        }]
      ];
    }
    // item context menu
    else {
      return [
        ['Edit', function ($itemScope) {
          sharedService.broadcast(getLastId(), 'editItem', false);
        }],
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
  $scope.editEnabled = false;
  $scope.itemDisplay = {
    title: '',
    journal: ''
  };

  $scope.$on('handlePublish', function(){
    // handle event based on type
    switch (sharedService.bcEvent)
    {
      case 'nullSelect':
        $scope.itemDisplay = {
          title: '',
          journal: ''
        };
        $scope.editEnabled = false;
        break;
      case 'editItem':
        $scope.showItemEdit(this);
        break;
      default:
        LoadItemData();
        break;
    }

    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  function LoadItemData() {
    // pull item id data
    // $http.get("http://172.248.208.18:8000/ptl/process.php?method=getItem&id="+ sharedService.sharedId)
    //   .success(function(response, status) {
    //     if (status == 204) {
    //       $scope.itemDisplay = {
    //         title: 'blank',
    //         journal: ''
    //       };
    //     }
    //     else {
    //       $scope.itemDisplay = {
    //         title: sharedService.title,
    //         journal: response['journal']
    //       };
    //     }
    //   });
    $scope.itemDisplay.title = sharedService.item.content;
    $scope.itemDisplay.journal = sharedService.item.journal;
    $scope.editEnabled = true;
  };


  $scope.showItemEdit = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'item.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      locals: {
        item: $scope.itemDisplay
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
