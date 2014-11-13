/**
 * @ngdoc directive
 * @name aaSubmitForm
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .directive('aaSubmitForm', ['aaFormExtensions', '$q', function (aaFormExtensions, $q) {
      return {
        scope: {
          aaSubmitForm: '&'
        },
        restrict: 'A',
        require: '^form',
        link: function (scope, element, attrs, ngForm) {

          function submit() {
            ngForm.$aaFormExtensions.$onSubmitAttempt();

            if (ngForm.$valid) {

              var spinnerClickStrategy = aaFormExtensions.spinnerClickStrategies[attrs.spinnerClickStrategy || aaFormExtensions.defaultSpinnerClickStrategy];
              var eleSpinnerClickStrategy = spinnerClickStrategy(element);
              eleSpinnerClickStrategy.before();

              //if this isn't a promise it will resolve immediately
              $q.when(scope.aaSubmitForm())
                ["finally"](function (result) {
                eleSpinnerClickStrategy.after();
                return result;
              });
            }

            scope.$apply();
          }

          element.on('click', submit);
        }
      };
    }]);
})();
