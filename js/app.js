(function(ng){
  'use strict';

  ng.module('wanderDemo', ['ngFabric'])
  .controller('DemoCtrl',
  ['$scope', '$timeout', 'FabricService', function($scope, $timeout, FabricService){
    $scope.log = [];

    $timeout(function(){
      FabricService.setOverlayImage('img/overlay-white-vans-shoes-left-view.png');
      FabricService.addShape('img/paths-white-vans-shoes-left-view.svg', {
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockMovementX: true,
        lockMovementY: true,
        fill: 'rgba(0, 136, 204, 0.4)'
      });
    });

  }])

  .factory('ShoeMetaService',[function(){
    var self = {};

    return self;
  }])
  ;
})(
  window.angular
);
