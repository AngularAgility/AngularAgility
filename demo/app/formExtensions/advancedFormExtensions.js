angular
    .module('angularAgilityDemo')
    .controller('advancedFormExtensions', ['$scope', '$http', function($scope, $http) {

        $scope.settings.title = "Advanced Form Extensions";
        $scope.settings.subtitle = "Efficient, automatic 'form changed' detection, automatic form resets, on-navigate away handling, loading indicators";


        $http.get('/loadTestPerson')
            .success(function(person) {
                $scope.person = person;
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