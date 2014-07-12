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
    .directive('aaLabel', ['aaFormExtensions', 'aaUtils', function (aaFormExtensions, aaUtils) {
      return {
        compile: function (element, attrs) {

          //add default option if specified
          //if this is a select with a default-option attribute add a default option (per ng spec)
          if (element.prop('tagName').toUpperCase() === 'SELECT' && attrs.defaultOption !== undefined) {

            var msg = attrs.defaultOption;

            if (msg === null || msg === "") {

              //gen one
              msg = 'Select';

              if (attrs.aaLabel) {
                msg += ' a ' + attrs.aaLabel;
              }

              msg += '...';
            }

            element.append(angular.element('<option value=""></option>').html(msg));
          }

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

            strategy(element, attrs.aaLabel, isRequiredField);
          };
        }
      };
    }]);
})();
