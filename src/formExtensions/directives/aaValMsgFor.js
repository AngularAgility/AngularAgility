/**
 * @ngdoc directive
 * @name aaValMsgFor
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //if used directly rather than passively with aaValMsg allows for direct placement of validation messages
    //for a given form field. ex. pass "myForm.myFieldName"
    .directive('aaValMsgFor', ['aaFormExtensions', 'aaUtils', function (aaFormExtensions, aaUtils) {
      //generate the validation message for a particular form field here
      return {
        require: ['^form'],
        priority: 1,
        scope: true,
        link: function ($scope, element, attrs) {

          var fullFieldPath = attrs.aaValMsgFor,
            fieldInForm = $scope.$eval(fullFieldPath),
            formObj = $scope.$eval(fullFieldPath.substring(0, fullFieldPath.indexOf('.')));

          //TODO: if this is inside an isolate scope and the form is outside the isolate scope this doesn't work
          //could nest multiple forms so can't trust directive require and have to eval to handle edge cases...
          aaUtils.ensureaaFormExtensionsFieldExists(formObj, fieldInForm.$name);
          var fieldInFormExtensions = $scope.$eval(fullFieldPath.replace('.', '.$aaFormExtensions.'));

          $scope.$watchCollection(
            function () {
              return fieldInFormExtensions.$errorMessages;
            },
            function (val) {
              $scope.errorMessages = val;
            }
          );

          $scope.$watch(
            function () {
              return [
                formObj.$aaFormExtensions.$invalidAttempt,
                fieldInFormExtensions.showErrorReasons
              ];
            },
            function (watches) {
              var invalidAttempt = watches[0],
                showErrorReasons = watches[1];

              $scope.showMessages = invalidAttempt || showErrorReasons.length;
            },
            true
          );
        },
        template: aaFormExtensions.valMsgForTemplate,
        replace: true
      };
    }]);

})();
