/**
 * @ngdoc directive
 * @name ngModel
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    //constructs myForm.$aaFormExtensions.myFieldName object
    //including validation messages for all ngModels at form.$aaFormExtensions.
    //messages can be used there manually or emitted automatically with aaValMsg
    .directive('ngModel', ['aaFormExtensions', '$document', 'aaLoadingWatcher', '$timeout', 'aaUtils', '$injector',
      function (aaFormExtensions, $document, aaLoadingWatcher, $timeout, aaUtils, $injector) {
        return {
          require: ['ngModel', '?^form'],
          priority: 1,
          link: function (scope, element, attrs, controllers) {
            var ngModel = controllers[0],
              ngForm = controllers[1],
              fieldName = aaFormExtensions.defaultFieldName;

            if (!ngForm || !ngModel.$name) {
              //only for validation with forms
              //name is required or else angular form stuff doesn't work
              return;
            }

            aaUtils.ensureaaFormExtensionsFieldExists(ngForm, ngModel.$name);
            var field = ngForm.$aaFormExtensions[ngModel.$name];
            field.$form = ngForm;
            field.$element = element;
            field.$ngModel = ngModel;
            field.$calcErrorMessages = calcErrorMessages;
            field.$addError = addError;

            if (attrs.aaLabel || attrs.aaFieldName) {
              //use default label
              fieldName = aaFormExtensions.fieldNameCustomizer(attrs.aaLabel || attrs.aaFieldName, $injector);


            } else if (element[0].id) {
              //is there a label for this field?
              angular.forEach($document.find('label'), function (label) {
                if (label.getAttribute("for") === element[0].id) {
                  fieldName = (label.innerHTML || "").replace('*', '').trim();
                }
              });
            }


            element.on('blur', function () {
              field.showErrorReasons.push('hadFocus');
              element.addClass('aa-had-focus');

              //want to call $apply after current stack clears
              //if clicking on another element. better way?
              $timeout(function () {
              }, 1);
            });

            scope.$watch(function () {
              return ngForm.$aaFormExtensions.$invalidAttempt;
            }, function (val) {
              if (val) {
                element.addClass('aa-invalid-attempt');
              }
            });

            //CHANGE TRACKING
            if (attrs.aaExcludeChanges === undefined) {

              var loadingWatchDeReg, //for 'perf'
                fieldChangeDependency = {
                  field: field,
                  isChanged: false
                };

              //if you have a directive that has ng-model on its template and you do
              //another $compile of it (in a link or something) you will get multiple instances here
              //ng-model has the same issue. not sure if its worth checking since it
              //doesn't appear to cause any issues and this happens with native angular forms too internally!
              aaUtils.recursivePushChangeDependency(ngForm, fieldChangeDependency);

              // wait for stack to clear before checking
              //TODO consolidate this pattern onto aaLoadingWatcher it's self
              $timeout(function () {
                if (aaLoadingWatcher.isLoading) {
                  //delay changed checking until AFTER the form is completely loaded
                  loadingWatchDeReg = scope.$watch(function () {
                    return aaLoadingWatcher.isLoading;
                  }, function (isLoading) {
                    if (!isLoading) {
                      loadingWatchDeReg();
                      $timeout(setupChanged);
                    }
                  });
                } else {
                  setupChanged();
                }
              });

              scope.$on('$destroy', function () {

                delete ngForm.$aaFormExtensions[ngModel.$name];

                clearAndUpdateValidationMessages(ngForm);

                //clean up any field changed dependencies on parent forms
                cleanChangeDependencies(ngForm);

                function cleanChangeDependencies(form) {
                  if (form.$aaFormExtensions.$parentForm) {
                    cleanChangeDependencies(form.$aaFormExtensions.$parentForm);
                  }

                  aaUtils.arrayRemove(form.$aaFormExtensions.$changeDependencies, fieldChangeDependency);
                  aaUtils.checkAndSetFormChanged(form);
                }
              });
            }

            //start watching for changed efficiently
            function setupChanged() {

              fieldChangeDependency.initialValue = ngModel.$modelValue;

              //we can avoid using more expensive watches because angular exposes the built in methods:
              //ngModel.$modelValue is changing per view change
              ngModel.$viewChangeListeners.push(changed);

              //view is going to change per ngModel change
              ngModel.$formatters.push(function (val) {
                changed();
                return val;
              });

              function changed() {
                if (fieldChangeDependency.initialValue !== fieldChangeDependency.initialValue /*NaN check*/) {
                  //Angular initializes fields to NaN before they are 'actually' set.
                  //Don't count changes from NaN as they aren't really changes
                  fieldChangeDependency.initialValue = ngModel.$modelValue;
                }

                var newIsChanged = fieldChangeDependency.initialValue !== ngModel.$modelValue;
                if (fieldChangeDependency.isChanged !== newIsChanged) {
                  fieldChangeDependency.isChanged = newIsChanged;
                  aaUtils.recursiveParentCheckAndSetFormChanged(ngForm);
                }
              }
            }

            //any errors that were added with field.$addError
            //these are custom and dynamically added (often by the server)
            var addErrorErrors = {};

            //CALCULATE ERROR MESSAGES
            //recalculate field errors every time they change
            scope.$watch(function () {
                return ngModel.$error;
              },
              function (val) {
                if (val) {
                  field.$calcErrorMessages();
                }
              }, true);

            function calcErrorMessages() {
              var fieldErrorMessages = field.$errorMessages,
                msg;

              //clear out the validation messages that exist on *just the field*
              fieldErrorMessages.length = 0;

              for (var key in ngModel.$error) {
                if (ngModel.$error[key]) {

                  //for each possible validation message check if there is a custom
                  //validation message string on the element otherwise use
                  //the globally registered one or a catchall 'unknown'
                  if (attrs[key + 'Msg']) {
                    //there is a custom message on the element. it wins
                    msg = aaUtils.stringFormat(attrs[key + 'Msg'], fieldName, attrs[key]);
                  } else if (key === 'minlength') {
                    msg = aaUtils.stringFormat(attrs.ngMinlengthMsg || aaFormExtensions.validationMessages.minlength, fieldName, attrs.ngMinlength);
                  } else if (key === 'maxlength') {
                    msg = aaUtils.stringFormat(attrs.ngMaxlengthMsg || aaFormExtensions.validationMessages.maxlength, fieldName, attrs.ngMaxlength);
                  } else if (key === 'min') {
                    msg = aaUtils.stringFormat(attrs.minMsg || aaFormExtensions.validationMessages.min, fieldName, attrs.min);
                  } else if (key === 'max') {
                    msg = aaUtils.stringFormat(attrs.maxMsg || aaFormExtensions.validationMessages.max, fieldName, attrs.max);
                  } else if (key === 'pattern') {
                    msg = aaUtils.stringFormat(attrs.ngPatternMsg || aaFormExtensions.validationMessages.pattern, fieldName);
                  } else if (key === 'required' && element[0].type === 'number' && ngModel.$error.number) {
                    //angular doesn't correctly flag numbers as invalid rather as required when something wrong is filled in
                    //this is fixed in 1.3 but this hack maintains backward/forward compatibility
                    continue;
                  } else if (aaFormExtensions.validationMessages[key]) {
                    //globally registered custom message
                    msg = aaUtils.stringFormat(aaFormExtensions.validationMessages[key], fieldName);
                  } else if (addErrorErrors[key]) {
                    msg = addErrorErrors[key];
                  } else {
                    //unknown what the message should be, use unknown key
                    msg = aaUtils.stringFormat(aaFormExtensions.validationMessages.unknown, fieldName);
                  }

                  fieldErrorMessages.push(msg);
                }
              }

              clearAndUpdateValidationMessages(ngForm, fieldErrorMessages);
            }


            //TODO: update this in the future so that newErrorMessages are pushed to the $allValidationErrors
            //array in respect to initial form field order
            function clearAndUpdateValidationMessages(form, newErrorMessages /*optional*/) {

              //clear out any validation messages that exist for this field
              for (var i = form.$aaFormExtensions.$allValidationErrors.length - 1; i >= 0; i--) {
                if (form.$aaFormExtensions.$allValidationErrors[i].field === field) {
                  form.$aaFormExtensions.$allValidationErrors.splice(i, 1);
                }
              }

              //add new fields errors if specified
              if (newErrorMessages) {
                angular.forEach(newErrorMessages, function (msg) {
                  form.$aaFormExtensions.$allValidationErrors.push({
                    field: field,
                    message: msg
                  });
                });
              }

              //find all forms recursively upward that this field is a child of
              if (form.$aaFormExtensions.$parentForm) {
                clearAndUpdateValidationMessages(form.$aaFormExtensions.$parentForm, newErrorMessages);
              }
            }

            //programatically add an error message to a field. a good use case would be adding one from the
            //server after an unsuccessful submission attempt
            //message: the message you'd like
            //optional$errorKeyName: the key name you'd like the add to add the error as to myForm.myField.$errors[optional$errorKeyName]
            //callerHandledValidStrategy: (OPTIONAL!) if false field will be valid again on next mutation
            function addError(message, optional$errorKeyName, optionalCallerHandledValidStrategy) {
              if (!optional$errorKeyName) {
                optional$errorKeyName = message.replace(/[^a-z0-9]/gi, '-'); //generate a key without spaces
              }

              ngModel.$setValidity(optional$errorKeyName, false);
              addErrorErrors[optional$errorKeyName] = message;
              field.showErrorReasons.push(optional$errorKeyName);
              field.$calcErrorMessages();
              element.addClass('explicit-add-error');

              if (optionalCallerHandledValidStrategy) {
                return;
              }

              var listener = function () {

                ngModel.$setValidity(optional$errorKeyName, true);

                //schedule to remove after the stack clears as this is no longer needed
                //don't remove before because angular is in a loop on $viewChangeListeners
                $timeout(function () {
                  delete addErrorErrors[optional$errorKeyName];
                  aaUtils.arrayRemove(ngModel.$viewChangeListeners, listener);
                  element.removeClass('explicit-add-error');
                });
              };

              ngModel.$viewChangeListeners.unshift(listener);
            }
          }
        };
      }]);
})();
