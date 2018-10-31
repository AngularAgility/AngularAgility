/**
 * @ngdoc directive
 * @name aaSpinnerClick
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //perform an ng-click that watches for a $q promise
    //showing a loading indicator using the default spinnerClickStrategy
    //or a specified (inline on the directive) spinner-click-strategy="myStrategy"
    .directive('aaSpinnerClick', ['$q', 'aaFormExtensions', '$injector', function ($q, aaFormExtensions, $injector) {
      return {
        link: function (scope, element, attrs) {

          var strategy = aaFormExtensions.spinnerClickStrategies[attrs.spinnerClickStrategy || aaFormExtensions.defaultSpinnerClickStrategy];

          if (!strategy) {
            throw new Error("An inline or default spinner click strategy must be specified");
          }

          element.on('click', function () {
            scope.$apply(function () {

              var elementStrategy = strategy(element, $injector);

              elementStrategy.before();

              //if this isn't a promise it will resolve immediately
              $q.when(scope.$eval(attrs.aaSpinnerClick))
                .then(function (result) {
                  elementStrategy.after();
                  return result;
                });
            });
          });
        }
      };
    }]);
})();
