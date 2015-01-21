/**
 * @ngdoc directive
 * @name aaLabel
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //generate a label for an input generating an ID for it if it doesn't already exist
    .directive('aaLabel', ['aaFormExtensions', 'aaUtils', '$compile', '$injector', function (aaFormExtensions, aaUtils, $compile, $injector) {
      return {
        compile: function (element, attrs) {
          return function (scope, element, attrs) {
            var strategy = aaFormExtensions.labelStrategies[attrs.aaLabelStrategy];

            //this could be a one off strategy on scope. lets try...
            if (!strategy) {
              var maybe = scope.$eval(attrs.aaLabelStrategy);
              if (angular.isFunction(maybe)) {
                strategy = maybe;
              }
            }

            //use default
            if (!strategy) {
              strategy = aaFormExtensions.labelStrategies[aaFormExtensions.defaultLabelStrategy];
            }

            var isRequiredField = (attrs.required !== undefined);

            //auto generate an ID for compliant label names
            if (!element[0].id) {
              element[0].id = aaUtils.guid();
            }

            var label = strategy(element, attrs.aaLabel, isRequiredField, $injector);
            if (label) {
                $compile(label)(scope);
            }
          };
        }
      };
    }]);
})();
