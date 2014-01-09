angular
    .module('angularAgilityDemo')
    .controller('formExtensions', ['$scope', function ($scope) {

        $scope.save = function() {
            alert("save called successfully")
        }

        $scope.colors = [
            {name:'black', shade:'dark'},
            {name:'white', shade:'light'},
            {name:'red', shade:'dark'},
            {name:'blue', shade:'dark'},
            {name:'yellow', shade:'light'}
        ];
    }]);