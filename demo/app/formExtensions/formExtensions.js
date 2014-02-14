angular
    .module('angularAgilityDemo')
    .controller('formExtensions', ['$scope', function ($scope) {

        $scope.save = function() {
            alert("save called successfully");
        };

        $scope.colors = [
            {name:'black'},
            {name:'white'},
            {name:'red'},
            {name:'blue'},
            {name:'yellow'}
        ];
    }]);