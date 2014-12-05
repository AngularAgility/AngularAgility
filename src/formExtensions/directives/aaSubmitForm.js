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
    .directive('aaSubmitForm', ['aaFormExtensions', '$q', '$parse', function (aaFormExtensions, $q, $parse) {
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
              // Default behavior to make form reset itself after submit.
              var postSubmitStrategy = {
                submitted: function () {
                  angular.forEach(ngForm.$aaFormExtensions.$changeDependencies, function (dep) {
                    if (dep.field && dep.field.$ngModel.$modelValue !== dep.initialValue) {
                      dep.field.$ngModel.$setViewValue(dep.initialValue);
                      dep.field.$ngModel.$render();
                    }

                    if (dep.expr) {
                      $parse(dep.expr).assign(scope, dep.initialValue);
                    }
                  });

                  ngForm.$aaFormExtensions.$clearErrors();
                }
              };
              var eleSpinnerClickStrategy = spinnerClickStrategy(element);
              eleSpinnerClickStrategy.before();

              //if this isn't a promise it will resolve immediately
              $q.when(scope.aaSubmitForm()).then(postSubmitStrategy.submitted)
                ["finally"](function (result) {
                eleSpinnerClickStrategy.after();
                return result;
              });
            }

            scope.$apply();
          }

          element.on('click', submit);

          if (attrs.type === 'submit') {
            //this should be the form's default 'on enter' behavior for submission
            ngForm.$aaFormExtensions.$onEnterKey = submit;
          }
        }
      };
    }]);
})();
