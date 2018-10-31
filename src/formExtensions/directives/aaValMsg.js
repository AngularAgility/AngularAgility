/**
 * @ngdoc directive
 * @name aaValMsg
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //place on an element with ngModel to generate validation messages for it
    //will use the default configured validation message placement strategy unless a custom strategy is passed in
    .directive('aaValMsg', ['$compile', 'aaFormExtensions', '$injector', function ($compile, aaFormExtensions, $injector) {
      return {
        require: ['ngModel', '^form'],
        link: function (scope, element, attrs, ctrls) {

          var form = ctrls[1];

          //TODO: auto generation of name would be better than an error IMO
          if (!attrs.name) {
            throw new Error("In order to use aaValMsg a name MUST be specified on the element: " + element[0]);
          }

          var newScope = scope.$new(); //allow strategy to muck with scope in an isolated manner

          var msgElement = aaFormExtensions.valMsgPlacementStrategies[attrs.aaValMsg || aaFormExtensions.defaultValMsgPlacementStrategy](
            element, form.$name, attrs.name, newScope, $injector
          );

          $compile(msgElement)(newScope);
        }
      };
    }]);
})();
