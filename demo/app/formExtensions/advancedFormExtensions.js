angular
    .module('angularAgilityDemo')
    .controller('advancedFormExtensions', ['$scope', '$http', function($scope, $http) {

        $scope.settings.title = "Advanced Form Extensions";
        $scope.settings.subtitle = "Form changed tracking, form resets, loading indicators, on-navigate away handling";

        $http.get('/loadTestPerson')
            .success(function(person) {
                $scope.person = person;

                //ONLY needed for more advanced non ng-model based changes:
                //person.friends will be considered a change if it deviates from its initial state
                $scope.personForm.$aaFormExtensions.$addChangeDependency('person.friends', true);
            });

        $scope.submit = function() {
            return $http.get('/twosecondwait')
                .success(function() {
                    $scope.personForm.$aaFormExtensions.$resetChanged();
                    alert('done with ajax! (do you see the loading indicator, locked button?)');
                });
        };

    }]);