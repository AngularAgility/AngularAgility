/*globals angular, alert */
angular
  .module('angularAgilityDemo')
  .controller('advancedFormExtensions', ['$scope', '$http', '$aaFormExtensions', function ($scope, $http, $aaFormExtensions) {
    'use strict';
    $scope.settings.title = "Advanced Form Extensions";
    $scope.settings.subtitle = "Form changed tracking, form resets, loading indicators, on-navigate away handling";

    $http.get('/loadTestPerson')
      .success(function (person) {
        $scope.person = person;

        //*ONLY* needed for more advanced non ng-model based changes:
        //person.friends will be considered a change if it deviates from its initial state
        $aaFormExtensions.$addChangeDependency('person.friends');
      });

    $scope.submit = function () {
      return $http.post('/savePerson', $scope.person)
        .success(function () {
          //the new state of the form is now the initial state
          $aaFormExtensions.$resetChanged();
          alert('done with ajax! (do you see the loading indicator, locked button?)');
        });
    };

  }]);