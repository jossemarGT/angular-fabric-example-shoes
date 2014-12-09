(function(ng){
  'use strict';

  ng.module('wanderDemo', ['ngFabric'])
  .controller('DemoCtrl', ['$scope', '$timeout', 'FabricService', function($scope, $timeout, FabricService){
    $scope.log = [];

    $timeout(function(){
      FabricService.setBackgroundColor('#DFECE6');
    });

    $scope.addImage = function () {
      FabricService.addImage(
        'img/white-vans-shoes-800-contrast-18.png',
        {
          hasBorders: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
        }
      );
    };

    $scope.transperify = function (){
      FabricService.addFilter('RemoveWhite', {
        threshold: 30,
        distance: 10
      });

      FabricService.applyFilters();
    }
  }])
  ;
})(
  window.angular
);
