/*globals angular, alert */
angular
  .module('angularAgilityDemo')
  .controller('basicFormExtensions', ['$scope', '$http', function ($scope, $http) {
    'use strict';
    $scope.settings.title = "Basic Form Extensions Demo";
    $scope.settings.subtitle = "Generate Angular.js form fields, labels and rich validation messages with error notifications in one line of HTML";

    $scope.save = function () {
      return $http.get('/twosecondwait')
        .success(function () {
          alert('done with ajax! (do you see the loading indicator, locked button?)');
        });
    };

    $scope.colors = [
      {name: 'black'},
      {name: 'white'},
      {name: 'red'},
      {name: 'blue'},
      {name: 'yellow'}
    ];
  }]);