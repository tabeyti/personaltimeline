////////////////////////////////////////////////////////////////////////////////
// Item information/editing display controller
////////////////////////////////////////////////////////////////////////////////
app.controller("ItemContentDisplayController", function($scope, $mdDialog, $http, sharedService, itemManager){
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
      controller: 'DialogController',
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

app.controller('DialogController', function($scope, $mdDialog, item, itemManager) {
  $scope.item = item;
  $scope.tempItem = itemManager.cloneItem(item);

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    // updates item with changes
    if ('save' == answer) {
      $scope.item.journal = $scope.tempItem.journal;
      $scope.item.content = $scope.tempItem.content;
      $scope.item.labels = $scope.tempItem.labels;
      $scope.item.className = $scope.tempItem.className;
      itemManager.updateItem($scope.item);
    }
    $mdDialog.hide(answer);
  };

  $scope.colorClasses = [
    "red","orange","yellow","green","teal","blue"
  ];

  $scope.announceSelection = function(index) {
    // console.log($scope.colorClasses[index]);
    // console.log($scope.tempItem.type);
    // if ($scope.colorClasses[index] == "red" && $scope.tempItem.type == "point") {
    //   console.log('custom!');
    //   $scope.tempItem.className = "point-red";
    // }
    // else {
      $scope.tempItem.className = $scope.colorClasses[index];
    // }
  };
});
