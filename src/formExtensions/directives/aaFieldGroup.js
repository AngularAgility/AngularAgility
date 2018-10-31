/**
 * @ngdoc directive
 * @name aaFieldGroup
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .directive('aaFieldGroup', ['$compile', 'aaFormExtensions', '$injector', function ($compile, aaFormExtensions, $injector) {
      return {
        restrict: 'A',
        scope: false,
        replace: true,
        priority: 1100,
        terminal: true,
        compile: function (element, attrs) {

          element.removeAttr('aa-field-group');
          element.attr("aa-field", attrs.aaFieldGroup);

          var strat = aaFormExtensions.fieldGroupStrategies[attrs.aaFieldGroupStrategy || aaFormExtensions.defaultFieldGroupStrategy];
          strat(element, $injector);

          return function (scope, element) {
            $compile(element)(scope);
          };
        }
      };
    }]);

})();
