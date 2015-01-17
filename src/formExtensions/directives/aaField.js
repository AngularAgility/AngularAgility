/*globals angular */

/**
 * @ngdoc directive
 * @name aaField
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .directive('aaField', ['$compile', 'aaUtils', function ($compile, aaUtils) {
      return {
        restrict: 'A',
        scope: false,
        replace: true,
        priority: 1000,
        terminal: true,
        compile: function (element, attrs) {

          //use the passed value for ng-model
          element.attr("ng-model", attrs.aaField);

          var lastPartOfName = attrs.aaField.substring(attrs.aaField.lastIndexOf('.') + 1);

          //if no name set calc one
          if (!attrs.name) {
            element.attr("name", lastPartOfName);
          }

          //assume input type="text" (which a browser will do but many libraries ex. boostrap have styling that requires it)
          if (!attrs.type && element.prop('tagName').toUpperCase() === 'INPUT') {
            element.prop('type', 'text');
          }

          //if no label and "no-label" don't calc one
          if (!attrs.aaLabel && attrs.noLabel === undefined) {

            //remove trailing "Id". Usually a label isn't "PersonId" it's Person
            if (lastPartOfName.lastIndexOf('Id') === lastPartOfName.length - 2) {
              lastPartOfName = lastPartOfName.substring(0, lastPartOfName.length - 2);
            }

            element.attr('aa-label', aaUtils.toTitleCase(aaUtils.splitCamelCase(lastPartOfName)));
          }

          if (attrs.aaNoValMsg === undefined){
            element.attr("aa-val-msg", "");
          }

          element.removeAttr('aa-field');

          element.replaceWith(aaUtils.outerHTML(element[0]));

          return function (scope, element) {
            $compile(element)(scope);
          };
        }
      };
    }]);

})();
