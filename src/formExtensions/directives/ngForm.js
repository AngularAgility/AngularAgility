/**
 * @ngdoc directive
 * @name ngForm
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  function aaFormFactory(isNgForm, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher, aaUtils) {
    return {
      restrict: isNgForm ? 'EAC' : 'E',
      require: 'form',
      compile: function () {
        return {
          pre: function (scope, element, attrs, thisForm) {

            function nullFormRenameControl(control, name) {
              control.$name = name;
            }

            function setAttemptRecursively(form, isInvalid) {
              form.$aaFormExtensions.$invalidAttempt = isInvalid;

              angular.forEach(form.$aaFormExtensions.$childForms, function (childForm) {
                setAttemptRecursively(childForm, isInvalid);
              });
            }

            var parentForm;

            if(attrs.isolatedForm === undefined) {
              //have to manually find parent forms '?^form' doesn't appear to work in this case (as it is very funky)
              parentForm = element.parent().controller('form');
            } else {
              thisForm.$$parentForm.$removeControl(thisForm);

              var nullFormCtrl = {
                $addControl: angular.noop,
                $$renameControl: nullFormRenameControl,
                $removeControl: angular.noop,
                $setValidity: angular.noop,
                $setDirty: angular.noop,
                $setPristine: angular.noop,
                $setSubmitted: angular.noop
              };

              var parentFormController = element.parent().controller('form');
              var currentSetValidity = thisForm.$setValidity;
              thisForm.$$parentForm = nullFormCtrl;

              thisForm.$setValidity = function ( validationToken, isValid, control ) {
                currentSetValidity( validationToken, isValid, control );
                parentFormController.$setValidity( validationToken, true, thisForm );
              };
            }


            thisForm.$aaFormExtensions = {
              $onSubmitAttempt: function () {
                setAttemptRecursively(thisForm, thisForm.$invalid);
              },
              $parentForm: parentForm,
              $childForms: [],
              $allValidationErrors: [],
              $changeDependencies: [],
              $changed: false,
              $invalidAttempt: false,
              $addChangeDependency: $addChangeDependency,

              //reset all changes back to their original values per $changeDependencies
              $reset: $reset,

              //reset $changeDependencies. All the current values are now the new inital values
              $resetChanged: $resetChanged,

              //clear form errors
              $clearErrors: $clearErrors,

              $addValidationError: $addValidationError

              // $multiFieldValidationErrors: [] //todo: add this back if multiple messages repeated is bad
            };

            if (parentForm) {
              parentForm.$aaFormExtensions.$childForms.push(thisForm);
            }

            //only root forms get the opportunity to block router state changes
            //add option to disable confirmation messages e.g. after form submit user redirection
            if (!parentForm && attrs.aaConfirmationMessage !== "false") {
              var strategy = aaFormExtensions.onNavigateAwayStrategies[attrs.onNavigateAwayStrategy || aaFormExtensions.defaultOnNavigateAwayStrategy ];
              if (angular.isFunction(strategy)) {
                strategy(scope, thisForm, $injector);
              }
            }

            //pick up any todos off the queue for this form
            scope.$watchCollection(function () {
                return scope.$$aaFormExtensionsTodos;
              },
              function (val) {

                if (!val) {
                  return;
                }

                for (var i = scope.$$aaFormExtensionsTodos.length - 1; i >= 0; i--) {
                  var todo = scope.$$aaFormExtensionsTodos[i];

                  if (todo.targetFormName === thisForm.$name || (!todo.targetFormName && !thisForm.$aaFormExtensions.$parentForm)) {

                    thisForm.$aaFormExtensions[todo.type].apply(this, todo.args);   //call the func
                    scope.$$aaFormExtensionsTodos.splice(i, 1);                     //remove from queue
                  }
                }
              });

            scope.$on('$destroy', function () {

              //when this form's scope is disposed clean up any references THIS form on parent forms
              //to prevent memory leaks in the case of a ng-if switching out child forms etc.
              var ngModelsToRemove = [];
              if (thisForm.$aaFormExtensions.$parentForm) {
                //collected native form fields (for $allValidationErrors)
                angular.forEach(thisForm, function (fieldVal, fieldName) {
                  if (fieldName.indexOf('$') !== 0) {
                    ngModelsToRemove.push(fieldVal);
                  }
                });

                //remove from parent forms recursively
                recurseForms(thisForm.$aaFormExtensions.$parentForm);
              }

              function recurseForms(form) {

                if (!form.$aaFormExtensions.$allValidationErrors.length) {
                  return;
                }

                //REMOVE this forms fields from $allValidationErrors
                angular.forEach(ngModelsToRemove, function (fieldToRemove) {

                  var valErrorField;

                  for (var i = form.$aaFormExtensions.$allValidationErrors.length; i >= 0, i--;) {
                    valErrorField = form.$aaFormExtensions.$allValidationErrors[i];
                    if (!valErrorField.field || valErrorField.field.$ngModel === fieldToRemove) {
                      form.$aaFormExtensions.$allValidationErrors.splice(i, 1);
                    }
                  }
                });

                //REMOVE this forms reference as being a child form
                aaUtils.arrayRemove(form.$aaFormExtensions.$childForms, thisForm);

                //REMOVE this forms changed dependencies
                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function (dep) {
                  aaUtils.arrayRemove(form.$aaFormExtensions.$changeDependencies, dep);
                  aaUtils.checkAndSetFormChanged(form);
                });

                //next parent
                if (form.$aaFormExtensions.$parentForm) {
                  recurseForms(form.$aaFormExtensions.$parentForm);
                }
              }
            });

            function $addChangeDependency(watchExpr, deepWatch) {
              //start watching in a deferred manner (because some directives like datepickers will actually
              //modify the $modelValue but we DON'T want to track that as page is still initializing)
              $timeout(function () {
                if (deepWatch === undefined) {
                  deepWatch = true; //this yields expected behavior most of the time
                }

                if (!angular.isString(watchExpr)) {
                  throw new Error("$addChangeDependency only supports string watchExprs to allow for form reset support");
                }

                var exists = false;
                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function (dep) {
                  if (watchExpr === dep.expr) {
                    exists = true;
                  }
                });

                if (exists) {
                  return;
                }

                var changedDep = {
                  expr: watchExpr,
                  isChanged: false,
                  initialValue: angular.copy(scope.$eval(watchExpr)),
                  $form: thisForm
                };

                aaUtils.recursivePushChangeDependency(thisForm, changedDep);


                var loadingWatchDeReg;
                //TODO consolidate this pattern onto aaLoadingWatcher it's self
                $timeout(function () {
                  if (aaLoadingWatcher.aaIsLoading) {
                    //delay changed checking until AFTER the form is completely loaded
                    loadingWatchDeReg = scope.$watch(function () {
                      return aaLoadingWatcher.aaIsLoading;
                    }, function (isLoading) {
                      if (!isLoading) {
                        loadingWatchDeReg();
                        $timeout(setupChangedWatch);
                      }
                    });
                  } else {
                    setupChangedWatch();
                  }
                });

                function setupChangedWatch() {
                  scope.$watch(watchExpr, function (val, oldVal) {
                    if (val === oldVal) {
                      return; //first run
                    }
                    changedDep.isChanged = !angular.equals(changedDep.initialValue, val);

                    aaUtils.recursiveParentCheckAndSetFormChanged(thisForm);

                  }, deepWatch);
                }
              });
            }

            function $reset(shouldNotConfirmReset) {

              if(!angular.isFunction(shouldNotConfirmReset) && shouldNotConfirmReset){
                reset();
                return;
              }

              return $q.when(aaFormExtensions.confirmResetStrategy())
                .then(function (resp) {
                  if (resp) {
                    reset();
                  }

                  return resp;
                });

              function reset() {
                if(!scope.$$phase && !scope.$root.$$phase){
                  scope.$apply(reset);
                  return;
                }

                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function (dep) {
                  if (dep.field && dep.field.$ngModel.$modelValue !== dep.initialValue) {
                    dep.field.$ngModel.$setViewValue(dep.initialValue);
                    dep.field.$ngModel.$render();
                    dep.field.showErrorReasons.length = 0;
                    dep.field.$ngModel.$setPristine();
                    (dep.field.$ngModel.$setUntouched || angular.noop)();
                  }

                  if (dep.expr) {
                    //find the scope context that the expression was created on
                    //aka go up the prototype chain until we stop seeing it
                    var currentContext = scope,
                      lastContext = null;

                    while (currentContext.$eval(dep.expr) !== undefined) {
                      lastContext = currentContext;
                      currentContext = currentContext.$parent;
                    }
                    $parse(dep.expr).assign(lastContext, angular.copy(dep.initialValue));
                  }
                });

                $clearErrors();

                //breaking API change, make it hidden, for now
                if(angular.isFunction(shouldNotConfirmReset)) {
                  shouldNotConfirmReset();
                }
              }
            }

            function $resetChanged() {
              if(!scope.$$phase && !scope.$root.$$phase){
                scope.$apply($resetChanged);
                return;
              }

              angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function (dep) {
                dep.isChanged = false;

                if (dep.field) {
                  dep.initialValue = dep.field.$ngModel.$modelValue;
                  aaUtils.checkAndSetFormChanged(dep.field.$form);
                }

                if (dep.expr) {
                  dep.initialValue = angular.copy(scope.$eval(dep.expr));
                  aaUtils.checkAndSetFormChanged(dep.$form);
                }
              });

              aaUtils.checkAndSetFormChanged(thisForm);
            }

            function $clearErrors() {
              if(!scope.$$phase && !scope.$root.$$phase){
                scope.$apply($clearErrors);
                return;
              }

              setAttemptRecursively(thisForm, false);
              thisForm.$setPristine();
              (thisForm.$setUntouched || angular.noop)();

              angular.forEach(thisForm.$aaFormExtensions.$allValidationErrors, function (err) {
                if (err.field) {
                  err.field.showErrorReasons.length = 0;
                  err.field.$element.removeClass('aa-had-focus');
                  err.field.$ngModel.$setPristine();
                  (err.field.$ngModel.$setUntouched || angular.noop)();
                }
              });

              var notifyTargetName = scope.$eval(attrs.notifyTarget) || aaFormExtensions.defaultNotifyTarget;
              angular.forEach(scope.notifications, function (notification) {
                if (notification && notification.template && notification.template === "aaNotifyTemplate-aaFormExtensionsValidationErrors") {
                  aaNotify.remove(notification.messageHandle, notifyTargetName);
                }
              });
            }

            //add a validation error message for field(s)
            //allows for *multiple* fields to share the same validation message
            //allows for casing differences 'fieldName' <-> 'FieldName' for client/server simplicity
            function $addValidationError(messageText, optionalFieldNamesOrFieldReferences /*nullable*/) {

              if (!optionalFieldNamesOrFieldReferences) {
                //this error will just exist but NOT attached to any field
                var error = {
                  message: messageText
                };

                thisForm.$aaFormExtensions.$allValidationErrors.push(error);
                return; //done!
              }

              if (angular.isArray(optionalFieldNamesOrFieldReferences)) {
                //these fields share the same validation message
                var fieldRefs = [],
                  errorKeyName = messageText.replace(/[^a-z0-9]/gi, '-');

                angular.forEach(optionalFieldNamesOrFieldReferences, function (fieldNameOrRef) {
                  fieldRefs.push(getFieldRef(fieldNameOrRef));
                });


                //this removes the model error from ALL fields here when the model
                //on any of them changes
                var listenerFactory = function (ngModel) {

                  var listener = function () {

                    ngModel.$setValidity(errorKeyName, true);

                    //remove all listeners on all fields that exist under this $addValidationError
                    //call
                    //schedule to remove after the stack clears as this is no longer needed
                    //don't remove before because angular is in a loop on $viewChangeListeners
                    $timeout(function () {
                      angular.forEach(fieldRefs, function (ref) {
                        aaUtils.arrayRemove(ref.$ngModel.$viewChangeListeners, listener);
                      });
                    });
                  };

                  return listener;
                };

                angular.forEach(fieldRefs, function (ref) {
                  ref.$addError(messageText, errorKeyName, true);
                  ref.$ngModel.$viewChangeListeners.unshift(listenerFactory(ref.$ngModel));
                });

                //TODO: add this back if multiple messages repeated is bad, not sure how i feel yet...
//                                thisForm.$aaFormExtensions.$multiFieldValidationErrors
//                                    .push({fields: fieldRefs, keyName: errorKeyName});
              } else {
                getFieldRef(optionalFieldNamesOrFieldReferences).$addError(messageText);
              }

              function getFieldRef(fieldNameOrRef) {
                if (angular.isObject(fieldNameOrRef)) {
                  return fieldNameOrRef;
                }

                var ref = thisForm.$aaFormExtensions[fieldNameOrRef];

                if (!ref) {
                  //try to find it removing casing as a variable
                  angular.forEach(thisForm.$aaFormExtensions, function (val, key) {
                    if (key.toLowerCase() === fieldNameOrRef.toLowerCase()) {
                      ref = val;
                    }
                  });
                }

                if (!ref) {
                  throw new Error("Could not find field '" + fieldNameOrRef + "' to add an error to");
                }

                return ref;
              }
            }
          },


          post: function (scope, element, attrs, form) {

            aaFormExtensions.availableForms.push(form);

            element.on('keyup', function (event) {
              if (event.keyCode === 13 &&
                angular.isFunction(form.$aaFormExtensions.$onEnterKey) &&
                event.target.tagName.toUpperCase() !== "TEXTAREA") {
                form.$aaFormExtensions.$onEnterKey();
              }
            });

            //if error notifications are enabled
            //create/destroy notifications as necessary to display form validity
            //only top level forms will display a validation message UNLESS there is a notification
            //target specified on the form
            var notifyHandle = null;
            var customNotifyTarget = scope.$eval(attrs.notifyTarget);
            var notifyTargetName = customNotifyTarget || aaFormExtensions.defaultNotifyTarget;

            if (notifyTargetName && (!form.$aaFormExtensions.$parentForm || customNotifyTarget)) {

              scope.$watchCollection(function () {
                var collection = [];
                angular.forEach(form.$aaFormExtensions.$allValidationErrors, function (val) {
                  collection.push(val);
                });
                collection.push(form.$aaFormExtensions.$invalidAttempt);
                return collection;

              }, function () {

                //should validation errors be displayed?
                var shouldDisplay = form.$aaFormExtensions.$invalidAttempt && form.$invalid;

                //not yet... check to see if any fields have and reasons
                //if there isnt a field then the error must show up
                if (!shouldDisplay) {
                  angular.forEach(form.$aaFormExtensions.$allValidationErrors, function (error) {
                    if (!error.field || error.field.showErrorReasons.length) {
                      shouldDisplay = true;
                    }
                  });
                }

                if (notifyHandle && !shouldDisplay) {
                  //remove the existing notification
                  aaNotify.remove(notifyHandle, notifyTargetName);
                  notifyHandle = null;
                }

                if (!notifyHandle && shouldDisplay) {
                  notifyHandle = aaNotify.add({
                    validationErrorsToDisplay: validationErrorsToDisplay,
                    getValidationTitle: function () {
                      return aaFormExtensions.validationMessages.validationTitle;
                    },
                    onClose: function () {
                      notifyHandle = null; //it'll come back on next error!
                    }
                  }, notifyTargetName, 'aaFormExtensionsValidationErrors');
                }
              });
            }

            function validationErrorsToDisplay() {

              if (form.$aaFormExtensions.$invalidAttempt) {
                //all errors need to be displayed
                return form.$aaFormExtensions.$allValidationErrors;
              } else {

                //only display ones that resulted from a field showErrorReasons
                //if there isn't a field the error must show up
                var toDisplay = [];
                angular.forEach(form.$aaFormExtensions.$allValidationErrors, function (error) {
                  if (!error.field || error.field.showErrorReasons.length) {
                    toDisplay.push(error);
                  }
                });
                return toDisplay;
              }
            }

            scope.$on('$destroy', function () {
              if (notifyHandle) {
                //form is going away, remove associated notifications!
                aaNotify.remove(notifyHandle, notifyTargetName);
              }
              aaUtils.arrayRemove(aaFormExtensions.availableForms, form);
            });
          }
        };
      }
    };
  }

  angular.module('aa.formExtensions')
    //extend Angular form to have $aaFormExtensions and also keep track of the parent form
    .directive('ngForm', ['aaFormExtensions', 'aaNotify', '$parse', '$injector', '$timeout', '$q', 'aaLoadingWatcher', 'aaUtils',
      function (aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher, aaUtils) {
        return aaFormFactory(true, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher, aaUtils);
      }])
    .directive('form', ['aaFormExtensions', 'aaNotify', '$parse', '$injector', '$timeout', '$q', 'aaLoadingWatcher', 'aaUtils',
      function (aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher, aaUtils) {
        return aaFormFactory(false, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher, aaUtils);
      }]);
})();
