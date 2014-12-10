(function(ng){
  'use strict';

  ng.module('wanderDemo', ['ngFabric'])
  .controller('DemoCtrl',
  ['$scope', '$timeout', 'FabricService', function($scope, $timeout, FabricService){
    $scope.log = [];

    $scope.shapeValues = {};

    $scope.shoeFabricColors = [
      '#5CACC4',
      '#8CD19D',
      '#CEE879',
      '#FCB653',
      '#FF5254'
    ];

    $timeout(function(){
      FabricService.setCanvasBgColor('#fff');

      FabricService
      .setOverlayImage('img/overlay-white-vans-shoes-left-view.png')
      .then(function(){
        FabricService.loadShape('img/paths-white-vans-shoes-left-view.svg', {
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          lockMovementX: true,
          lockMovementY: true,
          perPixelTargetFind: true,
          targetFindTolerance: 2,
          group: false,
          stroke: 'transparent',
          fill: 'rgb(0, 136, 204)'
        });
      });
    });

    $scope.download = function () {
      FabricService.download('Shoe.jpg'); // TODO: Take the name from some input
    };

    $scope.changeColor = function(colorIndex) {
      FabricService.setFill($scope.shoeFabricColors[colorIndex]);
      //FabricService.setOpacity(1);
    };

  }])
  ;
})(
  window.angular
);
