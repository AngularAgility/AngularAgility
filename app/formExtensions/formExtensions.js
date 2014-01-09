angular
    .module('angularAgilityDemo')
    .controller('formExtensions', ['$scope', function ($scope) {

        $scope.save = function() {
            alert("save called successfully")
        }

        $scope.foods = [{name: "Pizza"},{name: "Cookies"}];
    }]);