angular
    .module('angularAgilityDemo')
    .controller('formExtensions', ['$scope', '$http', function ($scope, $http) {

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