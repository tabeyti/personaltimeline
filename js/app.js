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
  var itemManager = {};

  itemManager.items = new vis.DataSet({
    type: { start: 'ISODate', end: 'ISODate' }
  });

  return itemManager;
});

////////////////////////////////////////////////////////////////////////////////
// Main timeline controller
////////////////////////////////////////////////////////////////////////////////
app.controller("MainController", function($scope, $http, sharedService, itemManager){
  var vm = this;
  vm.title = 'Personal Timeline';
  var nextId = 1;

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
  var timeline = new vis.Timeline(container, itemManager.items, options);

  // reteive items from server
  $http.get("http://172.248.208.18:8000/ptl/process.php?method=getTimeline")
    .success(function(response) {
      console.log(response);
      itemManager.items.clear();
      itemManager.items.add(response);
      timeline.fit();

      // find the nextId id
      itemManager.items.forEach(function(element) {
        if (nextId <= element.id) {
          nextId = element.id + 1;
        }
      });
    })
    .error(function(response) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.body))
          .title('Server Error')
          .content(response)
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
          .targetEvent(ev)
      );
    });

  function getNextId() { return nextId++; };
  function getLastId() { return nextId - 1; };

  vm.getData = function() {
    var data = itemManager.items.get({
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
      sharedService.broadcast(itemManager.items.get(stuff.items[0]), 'itemSelect', false);
    }
  });

  timeline.on('contextmenu', function(props) {
    timeline.setSelection(props.item);
    clickedTime = props.snappedTime;
    if (props.item == null) {
      sharedService.broadcast(0, 'nullSelect', false, "");
    }
    else {
      sharedService.broadcast(itemManager.items.get(props.item), 'itemSelect', false);
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
          var rangeSize = (timeline.getWindow().end.getTime() - timeline.getWindow().start.getTime())/5;
          var endDate = new Date(clickedTime.getTime()+rangeSize);
          itemManager.items.add({"id": getNextId(), "content": "blank", start: clickedTime, end: endDate, type:"range", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.items.get(getLastId()), 'editItem', true);
        }],
        ['Add Box', function ($itemScope) {
          itemManager.items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"box", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.items.get(getLastId()), 'editItem', true);
        }],
        ['Add Point', function ($itemScope) {
          itemManager.items.add({"id": getNextId(), "content": "blank", start: clickedTime, type:"point", journal:""});
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.items.get(getLastId()), 'editItem', true);
        }]
      ];
    }
    // item context menu
    else {
      return [
        ['Edit', function ($itemScope) {
          sharedService.broadcast(itemManager.items.get(timeline.getSelection()[0]), 'editItem', false);
        }],
        ['Delete', function ($itemScope) {
          itemManager.items.remove(timeline.getSelection()[0]);
          sharedService.broadcast(0, 'nullSelect', false);
        }]
      ];
    }
  };
});

////////////////////////////////////////////////////////////////////////////////
// Item information/editing display controller
////////////////////////////////////////////////////////////////////////////////
app.controller("ItemInfoController", function($scope, $mdDialog, $http, sharedService, itemManager){
  var vm = this;
  $scope.editEnabled = false;
  $scope.item;

  $scope.$on('handlePublish', function(){
    // handle event based on type
    switch (sharedService.bcEvent)
    {
      case 'nullSelect':
        $scope.item = {};
        $scope.editEnabled = false;
        break;
      case 'editItem':
        LoadItemData();
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
    $scope.item = sharedService.item;
    $scope.editEnabled = true;
  };


  $scope.showItemEdit = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'item.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      locals: {
        item: $scope.item,
        itemManager: itemManager
      },
    })
    .then(function(answer) {
      if ('save' == answer)
      {

      }
    }, function() {

    });
  };
});

function DialogController($scope, $mdDialog, item, itemManager) {
  $scope.item = item;
  $scope.oldItem = {
    journal: item.journal,
    content: item.content
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    // restore old information
    if ('save' != answer) {
      $scope.item.journal = $scope.oldItem.journal;
      $scope.item.content = $scope.oldItem.content;
    }
    else {
      console.log($scope.item);
      itemManager.items.update($scope.item);
    }
    $mdDialog.hide(answer);
  };
}
