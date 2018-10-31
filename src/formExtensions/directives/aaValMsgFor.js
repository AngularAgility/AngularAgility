/**
 * @ngdoc directive
 * @name aaValMsgFor
 *
 * @description
 * Description place holder.
 **/
(function() {
  'use strict';

  angular.module('aa.formExtensions')
    //if used directly rather than passively with aaValMsg allows for direct placement of validation messages
    //for a given form field. ex. pass "myForm.myFieldName"
    .directive('aaValMsgFor', ['aaFormExtensions', 'aaUtils', '$timeout', function(aaFormExtensions, aaUtils, $timeout) {
      //generate the validation message for a particular form field here
      return {
        require: ['^form'],
        priority: 1,
        scope: true,
        link: function($scope, element, attrs) {

          $timeout(function() { //if referring to fields created in other directives give them time to render before trying to look for them. ex ng-repeat

            var fullFieldPath = attrs.aaValMsgFor;
            var fieldInForm, formObj;

            var innerScope = $scope;
            var parts = fullFieldPath.split(".");
            var formName = parts.shift();
            var fieldPath = "['" + parts.join(".") + "']"; // filed path without form name, as array accessor
            var fieldFormPath = formName + fieldPath;

            while ((!fieldInForm || !formObj) && innerScope) {
              fieldInForm = innerScope.$eval(fieldFormPath);
              formObj = innerScope.$eval(formName);

              if ((!fieldInForm || !formObj)) {
                innerScope = innerScope.$parent;
              }
            }

            //TODO: if this is inside an isolate scope and the form is outside the isolate scope this doesn't work
            //could nest multiple forms so can't trust directive require and have to eval to handle edge cases...
            aaUtils.ensureaaFormExtensionsFieldExists(formObj, fieldInForm.$name);
            $scope.fieldInFormExtensions = innerScope.$eval(formName + ".$aaFormExtensions" + fieldPath);

            $scope.$watchCollection(
              function() {
                return $scope.fieldInFormExtensions.$errorMessages;
              },
              function(val) {
                $scope.errorMessages = val;
              }
            );

            $scope.$watch(
              function() {
                return [
                  formObj.$aaFormExtensions.$invalidAttempt,
                  $scope.fieldInFormExtensions.showErrorReasons
                ];
              },
              function() {
                var invalidAttempt = formObj.$aaFormExtensions.$invalidAttempt,
                  showErrorReasons = $scope.fieldInFormExtensions.showErrorReasons;

                if(invalidAttempt === undefined || showErrorReasons === undefined) {
                  return;
                }

                $scope.showMessages = invalidAttempt || showErrorReasons.length > 0;
              },
              true
            );
          });
        },
        template: aaFormExtensions.valMsgForTemplate,
        replace: true
      };
    }]);

})();
