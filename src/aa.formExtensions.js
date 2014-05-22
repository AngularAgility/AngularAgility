/*
 * AngularAgility Form Extensions
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2014 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function() {
    'use strict';

	/**
	* @ngdoc overview
	* @name aa.formExtensions
	* @requires aa.notify
	*
	* @description
	* This module contains the form extension directives that are used to easily generate
	* angular form elements.
	*
	* Form extensions is a set of directives that can be used to generate common form
	* elements that typically go together, while still using the power of Angular JS.
	* By specifying a form extensions directive, you can write fewer lines
	* of code and still create fully functional, Angular compatible forms. Because form
	* extensions is powered by Angular, you can also combine Angular ng attributes to override
	* the behaviour of form extensions.
	*
	* Form extensions also supports automatic generation of toaster alerts. Out of the box, form
	* extension directives will tie themselves to $error. When an error does occur (such as a required
	* field not being filled in ), form extensions will automatically pop-up a toast notification alerting
	* the user what field is missing. This, by default, appears in the lower right corner of the view port.
	* The toast also has support for click-able error direction, meaning that the user can click the error
	* message that appears in the toast notification, and the cursor will put itself in the input element
	* with the offending error, even if it is located off screen.
	*
	* Without Form Extensions:
	*
	<pre>
		<div ng-form="exampleForm" class="form-horizontal">
			<div class="form-group">
				<label for="email" class="col-sm-2 control-label">
					Email *
				</label>
				<div class="col-sm-3">
					<input type="email" class="form-control" ng-model="person.email" name="email" id="email" required>
					<div class="validation-error" ng-show="(exampleForm.email.$dirty || invalidSubmitAttempt)&& exampleForm.email.$error.required">
						Email is required.
					</div>
					<div class="validation-error" ng-show="(exampleForm.email.$dirty || invalidSubmitAttempt) && exampleForm.email.$error.email">
						Email must be a valid email address.
					</div>
				</div>
			</div>
			<div class="form-group">
				<label for="firstName" class="col-sm-2 control-label">
					First Name *
				</label>
				<div class="col-sm-3">
					<input type="text" class="form-control" ng-model="person.firstName" name="firstName" id="firstName" required ng-minlength="2" ng-maxlength="30">

					<div class="validation-error" ng-show="(exampleForm.firstName.$dirty || invalidSubmitAttempt) && exampleForm.firstName.$error.required">
						First Name is required.
					</div>
					<div class="validation-error" ng-show="(exampleForm.firstName.$dirty || invalidSubmitAttempt) && exampleForm.firstName.$error.maxlength">
						First name must be less than 30 characters.
					</div>
					<div class="validation-error" ng-show="(exampleForm.firstName.$dirty || invalidSubmitAttempt) && exampleForm.firstName.$error.minlength">
						First Name must be greater than 2 characters.
					</div>
				</div>
			</div>
			<div class="form-group">
				<label for="lastName" class="col-sm-2 control-label">
					Last Name Custom *
				</label>
				<div class="col-sm-3">
					<input type="text" class="form-control" ng-model="person.lastName" name="lastName" id="lastName" required ng-minlength="2" ng-maxlength="30">

					<i ng-show="exampleForm.lastName.$invalid" class="fa fa-exclamation-circle fa-lg"></i>

					<div class="validation-error" ng-show="(exampleForm.lastName.$dirty || invalidSubmitAttempt) && exampleForm.lastName.$error.required">
						Last Name is required.
					</div>
					<div class="validation-error" ng-show="(exampleForm.lastName.$dirty || invalidSubmitAttempt) && exampleForm.lastName.$error.maxlength">
						Last Name must be less than 30 characters.
					</div>
					<div class="validation-error" ng-show="(exampleForm.lastName.$dirty || invalidSubmitAttempt) && exampleForm.lastName.$error.minlength">
						Last Name must be greater than 2 characters.
					</div>
				</div>
			</div>
		</div>
	</pre>
	*
	* With Form Extensions:
	*
	<pre>
		<div ng-form="exampleForm" class="form-horizontal">
			<input type="email" aa-field-group="person.email" required/>
			<input aa-field-group="person.firstName" required ng-minlength="2" ng-maxlength="30"/>
			<input aa-field-group="person.lastName" aa-label="Last Name Custom" required ng-minlength="2" ng-maxlength="30"/>
		</div>
	</pre>
	*
	*/
    angular.module('aa.formExtensions', ['aa.notify'])
        .config(['aaNotifyConfigProvider', '$httpProvider', '$provide', function(aaNotifyConfigProvider, $httpProvider, $provide) {

            //register a notifyConfig to be used by default for displaying validation errors in forms
            //**if this doesn't work for you by all means register a new one with the same key!**
            aaNotifyConfigProvider.addOrUpdateNotifyConfig('aaFormExtensionsValidationErrors', {
                template:
                    '<div class="alert alert-danger aa-form-extensions-validation-errors">' +
                        '<div class="pull-right aa-notify-close" ng-click="close(notification)">' +
                            '<span class="fa-stack fa-lg">' +
                                '<i class="fa fa-circle fa-stack-2x"></i>' +
                                '<i class="fa fa-times fa-stack-1x fa-inverse"></i>' +
                            '</span>' +
                        '</div>' +
                        '<strong>There are some validation errors: </strong>' +
                        '<ul>' +
                            '<li ng-repeat="error in notification.validationErrorsToDisplay()">' +
                                '{{ error.message }}&nbsp;' +
                                '<a href="" title="Focus Field" ng-show="error.field" ng-click="notification.showField(error)"><i class="fa fa-search"></i></a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>',
                options: {
                    ttl: 0, //forever until manually removed by form extensions
                    showField: function(error) {
                        error.field.$element[0].focus();
                    }
                }
            });


            //setup ajax watcher that tracks loading, this is useful by its self
            //and is required for changed tracking
            //NOTE: if you do non Angular AJAX you will need to call increment/decrement yourself
            $provide.factory('aaLoadingWatcher', ['$rootScope', function($rootScope) {
                var pendingRequests = 0;

                var watcher = {
                    isLoading: false,
                    increment: function() {
                        pendingRequests++;
						loadingChanged();
                    },
                    decrement: function() {
                        pendingRequests--;
						loadingChanged();
                    }
                    //perhaps add a 'runWhenDoneLoading' here
                };

                function loadingChanged() {
                    $rootScope.aaIsLoading = watcher.isLoading = pendingRequests > 0;

					if(!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                }

                return watcher;
            }]);

            //tracks JUST ANGULAR http requests.
            $provide.factory('aaAjaxInterceptor', ['aaLoadingWatcher', '$q', 'aaFormExtensions',
                                                    function(aaLoadingWatcher, $q, aaFormExtensions) {
                return {
                    request: function(request) {
                        aaLoadingWatcher.increment();
                        return request;
                    },
                    response: function(response) {
                        aaLoadingWatcher.decrement();
                        return response;
                    },
                    responseError: function(response) {
                        aaLoadingWatcher.decrement();

                        if(aaFormExtensions.ajaxValidationErrorMappingStrategy) {
                            aaFormExtensions.ajaxValidationErrorMappingStrategy(
                                response, aaFormExtensions.availableForms
                            );
                        }

                        return $q.reject(response);
                    }
                };
            }]);
            $httpProvider.interceptors.push('aaAjaxInterceptor');


            //allows for any controller to inject in $aaFormExtensions to *eventually* talk to any form that may show
            //up in the DOM without coupling:
            //
            //broacast doesn't seem to be the best choice here because parent controllers are always created
            //prior to their child forms.  the only other thing I could think of would be to use $timeout to allow
            //the form(s) to init and then a broadcast to run but this would have the issue of REQUIRING
            //this helper to have the controller scope passed in (don't want to broadcast these messages on rootscope
            //because there very well could be other forms that we don't want to accidentally mess with)
            //
            //the below will run on the first child form (or targetFormName matching child form) that appears
            $provide.decorator('$controller', ['$delegate', function($delegate) {
                return function (expression, locals) {
                    if(locals.$scope) {
                        locals.$aaFormExtensions = {

                            $addChangeDependency: function(expr,
                                                           deepWatch, /*optional*/
                                                           targetFormName /*optional*/) {
                                addTodo({
                                    type: '$addChangeDependency',
                                    args: [expr, deepWatch],
                                    targetFormName: targetFormName
                                });
                            },

                            $resetChanged: function(runAfterFunc, /*optional*/
                                                    targetFormName /*optional*/) {
                                addTodo({
                                    type: '$resetChanged',
                                    args: [runAfterFunc],
                                    targetFormName: targetFormName
                                });
                            },

                            $reset: function(runAfterFunc, /*optional*/
                                             targetFormName /*optional*/) {
                                addTodo({
                                    type: '$reset',
                                    args: [runAfterFunc],
                                    targetFormName: targetFormName
                                });
                            },

                            $clearErrors: function(runAfterFunc, /*optional*/
                                                    targetFormName /*optional*/) {
                                addTodo({
                                    type: '$clearErrors',
                                    args: [runAfterFunc],
                                    targetFormName: targetFormName
                                });
                            },

                            $addValidationError: function (messageText,
                                                            optionalFieldNamesOrFieldReferences,
                                                            targetFormName /*optional*/) {
                                addTodo({
                                    type: '$addValidationError',
                                    args: [messageText, optionalFieldNamesOrFieldReferences],
                                    targetFormName: targetFormName
                                });
                            }
                        };
                    }

                    function addTodo(todo) {
                        if(!locals.$scope.$$aaFormExtensionsTodos) {
                            locals.$scope.$$aaFormExtensionsTodos = [];
                        }
                        locals.$scope.$$aaFormExtensionsTodos.push(todo);
                    }

                    return $delegate(expression, locals);
                };
            }]);
        }])

        .directive('aaSubmitForm', ['aaFormExtensions', '$q', function(aaFormExtensions, $q) {
            return {
                scope: {
                    aaSubmitForm: '&'
                },
                restrict: 'A',
                require: '^form',
                link: function(scope, element, attrs, ngForm) {

                    element.on('click', submit);

                    if(attrs.type === 'submit') {
                        //this should be the form's default 'on enter' behavior for submission
                        ngForm.$aaFormExtensions.$onEnterKey = submit;
                    }

                    function submit() {
                        ngForm.$aaFormExtensions.$onSubmitAttempt();

                        if(ngForm.$valid) {

                            var spinnerClickStrategy = aaFormExtensions.spinnerClickStrategies[attrs.spinnerClickStrategy || aaFormExtensions.defaultSpinnerClickStrategy];
                            var eleSpinnerClickStrategy = spinnerClickStrategy(element);
                            eleSpinnerClickStrategy.before();

                            //if this isn't a promise it will resolve immediately
                            $q.when(scope.aaSubmitForm())
                                .finally(function(result) {
                                    eleSpinnerClickStrategy.after();
                                    return result;
                                });
                        }

                        scope.$apply();
                    }
                }
            };
        }])

        //constructs myForm.$aaFormExtensions.myFieldName object
        //including validation messages for all ngModels at form.$aaFormExtensions.
        //messages can be used there manually or emitted automatically with aaValMsg
        .directive('ngModel', ['aaFormExtensions', '$document', 'aaLoadingWatcher', '$timeout', function(aaFormExtensions, $document, aaLoadingWatcher, $timeout) {
            return {
                require: ['ngModel', '?^form'],
                priority: 1,
                link: function(scope, element, attrs, controllers) {
                    var ngModel = controllers[0],
                        ngForm = controllers[1],
                        fieldName = "This field";

                    if(!ngForm || !ngModel.$name) {
                        //only for validation with forms
                        //name is required or else angular form stuff doesn't work
                        return;
                    }

                    ensureaaFormExtensionsFieldExists(ngForm, ngModel.$name);
                    var field = ngForm.$aaFormExtensions[ngModel.$name];
                    field.$form = ngForm;
                    field.$element = element;
                    field.$ngModel = ngModel;
                    field.$calcErrorMessages = calcErrorMessages;
                    field.$addError = addError;

                    if(attrs.aaLabel || attrs.aaFieldName) {
                        //use default label
                        fieldName = attrs.aaLabel || attrs.aaFieldName;

                    } else if(element[0].id) {
                        //is there a label for this field?
                        angular.forEach($document.find('label'), function(label) {
                            if(label.getAttribute("for") === element[0].id) {
                                fieldName = (label.innerHTML || "").replace('*', '').trim();
                            }
                        });
                    }



                    element.on('blur', function() {
                        field.showErrorReasons.push('hadFocus');
                        element.addClass('aa-had-focus');

                        //want to call $apply after current stack clears
                        //if clicking on another element. better way?
                        $timeout(function() {}, 1);
                    });

                    scope.$watch(function() {
                        return ngForm.$aaFormExtensions.$invalidAttempt;
                    }, function(val) {
                        if(val) {
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
						recursivePushChangeDependency(ngForm, fieldChangeDependency);

						// wait for stack to clear before checking
                        //TODO consolidate this pattern onto aaLoadingWatcher it's self
						$timeout(function() {
							if(aaLoadingWatcher.isLoading) {
								//delay changed checking until AFTER the form is completely loaded
								loadingWatchDeReg = scope.$watch(function() {
									return aaLoadingWatcher.isLoading;
								}, function(isLoading) {
									if(!isLoading) {
										loadingWatchDeReg();
                                        $timeout(setupChanged);
									}
								});
							} else {
								setupChanged();
							}
						});

                        scope.$on('$destroy', function() {

                            delete ngForm.$aaFormExtensions[ngModel.$name];

                            clearAndUpdateValidationMessages(ngForm);

                            //clean up any field changed dependencies on parent forms
                            cleanChangeDependencies(ngForm);

                            function cleanChangeDependencies(form) {
                                if(form.$aaFormExtensions.$parentForm) {
                                    cleanChangeDependencies(form.$aaFormExtensions.$parentForm);
                                }

                                arrayRemove(form.$aaFormExtensions.$changeDependencies, fieldChangeDependency);
                                checkAndSetFormChanged(form);
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
                        ngModel.$formatters.push(function(val) {
                            changed();
                            return val;
                        });

                        function changed() {
							if(fieldChangeDependency.initialValue !== fieldChangeDependency.initialValue /*NaN check*/) {
								//Angular initializes fields to NaN before they are 'actually' set.
								//Don't count changes from NaN as they aren't really changes
								fieldChangeDependency.initialValue = ngModel.$modelValue;
							}

							var newIsChanged = fieldChangeDependency.initialValue !== ngModel.$modelValue;
							if(fieldChangeDependency.isChanged !== newIsChanged) {
								fieldChangeDependency.isChanged = newIsChanged;
								recursiveParentCheckAndSetFormChanged(ngForm);
							}
                        }
                    }

                    //any errors that were added with field.$addError
                    //these are custom and dynamically added (often by the server)
                    var addErrorErrors = {};

                    //CALCULATE ERROR MESSAGES
                    //recalculate field errors every time they change
                    scope.$watch(function() {
                        return ngModel.$error;
                    },
                    function(val) {
                        if(val) {
                            field.$calcErrorMessages();
                        }
                    }, true);

                    function calcErrorMessages() {
                        var fieldErrorMessages = field.$errorMessages,
                            msg;

                        //clear out the validation messages that exist on *just the field*
                        fieldErrorMessages.length = 0;

                        for(var key in ngModel.$error) {
                            if(ngModel.$error[key]) {

                                //for each possible validation message check if there is a custom
                                //validation message string on the element otherwise use
                                //the globally registered one or a catchall 'unknown'
                                if(attrs[key + 'Msg']) {
                                    //there is a custom message on the element. it wins
                                    msg = stringFormat(attrs[key + 'Msg'], fieldName, attrs[key]);
                                } else if(key === 'minlength') {
                                    msg = stringFormat(attrs.ngMinlengthMsg || aaFormExtensions.validationMessages.minlength, fieldName, attrs.ngMinlength);
                                } else if(key === 'maxlength') {
                                    msg = stringFormat(attrs.ngMaxlengthMsg || aaFormExtensions.validationMessages.maxlength, fieldName, attrs.ngMaxlength);
                                } else if(key === 'min') {
                                    msg = stringFormat(attrs.minMsg || aaFormExtensions.validationMessages.min, fieldName, attrs.min);
                                } else if(key === 'max') {
                                    msg = stringFormat(attrs.maxMsg || aaFormExtensions.validationMessages.max, fieldName, attrs.max);
                                } else if(key === 'pattern') {
                                    msg = stringFormat(attrs.ngPatternMsg || aaFormExtensions.validationMessages.pattern, fieldName);
                                } else if(key === 'required' && element[0].type === 'number') {
                                    //angular doesn't correctly flag numbers as invalid rather as required when something wrong is filled in
                                    //hack around it
                                    msg = stringFormat(attrs.numberMsg || aaFormExtensions.validationMessages.number, fieldName);
                                } else if(aaFormExtensions.validationMessages[key]) {
                                    //globally registered custom message
                                    msg = stringFormat(aaFormExtensions.validationMessages[key], fieldName);
                                } else if(addErrorErrors[key]) {
                                    msg = addErrorErrors[key];
                                } else {
                                    //unknown what the message should be, use unknown key
                                    msg = stringFormat(aaFormExtensions.validationMessages.unknown, fieldName);
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
                        for(var i = form.$aaFormExtensions.$allValidationErrors.length - 1; i >= 0; i--) {
                            if(form.$aaFormExtensions.$allValidationErrors[i].field === field) {
                                form.$aaFormExtensions.$allValidationErrors.splice(i, 1);
                            }
                        }

                        //add new fields errors if specified
                        if(newErrorMessages) {
                            angular.forEach(newErrorMessages, function(msg) {
                                form.$aaFormExtensions.$allValidationErrors.push({
                                    field: field,
                                    message: msg,
                                    forceDisplay: true
                                });
                            });
                        }

                        //find all forms recursively upward that this field is a child of
                        if(form.$aaFormExtensions.$parentForm) {
                            clearAndUpdateValidationMessages(form.$aaFormExtensions.$parentForm, newErrorMessages);
                        }
                    }

                    //programatically add an error message to a field. a good use case would be adding one from the
                    //server after an unsuccessful submission attempt
                    //message: the message you'd like
                    //optional$errorKeyName: the key name you'd like the add to add the error as to myForm.myField.$errors[optional$errorKeyName]
                    //callerHandledValidStrategy: (OPTIONAL!) if false field will be valid again on next mutation
                    function addError(message, optional$errorKeyName, optionalCallerHandledValidStrategy) {
                        if(!optional$errorKeyName) {
                            optional$errorKeyName = message.replace(/[^a-z0-9]/gi,'-'); //generate a key without spaces
                        }

                        ngModel.$setValidity(optional$errorKeyName, false);
                        addErrorErrors[optional$errorKeyName] = message;
                        field.showErrorReasons.push(optional$errorKeyName);
                        field.$calcErrorMessages();
                        element.addClass('explicit-add-error');

                        if(optionalCallerHandledValidStrategy){
                            return;
                        }

                        var listener = function() {

                            ngModel.$setValidity(optional$errorKeyName, true);

                            //schedule to remove after the stack clears as this is no longer needed
                            //don't remove before because angular is in a loop on $viewChangeListeners
                            $timeout(function() {
                                delete addErrorErrors[optional$errorKeyName];
                                arrayRemove(ngModel.$viewChangeListeners, listener);
                                element.removeClass('explicit-add-error');
                            });
                        };

                        ngModel.$viewChangeListeners.unshift(listener);
                    }
                }
            };
        }])

        //place on an element with ngModel to generate validation messages for it
        //will use the default configured validation message placement strategy unless a custom strategy is passed in
        .directive('aaValMsg', ['$compile', 'aaFormExtensions', function($compile, aaFormExtensions) {
            return {
                require: ['ngModel', '^form'],
                link: function(scope, element, attrs, ctrls) {

                    var form = ctrls[1];

                    //TODO: auto generation of name would be better than an error IMO
                    if(!attrs.name) {
                        throw new Error("In order to use aaValMsg a name MUST be specified on the element: " + element[0]);
                    }

                    var newScope = scope.$new(); //allow strategy to muck with scope in an isolated manner

                    var msgElement = aaFormExtensions.valMsgPlacementStrategies[attrs.aaValMsg || aaFormExtensions.defaultValMsgPlacementStrategy](
                        element, form.$name, attrs.name, newScope
                    );

                    $compile(msgElement)(newScope);
                }
            };
        }])

        //if used directly rather than passively with aaValMsg allows for direct placement of validation messages
        //for a given form field. ex. pass "myForm.myFieldName"
        .directive('aaValMsgFor', ['aaFormExtensions', function(aaFormExtensions) {
            //generate the validation message for a particular form field here
            return {
                require: ['^form'],
                priority: 1,
                scope: true,
                link: function($scope, element, attrs) {

                    var fullFieldPath = attrs.aaValMsgFor,
                        fieldInForm = $scope.$eval(fullFieldPath),
                        formObj = $scope.$eval(fullFieldPath.substring(0, fullFieldPath.indexOf('.')));

                    //TODO: if this is inside an isolate scope and the form is outside the isolate scope this doesn't work
                    //could nest multiple forms so can't trust directive require and have to eval to handle edge cases...
                    ensureaaFormExtensionsFieldExists(formObj, fieldInForm.$name);
                    var fieldInFormExtensions = $scope.$eval(fullFieldPath.replace('.', '.$aaFormExtensions.'));

                    $scope.$watchCollection(
                        function() {
                            return fieldInFormExtensions.$errorMessages;
                        },
                        function(val) {
                            $scope.errorMessages = val;
                        }
                    );

                    $scope.$watch(
                        function() {
                            return [
                                formObj.$aaFormExtensions.$invalidAttempt,
                                fieldInFormExtensions.showErrorReasons
                            ];
                        },
                        function(watches) {
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
        }])

        //generate a label for an input generating an ID for it if it doesn't already exist
        .directive('aaLabel', ['aaFormExtensions', function(aaFormExtensions) {
            return {
                compile: function(element, attrs) {

                    //add default option if specified
                    //if this is a select with a default-option attribute add a default option (per ng spec)
                    if(element.prop('tagName').toUpperCase() === 'SELECT' && attrs.defaultOption !== undefined) {

                        var msg = attrs.defaultOption;

                        if(msg === null || msg === "") {

                            //gen one
                            msg = 'Select';

                            if(attrs.aaLabel) {
                                msg += ' a ' + attrs.aaLabel;
                            }

                            msg += '...';
                        }

                        element.append(angular.element('<option value=""></option>').html(msg));
                    }

                    return function(scope, element, attrs) {
                        var strategy = aaFormExtensions.labelStrategies[attrs.aaLabelStrategy];

                        //this could be a one off strategy on scope. lets try...
                        if(!strategy) {
                            var maybe = scope.$eval(attrs.aaLabelStrategy);
                            if(angular.isFunction(maybe)) {
                                strategy = maybe;
                            }
                        }

                        //use default
                        if(!strategy) {
                            strategy = aaFormExtensions.labelStrategies[aaFormExtensions.defaultLabelStrategy];
                        }

                        var isRequiredField = (attrs.required !== undefined);

                        //auto generate an ID for compliant label names
                        if(!element[0].id) {
                            element[0].id = guid();
                        }

                        strategy(element, attrs.aaLabel, isRequiredField);
                    };
                }
            };
        }])

        .directive('aaField', ['$compile', function($compile) {
            return {
                restrict: 'A',
                scope: false,
                replace: true,
                priority: 1000,
                terminal: true,
                compile: function(element, attrs) {

                    //use the passed value for ng-model
                    element.attr("ng-model", attrs.aaField);

                    var lastPartOfName = attrs.aaField.substring(attrs.aaField.lastIndexOf('.') + 1);

                    //if no name set calc one
                    if(!attrs.name) {
                        element.attr("name", lastPartOfName);
                    }

                    //assume input type="text" (which a browser will do but many libraries ex. boostrap have styling that requires it)
                    if(!attrs.type && element.prop('tagName').toUpperCase() === 'INPUT') {
                        element.prop('type', 'text');
                    }

                    //if no label and "no-label" don't calc one
                    if(!attrs.aaLabel && attrs.noLabel === undefined) {

                        //remove trailing "Id". Usually a label isn't "PersonId" it's Person
                        if(lastPartOfName.lastIndexOf('Id') === lastPartOfName.length - 2) {
                            lastPartOfName = lastPartOfName.substring(0, lastPartOfName.length - 2);
                        }

                        element.attr('aa-label', toTitleCase(splitCamelCase(lastPartOfName)));
                    }

                    element.attr("aa-val-msg", "");

                    element.removeAttr('aa-field');

                    element.replaceWith(outerHTML(element[0]));

                    return function(scope, element) {
                        $compile(element)(scope);
                    };
                }
            };
        }])

        .directive('aaFieldGroup', ['$compile', 'aaFormExtensions', function($compile, aaFormExtensions) {
            return {
                restrict: 'A',
                scope: false,
                replace: true,
                priority: 1100,
                terminal: true,
                compile: function(element, attrs) {

                    element.removeAttr('aa-field-group');
                    element.attr("aa-field", attrs.aaFieldGroup);

                    var strat = aaFormExtensions.fieldGroupStrategies[attrs.aaFieldGroupStrategy || aaFormExtensions.defaultFieldGroupStrategy];
                    strat(element);

                    return function(scope, element) {
                        $compile(element)(scope);
                    };
                }
            };
        }])

        .directive('aaValidIcon', ['aaFormExtensions', function(aaFormExtensions) {
            return {
                require: 'ngModel',
                scope: false,
                compile: function(element) {
                    var container = aaFormExtensions.validIconStrategy.getContainer(element);

                    var validIcon = angular.element(aaFormExtensions.validIconStrategy.validIcon);
                    container.append(validIcon);
                    validIcon[0].style.display = 'none';

                    var invalidIcon = angular.element(aaFormExtensions.validIconStrategy.invalidIcon);
                    container.append(invalidIcon);
                    invalidIcon[0].style.display = 'none';

                    return function(scope, element, attrs, ngModel) {
                        ngModel.$parsers.push(function(val) {

                            if(ngModel.$valid) {
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
        }])

        //perform an ng-click that watches for a $q promise
        //showing a loading indicator using the default spinnerClickStrategy
        //or a specified (inline on the directive) spinner-click-strategy="myStrategy"
        .directive('aaSpinnerClick', ['$q', 'aaFormExtensions', function($q, aaFormExtensions) {
            return {
                link: function(scope, element, attrs) {

                    var strategy = aaFormExtensions.spinnerClickStrategies[attrs.spinnerClickStrategy || aaFormExtensions.defaultSpinnerClickStrategy];

                    if(!strategy) {
                        throw new Error("An inline or default spinner click strategy must be specified");
                    }

                    element.on('click', function() {
                        scope.$apply(function() {

                            var elementStrategy = strategy(element);

                            elementStrategy.before();

                            //if this isn't a promise it will resolve immediately
                            $q.when(scope.$eval(attrs.aaSpinnerClick))
                                .then(function(result) {
                                    elementStrategy.after();
                                    return result;
                                });
                        });
                    });
                }
            };
        }])

        //extend Angular form to have $aaFormExtensions and also keep track of the parent form
        .directive('ngForm', ['aaFormExtensions', 'aaNotify', '$parse', '$injector', '$timeout', '$q', 'aaLoadingWatcher',
            function(aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher) {
                return aaFormFactory(true, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher);
            }])
        .directive('form', ['aaFormExtensions', 'aaNotify', '$parse', '$injector', '$timeout', '$q', 'aaLoadingWatcher',
            function(aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher) {
                return aaFormFactory(false, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher);
            }])

        .provider('aaFormExtensions', function() {

            var self = this;

            //LABEL STRATEGIES
            this.defaultLabelStrategy = "default";
            this.labelStrategies = {

                //create a bootstrap3 style label
                bootstrap3InlineForm: function(ele, labelText, isRequired) {

                    var label = angular.element('<label>')
                        .attr('for', ele[0].id)
                        .addClass('col-sm-2 control-label')
                        .html(labelText + (isRequired ? ' *' : ''));


                    var unsupported = [
                        'button',
                        'submit'
                    ];

                    if(unsupported.indexOf(ele[0].type) !== -1) {
                        throw new Error("Generating a label for and input type " + ele[0].type + " is unsupported.");
                    }

                    ele.parent().parent().prepend(label);
                },

                //create a no-frills label directly before the element
                'default': function(ele, labelText, isRequired) {
                    ele[0].parentNode.insertBefore(
                        angular.element('<label>')
                            .attr('for', ele[0].id)
                            .html(labelText + (isRequired ? ' *' : ''))[0],
                        ele[0]);
                }

                //add you own here using registerLabelStrategy
            };


            //AUTO FIELD GROUP STRATEGIES
            this.defaultFieldGroupStrategy = "bootstrap3InlineForm";
            this.fieldGroupStrategies = {
                bootstrap3InlineForm: function(element) {

                    //add form-control if it is missing
                    if(!element.prop('class')) {
                        element.addClass('form-control');
                    }

                    element.wrap('<div class="form-group"><div class="col-sm-3"></div></div>');
                },
                bootstrap3BasicFormWithSize: function(element) {

                    //add form-control if it is missing
                    if(!element.prop('class')) {
                        element.addClass('form-control');
                    }

                    var col = element.attr('aa-col') || "sm-3";

                    element.wrap('<div class="form-group col-' + col + '"></div>');
                }
            };


            //VALIDATION MESSAGE PLACEMENT STRATEGIES
            this.defaultValMsgPlacementStrategy = 'below-field';
            this.valMsgPlacementStrategies = {

                'below-field': function(formFieldElement, formName, formFieldName) {

                    var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}"></div>', formName, formFieldName));
                    var fieldType = formFieldElement[0].type;
                    fieldType = fieldType ? fieldType.toLowerCase() : 'text';

                    if(fieldType === 'radio') {
                        //radios tend to be wrapped, go up a few levels (of course you can customize this with your own strategy)
                        formFieldElement.parent().parent().append(msgElement);

                    } else {
                        formFieldElement.after(msgElement);
                    }

                    return msgElement;
                },

                'hover': function(formFieldElement, formName, formFieldName, scope) {
                    var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}" ng-show="showMessages && isHovered && errorMessages.length > 0"></div>', formName, formFieldName));

                    formFieldElement.on('mouseenter', function() {
                        scope.isHovered = true;
                        scope.$apply();
                    });

                    formFieldElement.on('mouseleave', function() {
                        scope.isHovered = false;
                        scope.$apply();
                    });

                    formFieldElement.after(msgElement);

                    return msgElement;
                }
            };


            //VALID ICON STRATEGIES
            this.validIconStrategy = {
                validIcon: '<i class="fa fa-check fa-lg"></i>',
                invalidIcon: '<i class="fa fa-exclamation-circle fa-lg"></i>',
                getContainer: function(element) {
                    var ele = angular.element('<div class="col-xs-1 validation-icons"></div>');
                    element.parent().after(ele);
                    return ele;
                }
            };

            //aaSpinnerClick strategies
            this.defaultSpinnerClickStrategy = "fontAwesomeInsideButton";
            this.spinnerClickStrategies = {
                fontAwesomeInsideButton: function(buttonElement) {

                    var loading = angular.element('<i style="margin-left: 5px;" class="fa fa-spinner fa-spin"></i>');

                    return {
                        before: function() {
                            buttonElement.prop("disabled", true);
                            buttonElement.append(loading);
                        },
                        after: function() {
                            buttonElement.prop("disabled", false);
                            loading.remove();
                        }
                    };
                }
            };


            //NOTIFY TARGET
            //set to false to disable notifications for all forms unless explicitly overridden on the form
            this.defaultNotifyTarget = "default";

            //ON NAVIGATE AWAY STRATEGIES
            //detect navigate away and handle it. UI Router / native DOM is handled by default
            this.defaultOnNavigateAwayStrategy = 'confirmUiRouterAndDom';
            this.onNavigateAwayStrategies = {

                //VERY basic. For the love of everything holy please do something better with UI Bootstrap modal or something!
                //requires >= v0.2.10!
                confirmUiRouterAndDom: function(rootFormScope, rootForm, $injector) {

                    //ANGULAR UI ROUTER
                    var onDereg = rootFormScope.$on('$stateChangeStart', function(event, toState, toParams){

                        if(rootForm.$aaFormExtensions.$changed) {
							if(!toState.aaUnsavedPrompted) {
								event.preventDefault();
								if(window.confirm('You have unsaved changes are you sure you want to navigate away?')) {
									//should be able to use options { notify: false } on UI Router
									//but that doesn't seem to work right (new state never loads!) so this is a workaround
									toState.aaUnsavedPrompted = true;
									$injector.get('$state').go(toState.name, toParams);
								}
							}
                        }
                    });

                    //NATIVE DOM IE9+
                    function beforeUnload(e) {
                        if(rootForm.$aaFormExtensions.$changed) {
                            var confirmationMessage = 'You have unsaved changes are you sure you want to navigate away?';
                            (e || window.event).returnValue = confirmationMessage;
                            return confirmationMessage;
                        }
                    }

                    window.addEventListener('beforeunload', beforeUnload);

                    rootFormScope.$on('$destroy', function() {
                        onDereg();
                        window.removeEventListener('beforeunload', beforeUnload);
                    });

                },
                none: angular.noop
            };


            //VALIDATION MESSAGES
            this.validationMessages = {
                required: "{0} is required.",
                email: "The field {0} must be an email.",
                minlength: "{0} must be at least {1} character(s).",
                maxlength: "{0} must be less than {1} characters.",
                min: "{0} must be at least {1}.",
                max: "{0} must be at most {1}.",
                pattern: "{0} is invalid.",
                url: "{0} must be a valid URL.",
                number: "{0} must be number.",
                unknown: "{0} is invalid."
            };

            this.valMsgForTemplate = '<div class="validation-errors">' +
                                        '<div class="validation-error" ng-show="showMessages" ng-repeat="msg in errorMessages">{{msg}}</div>' +
                                        '<div class="notch notch-border"></div>' +
                                        '<div class="notch"></div>' +
                                     '</div>';


            this.confirmResetStrategy = function() {
                //this can be a promise or immediate like below
                return window.confirm('Are you sure you want to reset any unsaved changes?');
            };

            this.ajaxValidationErrorMappingStrategy = function(response, availableForms) {
                //The below is a example of how to map server side validation errors back to client form fields. That
                //fully supports multiple fields with the same validation error. As most server stuff is done differently
                //you will probably need to define your own mapping strategy. Null this out to disable it.
                //example server resp
                //{
                //    errors:[
                //        {
                //            fieldNames: ['firstName', 'lastName'],
                //            errorMessage: 'John Culviner already exists!'
                //        }
                //    ]
                //}

                if(response.status !== 400 || !response.data.errors) {
                    return; //NOT bad request, a validation error or there aren't any errors to push
                }

                //for each of the error(s) indicated find the form with the correct fields and push the validation
                //error to it
                angular.forEach(response.data.errors, function(error) {
                    angular.forEach(availableForms, function(form) {
                        var containsAllFields = true;
                        angular.forEach(error.fieldNames, function(fieldName) {
                            if(!form[fieldName]) {
                                containsAllFields = false;
                            }
                        });

                        if(containsAllFields) {
                            form.$aaFormExtensions.$addValidationError(error.errorMessage, error.fieldNames);
                        }
                    });
                });
            };

            //todo wire up
            this.globalSettings = {
                messageOnBlur: true
            };

            this.$get = function() {
                return {

                    defaultLabelStrategy: self.defaultLabelStrategy,
                    labelStrategies: self.labelStrategies,

                    defaultFieldGroupStrategy: self.defaultFieldGroupStrategy,
                    fieldGroupStrategies: self.fieldGroupStrategies,

                    validIconStrategy: self.validIconStrategy,
                    validationMessages: self.validationMessages,

                    valMsgForTemplate: self.valMsgForTemplate,

                    valMsgPlacementStrategies: self.valMsgPlacementStrategies,

                    defaultValMsgPlacementStrategy: self.defaultValMsgPlacementStrategy,

                    defaultSpinnerClickStrategy: self.defaultSpinnerClickStrategy,
                    spinnerClickStrategies: self.spinnerClickStrategies,

                    defaultOnNavigateAwayStrategy: self.defaultOnNavigateAwayStrategy,
                    onNavigateAwayStrategies: self.onNavigateAwayStrategies,

                    defaultNotifyTarget: self.defaultNotifyTarget,

                    confirmResetStrategy: self.confirmResetStrategy,

                    ajaxValidationErrorMappingStrategy: self.ajaxValidationErrorMappingStrategy,
                    availableForms: [], //all available ngForms in the application that could have errors *right now*

                    //todo wire up
                    globalSettings: self.globalSettings
                };
            };
        });

    //utility
    function guid() {
        /*jshint bitwise: false*/
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function splitCamelCase(str) {
        return str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    }

    function outerHTML(node) {
        // if IE, Chrome take the internal method otherwise build one
        return node.outerHTML || (function(n) {
            var div = document.createElement('div'), h;
            div.appendChild(n.cloneNode(true));
            h = div.innerHTML;
            div = null;
            return h;
        })(node);
    }

    function stringFormat(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    }

    function ensureaaFormExtensionsFieldExists(form, fieldName) {
        if(!form.$aaFormExtensions[fieldName]) {
            form.$aaFormExtensions[fieldName] = {
                showErrorReasons: [],
                $errorMessages: [],
                $element: null
            };
        }
    }

    function arrayRemove(array, item) {
        if(!array || !item ) {
            return;
        }

        var idx = array.indexOf(item);

        if(idx !== -1) {
            array.splice(idx, 1);
        }
    }

    //all parent forms need to know about a changed dependency, crawl up the graph to distribute to all of them
    function recursivePushChangeDependency(form, dep) {
        form.$aaFormExtensions.$changeDependencies.push(dep);

        if(form.$aaFormExtensions.$parentForm) {
            recursivePushChangeDependency(form.$aaFormExtensions.$parentForm, dep);
        }
    }

    //call after changed has changed
    //recursively check this and each parent form for changed fields. set the form (and parent forms)
    //changed indicator accordingly
    function recursiveParentCheckAndSetFormChanged(form) {

        checkAndSetFormChanged(form);

        if(form.$aaFormExtensions.$parentForm) {
            recursiveParentCheckAndSetFormChanged(form.$aaFormExtensions.$parentForm);
        }
    }

    //checks if a given form has any changes based on it's change dependencies
    function checkAndSetFormChanged(form) {
        var hasAnyChangedField = false;

        angular.forEach(form.$aaFormExtensions.$changeDependencies, function(dep) {
            if(dep.isChanged) {
                hasAnyChangedField = true;
            }
        });

        form.$aaFormExtensions.$changed = hasAnyChangedField;
    }


    function aaFormFactory(isNgForm, aaFormExtensions, aaNotify, $parse, $injector, $timeout, $q, aaLoadingWatcher) {
        return {
            restrict: isNgForm ? 'EAC' : 'E',
            require: 'form',
            compile: function() {
                return {
                    pre: function(scope, element, attrs, thisForm) {

                        //have to manually find parent forms '?^form' doesn't appear to work in this case (as it is very funky)
                        var parentForm = element.parent().controller('form');

                        thisForm.$aaFormExtensions = {
                            $onSubmitAttempt: function() {
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

//                            $multiFieldValidationErrors: [] //todo: add this back if multiple messages repeated is bad
                        };

                        if(parentForm) {
                            parentForm.$aaFormExtensions.$childForms.push(thisForm);
                        }

                        //only root forms get the opportunity to block router state changes
                        //add option to disable confirmation messages e.g. after form submit user redirection
                        if(!parentForm  && attrs.aaConfirmationMessage !== "false") {
                            var strategy = aaFormExtensions.onNavigateAwayStrategies[attrs.onNavigateAwayStrategy || aaFormExtensions.defaultOnNavigateAwayStrategy ];
                            if(angular.isFunction(strategy)) {
                                strategy(scope, thisForm, $injector);
                            }
                        }


                        function setAttemptRecursively(form, isInvalid) {
                            form.$aaFormExtensions.$invalidAttempt = isInvalid;

                            angular.forEach(form.$aaFormExtensions.$childForms, function(childForm) {
                                setAttemptRecursively(childForm, isInvalid);
                            });
                        }


                        //pick up any todos off the queue for this form
                        scope.$watchCollection(function() {
							return scope.$$aaFormExtensionsTodos;
						},
						function(val) {

                            if(!val) {
                                return;
                            }

							for(var i = scope.$$aaFormExtensionsTodos.length - 1; i >= 0; i--)
							{
								var todo = scope.$$aaFormExtensionsTodos[i];

								if(todo.targetFormName === thisForm.$name || (!todo.targetFormName && !thisForm.$aaFormExtensions.$parentForm)) {

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
                                        if (valErrorField.field.$ngModel === fieldToRemove) {
                                            form.$aaFormExtensions.$allValidationErrors.splice(i, 1);
                                        }
                                    }
                                });

                                //REMOVE this forms reference as being a child form
                                arrayRemove(form.$aaFormExtensions.$childForms, thisForm);

                                //REMOVE this forms changed dependencies
                                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function (dep) {
                                    arrayRemove(form.$aaFormExtensions.$changeDependencies, dep);
                                    checkAndSetFormChanged(form);
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
                            $timeout(function() {
                                if(deepWatch === undefined) {
                                    deepWatch = true; //this yields expected behavior most of the time
                                }

                                if(!angular.isString(watchExpr)) {
                                    throw new Error("$addChangeDependency only supports string watchExprs to allow for form reset support");
                                }

                                var exists = false;
                                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function(dep) {
                                    if(watchExpr === dep.expr) {
                                        exists = true;
                                    }
                                });

                                if(exists) {
                                    return;
                                }

                                var changedDep = {
                                    expr: watchExpr,
                                    isChanged: false,
                                    initialValue: angular.copy(scope.$eval(watchExpr)),
                                    $form: thisForm
                                };

                                recursivePushChangeDependency(thisForm, changedDep);


                                var loadingWatchDeReg;
                                //TODO consolidate this pattern onto aaLoadingWatcher it's self
                                $timeout(function() {
                                    if(aaLoadingWatcher.aaIsLoading) {
                                        //delay changed checking until AFTER the form is completely loaded
                                        loadingWatchDeReg = scope.$watch(function() {
                                            return aaLoadingWatcher.aaIsLoading;
                                        }, function(isLoading) {
                                            if(!isLoading) {
                                                loadingWatchDeReg();
                                                $timeout(setupChangedWatch);
                                            }
                                        });
                                    } else {
                                        setupChangedWatch();
                                    }
                                });

                                function setupChangedWatch() {
                                    scope.$watch(watchExpr, function(val, oldVal) {
                                        if(val === oldVal){
                                            return; //first run
                                        }
                                        changedDep.isChanged = !angular.equals(changedDep.initialValue, val);

                                        recursiveParentCheckAndSetFormChanged(thisForm);

                                    }, deepWatch);
                                }
                            });
                        }

                        function $reset(runAfterFunc) {

                            return $q.when(aaFormExtensions.confirmResetStrategy())
                                .then(function(resp) {
                                    if(resp) {
                                        reset();
                                    }

                                    return resp;
                                });

                            function reset() {
                                angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function(dep) {
                                    if(dep.field && dep.field.$ngModel.$modelValue !== dep.initialValue) {
                                        dep.field.$ngModel.$setViewValue(dep.initialValue);
                                        dep.field.$ngModel.$render();
                                    }

                                    if(dep.expr) {
                                        //find the scope context that the expression was created on
                                        //aka go up the prototype chain until we stop seeing it
                                        var currentContext = scope,
                                            lastContext = null;

                                        while(currentContext.$eval(dep.expr) !== undefined) {
                                            lastContext = currentContext;
                                            currentContext = currentContext.$parent;
                                        }
                                        $parse(dep.expr).assign(lastContext, angular.copy(dep.initialValue));
                                    }
                                });

                                $clearErrors(runAfterFunc);
                            }
                        }

                        function $resetChanged(runAfterFunc) {
                            //schedule reset to run AFTER any ng-model binds may occur (after current stack frame)
							$timeout(function() {
								angular.forEach(thisForm.$aaFormExtensions.$changeDependencies, function(dep) {
									dep.isChanged = false;

									if(dep.field) {
										dep.initialValue = dep.field.$ngModel.$modelValue;
										checkAndSetFormChanged(dep.field.$form);
									}

									if(dep.expr) {
										dep.initialValue = angular.copy(scope.$eval(dep.expr));
										checkAndSetFormChanged(dep.$form);
									}
								});

								checkAndSetFormChanged(thisForm);

                                if(angular.isFunction(runAfterFunc)) {
                                    runAfterFunc();
                                }
							});
                        }

                        function $clearErrors(runAfterFunc) {
                            //this should be able to use $evalAsync, figure it out...
                            $timeout(function() {
                                setAttemptRecursively(thisForm, false);

                                angular.forEach(thisForm.$aaFormExtensions.$allValidationErrors, function(err) {
                                    if(err.field) {
                                        err.field.showErrorReasons.length = 0;
                                        err.field.$element.removeClass('aa-had-focus');
                                        //this makes sense i think, maybe make configurable
                                        err.field.$ngModel.$setPristine();
                                    }
                                });

                                if(angular.isFunction(runAfterFunc)) {
                                    runAfterFunc();
                                }
                            });
                        }

                        //add a validation error message for field(s)
                        //allows for *multiple* fields to share the same validation message
                        //allows for casing differences 'fieldName' <-> 'FieldName' for client/server simplicity
                        function $addValidationError(messageText, optionalFieldNamesOrFieldReferences /*nullable*/) {

                            if(!optionalFieldNamesOrFieldReferences) {
                                //this error will just exist but NOT attached to any field
                                var error = {
                                    message: messageText,
                                    forceDisplay: true
                                };

                                thisForm.$aaFormExtensions.$allValidationErrors.push(error);
                                return; //done!
                            }

                            if(angular.isArray(optionalFieldNamesOrFieldReferences)) {
                                //these fields share the same validation message
                                var fieldRefs = [],
                                    errorKeyName = messageText.replace(/[^a-z0-9]/gi,'-');

                                angular.forEach(optionalFieldNamesOrFieldReferences, function(fieldNameOrRef) {
                                    fieldRefs.push(getFieldRef(fieldNameOrRef));
                                });


                                //this removes the model error from ALL fields here when the model
                                //on any of them changes
                                var listenerFactory = function(ngModel) {

                                    var listener = function() {

                                        ngModel.$setValidity(errorKeyName, true);

                                        //remove all listeners on all fields that exist under this $addValidationError
                                        //call
                                        //schedule to remove after the stack clears as this is no longer needed
                                        //don't remove before because angular is in a loop on $viewChangeListeners
                                        $timeout(function() {
                                            angular.forEach(fieldRefs, function(ref) {
                                                arrayRemove(ref.$ngModel.$viewChangeListeners, listener);
                                            });
                                        });
                                    };

                                    return listener;
                                };

                                angular.forEach(fieldRefs, function(ref) {
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
                                if(angular.isObject(fieldNameOrRef)) {
                                    return fieldNameOrRef;
                                }

                                var ref = thisForm.$aaFormExtensions[fieldNameOrRef];

                                if(!ref) {
                                    //try to find it removing casing as a variable
                                    angular.forEach(thisForm.$aaFormExtensions, function(val,key) {
                                        if(key.toLowerCase() === fieldNameOrRef.toLowerCase()) {
                                            ref = val;
                                        }
                                    });
                                }

                                if(!ref) {
                                    throw new Error("Could not find field '" + fieldNameOrRef + "' to add an error to");
                                }

                                return ref;
                            }
                        }
                    },


                    post: function(scope, element, attrs, form) {

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

                        if(notifyTargetName && (!form.$aaFormExtensions.$parentForm || customNotifyTarget)) {

                            scope.$watch(function() {
                                return angular.toJson([ //possible perf issue but what is the alternative?
                                    form.$aaFormExtensions.$allValidationErrors,
                                    form.$aaFormExtensions.$invalidAttempt
                                ]);
                            }, function() {

                                //should validation errors be displayed?
                                var shouldDisplay = form.$aaFormExtensions.$invalidAttempt && form.$invalid;

                                //not yet... check to see if any fields have and reasons
                                if(!shouldDisplay) {
                                    angular.forEach(form.$aaFormExtensions.$allValidationErrors, function(error) {
                                        if(error.field.showErrorReasons.length) {
                                            shouldDisplay = true;
                                        }
                                    });
                                }

                                if(notifyHandle && !shouldDisplay) {
                                    //remove the existing notification
                                    aaNotify.remove(notifyHandle, notifyTargetName);
                                    notifyHandle = null;
                                }

                                if(!notifyHandle && shouldDisplay) {
                                    notifyHandle = aaNotify.add({
                                        validationErrorsToDisplay: validationErrorsToDisplay,
                                        onClose: function() {
                                            notifyHandle = null; //it'll come back on next error!
                                        }
                                    }, notifyTargetName, 'aaFormExtensionsValidationErrors');
                                }
                            });
                        }

                        function validationErrorsToDisplay() {

                            if(form.$aaFormExtensions.$invalidAttempt) {
                                //all errors need to be displayed
                                return form.$aaFormExtensions.$allValidationErrors;
                            } else {

                                //only display ones that resulted from a field showErrorReasons or forceDisplay
                                var toDisplay = [];
                                angular.forEach(form.$aaFormExtensions.$allValidationErrors, function(error) {
                                    if(error.field.showErrorReasons.length) {
                                        toDisplay.push(error);
                                    }
                                });
                                return toDisplay;
                            }
                        }

                        scope.$on('$destroy', function() {
                            if(notifyHandle) {
                                //form is going away, remove associated notifications!
                                aaNotify.remove(notifyHandle, notifyTargetName);
                            }
                            arrayRemove(aaFormExtensions.availableForms, form);
                        });
                    }
                };
            }
        };
    }
})();
