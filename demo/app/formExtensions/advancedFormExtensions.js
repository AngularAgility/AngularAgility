angular
    .module('angularAgilityDemo')
    .controller('advancedFormExtensions', ['$scope', '$http', function($scope, $http) {

        $scope.settings.title = "Advanced Form Extensions";
        $scope.settings.subtitle = "Automatic form changed detection, form resets, on-navigate away handling, loading indicators";

        $http.get('/loadTestPerson')
            .success(function(person) {
                $scope.person = person;

                //ONLY needed for more advanced non ng-model based changes:
                //person.friends will be considered a change if it deviates from its initial state
                $scope.personForm.$aaFormExtensions.$addCollectionChangedDependency('person.friends');
            });

        $scope.submit = function() {
            return $http.get('/twosecondwait')
                .success(function() {
                    alert('done with ajax! (do you see the loading indicator, locked button?)');
                });
        };
    }]);