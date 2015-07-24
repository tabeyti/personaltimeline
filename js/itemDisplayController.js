////////////////////////////////////////////////////////////////////////////////
// Item information/editing display controller
////////////////////////////////////////////////////////////////////////////////
app.controller("ItemDisplayController", function($scope, $mdDialog, $http, sharedService, itemManager){
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
      itemManager.items.update($scope.item);
    }
    $mdDialog.hide(answer);
  };
}
