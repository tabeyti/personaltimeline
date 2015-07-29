////////////////////////////////////////////////////////////////////////////////
// Main timeline controller
////////////////////////////////////////////////////////////////////////////////
app.controller('ColorPickerController', function ($scope, itemManager, sharedService) {
  var cp = this;
  cp.item = sharedService.item;
  cp.colorClasses = [
    "red","orange","yellow","green","teal","blue"
  ];

  cp.accounceSelection = function(index) {
    cp.item.className = cp.colorClasses[index];
  };

});
