(function(ng){
  'use strict';

  ng.module('wanderDemo', ['ngFabric'])
  .controller('DemoCtrl',
  ['$scope', '$timeout', 'FabricService', function($scope, $timeout, FabricService){
    $scope.log = [];

    $timeout(function(){
      FabricService.setOverlayImage('img/overlay-white-vans-shoes-left-view.png');
      FabricService.loadShape('img/paths-white-vans-shoes-left-view.svg', {
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockMovementX: true,
        lockMovementY: true,
        stroke: 'transparent',
        fill: 'rgba(0, 136, 204, 0.9)'
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
