/**
 * @ngdoc directive
 * @name defaultOption
 *
 * @description
 * Directive allowing to place a default option on select elements.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //generate a label for an input generating an ID for it if it doesn't already exist
    .directive('defaultOption', ['aaFormExtensions', 'aaUtils', '$compile', '$injector', function (aaFormExtensions, aaUtils, $compile, $injector) {
      return {
          priority: 1,
          compile: function (element, attrs) {
            return {
                pre: function (scope, element, attrs) {
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

                      var options = element.children('option[value=""]');

                      if(!options.length) {
                        element.append(angular.element('<option value=""></option>').html(msg));

                      element.removeAttr('default-option');
                      }
                  }
                }
            };
          }
          
      };
    }]);
})();