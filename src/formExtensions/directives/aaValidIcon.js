/**
 * @ngdoc directive
 * @name aaValidIcon
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .directive('aaValidIcon', ['aaFormExtensions', function (aaFormExtensions) {
      return {
        require: 'ngModel',
        scope: false,
        compile: function (element) {
          var container = aaFormExtensions.validIconStrategy.getContainer(element);

          var validIcon = angular.element(aaFormExtensions.validIconStrategy.validIcon);
          container.append(validIcon);
          validIcon[0].style.display = 'none';

          var invalidIcon = angular.element(aaFormExtensions.validIconStrategy.invalidIcon);
          container.append(invalidIcon);
          invalidIcon[0].style.display = 'none';

          return function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {

              if (ngModel.$valid) {
                validIcon[0].style.display = '';
                invalidIcon[0].style.display = 'none';
              } else {
                validIcon[0].style.display = 'none';
                invalidIcon[0].style.display = '';
              }

              return val;
            });
          };
        }
      };
    }]);
})();
