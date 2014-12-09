(function(ng){
  'use strict';

  ng.module('wanderDemo', ['ngFabric'])
  .controller('DemoCtrl', ['$scope', 'FabricService', function($scope, FabricService){
    $scope.log = [];

    $scope.updateLog = function () {
      $scope.log.push({time: Date.now(), msg: '?'})
    };

    $scope.addImage = function () {
      console.log("it works?");
      FabricService.addImage('img/white-vans-shoes-kctdrqhh.jpg',
      {hasBorders: false, hasControls: false});
    };
  }])
  ;
})(
  window.angular
);
