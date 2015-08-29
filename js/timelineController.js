////////////////////////////////////////////////////////////////////////////////
// Main timeline controller
////////////////////////////////////////////////////////////////////////////////
app.controller('MainController', function($scope, $http, sharedService, itemManager, $mdDialog, $mdToast){
  var vm = this;
  vm.title = 'Personal Timeline';
  var nextId = 1;
  vm.derp = '';
  vm.periodSelected = {};
  vm.timelineMaxHeight = '300px';
  vm.periods = itemManager.periods;

  $scope.$watchCollection('itemManager.periods', function(newVal, oldVal) {
    vm.periods = itemManager.periods;
    console.log('update!');
    console.log(itemManager.periods);
  },
  true);

  // ===========================================================================
  // Timeline setup
  // ===========================================================================
  var container = document.getElementById('timelineBar');
  // var subContainer = document.createElement('div');
  // container.appendChild(subContainer);

  var options = {
    height: vm.timelineMaxHeight,
    maxHeight: vm.timelineMaxHeight,
    multiselect: false,
    // allow manipulation of items
    editable: {
      add: false,
      remove: false,
      updateTime: true,
      updateGroup: true
    },
    showCurrentTime: true,
  };
  var timeline = new vis.Timeline(container, itemManager.items, options);

  // reteive items from server
  $http.get('http://172.248.208.18:8000/ptl/process.php?method=getTimeline')
    .success(function(response) {
      itemManager.clear();
      itemManager.addSet(response);
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

  function populateLabels(items) {

  };
  function getNextId() { return nextId++; };
  function getLastId() { return nextId - 1; };

  vm.getData = function() {
    var data = itemManager.get({
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
  timeline.on('select', function(ev) {
    if (ev.items.length == 0) {
      sharedService.broadcast(0, 'nullSelect', false);
    }
    else {
      sharedService.broadcast(itemManager.get(ev.items[0]), 'itemSelect', false);
    }
  });

  timeline.on('contextmenu', function(props) {
    timeline.setSelection(props.item);
    clickedTime = props.snappedTime;
    if (props.item == null) {
      sharedService.broadcast(0, 'nullSelect', false, '');
    }
    else {
      sharedService.broadcast(itemManager.get(props.item), 'itemSelect', false);
    }
  });

  vm.periodClick = function(period, ev) {
    timeline.setSelection(period.id);
    sharedService.broadcast(period, 'itemSelect', false);
  };

  vm.periodRowDelete = function(period) {
    itemManager.remove(period);
    sharedService.broadcast(0, 'nullSelect', false);
  };

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
          itemManager.addBlankItem('range', getNextId(), [], clickedTime, endDate);
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.get(getLastId()), 'editItem', true);
        }],
        ['Add Box', function ($itemScope) {
          itemManager.addBlankItem('box', getNextId(), [], clickedTime);
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.get(getLastId()), 'editItem', true);
        }],
        ['Add Point', function ($itemScope) {
          itemManager.addBlankItem('point', getNextId(), [], clickedTime);
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.get(getLastId()), 'editItem', true);
        }],
        ['Add Period', function ($itemScope) {
          var rangeSize = (timeline.getWindow().end.getTime() - timeline.getWindow().start.getTime())/5;
          var endDate = new Date(clickedTime.getTime()+rangeSize);
          itemManager.addBlankItem('period', getNextId(), [], clickedTime, endDate);
          timeline.setSelection(getLastId());
          sharedService.broadcast(itemManager.get(getLastId()), 'editItem', true);
        }]
      ];
    }
    // item context menu
    else {
      return [
        ['Edit', function ($itemScope) {
          sharedService.broadcast(itemManager.get(timeline.getSelection()[0]), 'editItem', false);
        }],
        ['Delete', function ($itemScope) {
          itemManager.remove(timeline.getSelection()[0]);
          sharedService.broadcast(0, 'nullSelect', false);
        }]
      ];
    }
  };

  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  vm.onSave = function(event) {
    var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title('Do you want to save the changes?')
      .ariaLabel('Save Dialog')
      .ok('Save')
      .cancel('Cancel')
      .targetEvent(event);
    $mdDialog.show(confirm).then(function() {
      $http.post('http://172.248.208.18:8000/ptl/process.php', itemManager.getData())
        .then(function(response) {
          $mdToast.show(
            $mdToast.simple()
              .content('Data Saved!')
              .position($scope.getToastPosition())
              .hideDelay(3000)
            );
        });

    }, function() {
      // cancel code in here
    });
  }



});
