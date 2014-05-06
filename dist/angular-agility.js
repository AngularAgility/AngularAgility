/*! angular-agility v0.8.1 @ 2014-05-05T22:51:15 */

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
                        '<strong>The following fields have validation errors: </strong>' +
                        '<ul>' +
                            '<li ng-repeat="error in notification.validationErrorsToDisplay()">' +
                                '{{ error.message }}&nbsp;' +
                                '<a href="" title="Focus Field" ng-click="notification.showField(error)"><i class="fa fa-search"></i></a>' +
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
            $provide.factory('aaAjaxInterceptor', ['aaLoadingWatcher', '$q', function(aaLoadingWatcher, $q) {
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

                    field.$element = element;
                    field.$ngModel = ngModel;
                    field.$form = ngForm;

                    element.on('blur', function() {
                        field.hadFocus = true;
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



                    //CALCULATE ERROR MESSAGES
                    //recalculate field errors every time they change
                    scope.$watch(function() {
                        return ngModel.$error;
                    },
                    function(val) {
                        if(val) {
                            calcErrorMessages();
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
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'minlength') {
                                    msg = stringFormat(attrs.ngMinlengthMsg || aaFormExtensions.validationMessages.minlength, fieldName, attrs.ngMinlength);
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'maxlength') {
                                    msg = stringFormat(attrs.ngMaxlengthMsg || aaFormExtensions.validationMessages.maxlength, fieldName, attrs.ngMaxlength);
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'min') {
                                    msg = stringFormat(attrs.minMsg || aaFormExtensions.validationMessages.min, fieldName, attrs.min);
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'max') {
                                    msg = stringFormat(attrs.maxMsg || aaFormExtensions.validationMessages.max, fieldName, attrs.max);
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'pattern') {
                                    msg = stringFormat(attrs.ngPatternMsg || aaFormExtensions.validationMessages.pattern, fieldName);
                                    fieldErrorMessages.push(msg);
                                } else if(key === 'required' && element[0].type === 'number') {
                                    //angular doesn't correctly flag numbers as invalid rather as required when something wrong is filled in
                                    //hack around it
                                    msg = stringFormat(attrs.numberMsg || aaFormExtensions.validationMessages.number, fieldName);
                                    fieldErrorMessages.push(msg);
                                } else if(aaFormExtensions.validationMessages[key]) {
                                    //globally registered custom message
                                    msg = stringFormat(aaFormExtensions.validationMessages[key], fieldName);
                                    fieldErrorMessages.push(msg);
                                } else {
                                    //unknown what the message should be, use unknown key
                                    msg = stringFormat(aaFormExtensions.validationMessages.unknown, fieldName);
                                    fieldErrorMessages.push(msg);
                                }
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
                                    message: msg
                                });
                            });
                        }

                        //find all forms recursively upward that this field is a child of
                        if(form.$aaFormExtensions.$parentForm) {
                            clearAndUpdateValidationMessages(form.$aaFormExtensions.$parentForm, newErrorMessages);
                        }
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

                    $scope.$watchCollection(
                        function() {
                            return [
                                formObj.$aaFormExtensions.$invalidAttempt,
                                fieldInFormExtensions.hadFocus
                            ];
                        },
                        function(watches) {
                            var invalidAttempt = watches[0],
                                hadFocus = watches[1];

                            $scope.showMessages = invalidAttempt || hadFocus;
                        }
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
                    function beforeUnload() {
                        if(rootForm.$aaFormExtensions.$changed) {
                            return 'You have unsaved changes are you sure you want to navigate away?';
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
                hadFocus: false,
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
                            $clearErrors: $clearErrors
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

                            $q.when(aaFormExtensions.confirmResetStrategy())
                                .then(function(resp) {
                                    if(resp) {
                                        reset();
                                    }
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
                                    err.field.hadFocus = false;
                                    err.field.$element.removeClass('aa-had-focus');
                                    //this makes sense i think, maybe make configurable
                                    err.field.$ngModel.$setPristine();
                                });

                                if(angular.isFunction(runAfterFunc)) {
                                    runAfterFunc();
                                }
                            });
                        }
                    },




                    post: function(scope, element, attrs, form) {

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
                                //only display if the field had had focus or an invalid submit attempt occured
                                var shouldDisplay = form.$aaFormExtensions.$invalidAttempt && form.$invalid;

                                if(!shouldDisplay) {
                                    //any fields have focus?
                                    angular.forEach(form.$aaFormExtensions.$allValidationErrors, function(error) {
                                        if(error.field.hadFocus) {
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

                                //only display ones that resulted from a hadFocus
                                var toDisplay = [];
                                angular.forEach(form.$aaFormExtensions.$allValidationErrors, function(error) {
                                    if(error.field.hadFocus) {
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
                        });
                    }
                };
            }
        };
    }
})();
;/*
 * AngularAgility Form External Validation Configuration
 *
 * https://github.com/AngularAgility/AngularAgility
 *
 * Copyright (c) 2014 - Roland Zwaga
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function() {
    /**
     * @ngdoc overview
     * @name aa.formExternalConfiguration
     *
     * @description
     * This module contains the form extension directives that are used to easily generate
     * angular form elements using an external configuration.
     *
     * Instead of defining all the validation specs directly in the markup, these specs
     * can be passed to the aaConfiguredForm directive as a regular JavaScript object.
     *
     * This approach allows you to have the validation data to be retrieved from a server,
     * for example.
     * Also, when different kinds of form layouts/visualisations exist for the same data
     * across an application, this approach might save a bunch of markup typing.
     *
     * The configuration object has an interface like this:
     * var formconfig = {
    *   validations:Object,
    *   globals?:Object,
    *   resolve?:Object,
    *   resolveFn?:Function
    * }
     *
     * A simple configuration looks like this:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
       scope.user = {
           name:'Test1',
       };
       scope.formconfig = {
           validations: {
               user:{
                   name: {
                       'ng-minlength':8,
                       required:true
                   },
               }
           }
       };
    }]);
     </script>
     <div ng-controller="main">
     <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
     <input type="text" ng-model="user.name" />
     </div>
     </div>
     </pre>
     *
     * If there are validation specs you need to add to all applicable inputs, add a globals
     * property:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
       scope.user = {
           name:'Test1',
       };
       scope.formconfig = {
           globals: {
               'aa-valid-icon':''
           },
           validations: {
               user:{
                   name: {
                       'ng-minlength':8,
                       required:true
                   },
               }
           }
       };
    }]);
     </script>
     <div ng-controller="main">
     <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
     <input type="text" ng-model="user.name" />
     </div>
     </div>
     </pre>
     *
     * If the scope name doesn't match the validation name for some reason,
     * add a resolve property to the config like this:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
        scope.user = {
           name:'Test1',
        };
        scope.formconfig = {
           resolve: {
               user:'UserType'
           },
           validations: {
               'UserType':{
                   name: {
                       'ng-minlength':8,
                       required:true
                   },
               }
           }
        };
    }]);
     </script>
     <div ng-controller="main">
     <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
     <input type="text" ng-model="user.name" />
     </div>
     </div>
     </pre>
     *
     * If the resolving the scope name to the validation name is more complex,
     * add a resolveFn property to the config:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
        scope.user = {
           name:'Test1',
           __type:'UserType'
        };
        scope.formconfig = {
           resolveFn: function(modelValue){
               //modelValue === 'user.name'
               if (modelValue.indexOf('.') > -1) {
                   parts = modelValue.split('.');
               }
               var modelName = parts[parts.length-2];
               return scope[modelName]['__type'];
           },
           validations: {
               'UserType':{
                   name: {
                       'ng-minlength':8,
                       required:true
                   },
               }
           }
        };
    }]);
     </script>
     <div ng-controller="main">
     <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
     <input type="text" ng-model="user.name" />
     </div>
     </div>
     </pre>
     *
     * Named input fields can be added to the 'ignore' section of the configuration,
     * that way they won't be processed (so also the globals won't be added):
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
	scope.user = {
	   name:'Test1',
	   lastname:'Test2'
	};
	scope.formconfig = {
	   globals: {
		   'aa-valid-icon':''
	   },
	   ignore: {
		   'last-name':true
	   },
	   validations: {
		   'user':{
			   name: {
				   'ng-minlength':8,
				   required:true
			   },
		   }
	   }
	};
	}]);
     </script>
     <div ng-controller="main">
     <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
     <input type="text" ng-model="user.name" />
     <input type="text" ng-model="user.lastname" name="last-name/>
     </div>
     </div>
     </pre>
     *
     * For very large models that have lots of properties sharing a lot of common validations,
     * it is also possible to let one property config inherit from another, like this:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
        scope.user = {
           name:'Test1',
           lastname:'Test2'
        };
        scope.formconfig = {
           validations: {
               'user':{
                   name: {
                       'ng-minlength':4,
                       'ng-maxlength':8,
                       required:true,
                       'aa-label':'Name'
                   },
                   property2: {
                       'aa-inherit':'name',
                       'aa-label':'Property 2'
                   },
                   property3: {
                       'aa-inherit':'name',
                       'aa-label':'Property 3'
                   },
                   property4: {
                       'aa-inherit':'name',
                       'aa-label':'Property 4'
                   }
               }
           }
        };
}]);
     </script>
     </pre>
     *
     * It is even possible to inherit from a property belonging to another
     * model validation:
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
    scope.user = {
       name:'Test1',
       lastname:'Test2'
    };
    scope.formconfig = {
       validations: {
           'person':{
               name: {
                   'ng-minlength':4,
                   'ng-maxlength':8,
                   required:true,
                   'aa-label':'Name'
               },
           },
           'user':{
               name: {
                   'aa-inherit':'person.name',
                   'aa-label':'Name'
               },
               property2: {
                   'aa-inherit':'name',
                   'aa-label':'Property 2'
               },
               property3: {
                   'aa-inherit':'name',
                   'aa-label':'Property 3'
               },
               property4: {
                   'aa-inherit':'name',
                   'aa-label':'Property 4'
               }
           }
       }
    };
}]);
     </script>
     </pre>
     *
     * The inheritance also supports overriding,
     * simply add the override to the property config.
     *
     <pre>
     <script>
     var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
     .controller('main', ['$scope', function(scope) {
    scope.user = {
       name:'Test1',
       lastname:'Test2'
    };
    scope.formconfig = {
       validations: {
           'person':{
               name: {
                   'ng-minlength':4,
                   'ng-maxlength':8,
                   required:true,
                   'aa-label':'Name'
               },
           },
           'user':{
               name: {
                   'aa-inherit':'person.name',
                   'ng-maxlength':12,
                   'aa-label':'Name'
               },
               property2: {
                   'aa-inherit':'person.name',
                   'aa-label':'Property 2'
               },
               property3: {
                   'aa-inherit':'person.name',
                   'aa-label':'Property 3'
               },
               property4: {
                   'aa-inherit':'person.name',
                   'aa-label':'Property 4'
               }
           }
       }
    };
}]);
     </script>
     </pre>
     *
     */

    'use strict';
    angular.module('aa.formExternalConfiguration', [])
        .directive('aaConfiguredForm', ['$compile', '$parse', function($compile, $parse) {
            return {
                mergedAttrs:[],
                restrict: 'A',
                scope: false,
                replace: true,
                priority: 500,
                terminal: true,
                compile: function() {
                    var _this = this;
                    return function (scope, elem, attr) {
                        var validationConfig = $parse(attr.validationConfig)(scope);
                        elem.removeAttr('validation-config');
                        elem.removeAttr('aa-configured-form');
                        if (validationConfig) {
                            validationConfig.ignore = validationConfig.ignore || {};
                            _this.findFormElements(elem.children(), validationConfig);
                            $compile(elem)(scope);
                        }
                    };
                },
                findFormElements: function(elements, validationConfig) {
                    var _this = this;
                    angular.forEach(elements, function (element) {
                        var jqElm = angular.element(element);
                        var modelAttr = jqElm.attr('ng-model') || jqElm.attr('data-ng-model') || jqElm.attr('ngModel');
                        if (modelAttr) {
                            if (validationConfig.ignore[jqElm[0].name]) {
                                return;
                            }
                            _this.processElement(jqElm, modelAttr, validationConfig);
                        }
                        _this.findFormElements(jqElm.children(), validationConfig);
                    });
                },
                processElement:function(jqElm, nameAttr, validationConfig) {
                    if (!jqElm.attr('name')) {
                        jqElm.attr('name', nameAttr.split('.').join('-'));
                    }
                    this.addValidations(jqElm, nameAttr, validationConfig);
                },
                addValidations: function(jqElm, modelValue, validationConfig) {
                    var parts;
                    var name;

                    if (modelValue.indexOf('.') > -1) {
                        parts = modelValue.split('.');
                    } else {
                        throw new Error("the name attribute value needs to contain a '.' char");
                    }

                    var modelName = parts[parts.length-2];
                    var propName = parts[parts.length-1];

                    modelName = this.resolveModelName(modelName, modelValue, validationConfig);

                    var modelValidations = validationConfig.validations[modelName];
                    if (modelValidations) {
                        if (!this.checkIfAlreadyMerged(modelName + '.' + propName)){
                            if (modelValidations[propName]['aa-inherit']){
                                this.mergeInheritedAttributes(modelValidations[propName], modelValidations[propName]['aa-inherit'], modelValidations, validationConfig.validations);
                            }
                        }
                        this.addAttributes(jqElm, modelValidations[propName]);
                    } else {
                        console.log('nopes');
                    }
                    var globals = validationConfig.globals;
                    if (globals) {
                        this.addAttributes(jqElm, globals, modelValidations, validationConfig);
                    }
                },
                checkIfAlreadyMerged: function(name) {
                    if (this.mergedAttrs.indexOf(name) < 0) {
                        this.mergedAttrs.push(name);
                        return false;
                    }
                    return true;
                },
                addAttributes: function(jqElm, attrs) {
                    for (var name in attrs) {
                        if (name !== 'aa-inherit') {
                            jqElm.attr(name, attrs[name]);
                        }
                    }
                },
                mergeInheritedAttributes: function(targetAttrs, inheritedName, validations, allValidations) {
                    var inheritedAttrs = this.getInheritedAttributes(inheritedName, validations, allValidations);
                    if ((inheritedAttrs['aa-inherit'] && (!this.checkIfAlreadyMerged(inheritedAttrs['aa-inherit'])))) {
                        this.mergeInheritedAttributes(inheritedAttrs, inheritedAttrs['aa-inherit'], validations, allValidations);
                    }
                    for (var name in inheritedAttrs) {
                        if (!targetAttrs.hasOwnProperty(name)) {
                            if (name !== 'aa-inherit') {
                                targetAttrs[name] = inheritedAttrs[name];
                            }
                        }
                    }
                },
                getInheritedAttributes: function(validationName, validations, allValidations) {
                    if (validationName.indexOf('.') < 0) {
                        return validations[validationName];
                    } else {
                        var parts = validationName.split('.');
                        return allValidations[parts[0]][parts[1]];
                    }
                },
                resolveModelName: function(modelName, modelValue, config) {
                    if (!config.resolveFn) {
                        return (config.resolve && config.resolve[modelName]) ? config.resolve[modelName] : modelName;
                    } else {
                        return config.resolveFn(modelValue);
                    }
                }
            };
        }]);
})();;/*
 * AngularAgility Notify
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
    angular.module('aa.notify', [])

        // aaNotify.success(
        // aaNotify.info(
        // aaNotify.warning(
        // aaNotify.danger/.error( (same thing)
        .factory('aaNotify', ['aaNotifyConfig', '$rootScope', '$sce', function(aaNotifyConfig, $rootScope, $sce) {

            return {
                //simple api uses aaNotifyConfigProvider.defaultNotifyConfig
                success: function (message, options) {
                    return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.success(message, options, this);
                },
                info: function (message, options) {
                    return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.info(message, options, this);
                },
                warning: function (message, options) {
                    return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.warning(message, options, this);
                },
                danger: function (message, options) {
                    return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.danger(message, options, this);
                },
                error: function (message, options) {
                    return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.error(message, options, this);
                },

                //complicated API with full options
                //options:                  NULLABLE: whatever you want the scope.options to be when the template is rendered
                //targetContainerName:      NULLABLE: what aa-notify directive (container-name) do you wish to target?
                //notifyConfig:             NULLABLE: which notification configuration should be used?
                //                          Either string for a previously registered one OR one off as an object
                add: function(options, targetContainerName, notifyConfig) {

                    //resolve notify config to a config object.. could be a string
                    notifyConfig = notifyConfig || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig];
                    if (angular.isString(notifyConfig)) {
                        notifyConfig = aaNotifyConfig.notifyConfigs[notifyConfig];
                    }

                    targetContainerName = targetContainerName || notifyConfig.defaultTargetContainerName;
                    options = angular.extend(angular.copy(notifyConfig.options), options);

                    //resolve the notification configuration object to use
                    options.messageHandle = {};

                    if(notifyConfig.optionsTransformer) {
                        notifyConfig.optionsTransformer(options, $sce);
                    }

                    options.template = notifyConfig.templateUrl || notifyConfig.templateName;

                    $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-add', options);

                    return options.messageHandle; //allow for removing of the message later with this handle and the func below...
                },

                remove: function(messageHandle, targetContainerName) {
                    targetContainerName = targetContainerName || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].defaultTargetContainerName;
                    $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-remove', messageHandle);
                },

                clearAll: function(targetContainerName) {
                    targetContainerName = targetContainerName || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].defaultTargetContainerName;
                    $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-clearAll');
                }
            };
        }])

        //place the directive wherever you'd like with whatever classes you'd like to position it
        .directive('aaNotify', ['$timeout', function($timeout) {
            return {
                template:
                    '<div>' +
                        '<div ng-repeat="notification in notifications" class="aa-notification">' +
                            '<div ng-include="notification.template"></div>' +
                        '</div>' +
                    '</div>',
                replace: true,
                link: function(scope, element, attrs) {

                    scope.notifications = [];

                    //this aa-notify will listen on container-name
                    var containerName = attrs.containerName || 'default';

                    scope.$on('aaNotifyContainer-' + containerName + '-add', function(e, options) {

                        if(options.replaceExisting) {
                            scope.notifications.length = 0;
                        }

                        scope.notifications.push(options);
                        
                        if (options.ttl > 0) {
                            $timeout(function() {

                                var idx = scope.notifications.indexOf(options);
                                if(idx > -1) {
                                    scope.notifications.splice(idx, 1);
                                }

                            }, options.ttl);
                        }
                    });

                    scope.$on('aaNotifyContainer-' + containerName + '-remove', function(e, messageHandle) {
                        for (var i = scope.notifications.length - 1; i >= 0; i--) {
                            if (scope.notifications[i].messageHandle === messageHandle) {
                                scope.notifications.splice(i, 1);
                                break;
                            }
                        }
                    });

                    scope.$on('aaNotifyContainer-' + containerName + '-clearAll', function() {
                        scope.notifications.length = 0;
                    });

                    scope.close = function(notification) {
                        scope.notifications.splice(scope.notifications.indexOf(notification), 1);

                        if(angular.isFunction(notification.onClose)) {
                            notification.onClose();
                        }
                    };
                }
            };
        }])

        .provider('aaNotifyConfig', function() {

            var self = this;

            //PUBLIC API
            self.notifyConfigs = {};

            //add a notify configuration (there are already a few built in defaults)
            //name: the name of the configuration
            //opts:
            //  template: the HTML for the template
            //  templateUrl: the url for the template
            //  defaultTargetContainerName: the default target container of this configuration
            //  options: overriable options that will be present on each notification of this configuration type
            //      ttl: MS that the notification lasts. falsey === forever
            //  optionsTransformer: do some last minute transform to the options right before the dialog is presented
            //                      useful for customizations
            self.addOrUpdateNotifyConfig = function(name, opts) {

                var config = self.notifyConfigs[name] = self.notifyConfigs[name] || {};
                config.name = name;
                angular.extend(config, opts);

                if(config.template) {
                    config.templateName = 'aaNotifyTemplate-' + config.name;
                }
            };


            //SETUP THE DEFAULT CONFIGURATION
            // USED BY DEFAULT FOR ALL:
            // aaNotify.success(
            // aaNotify.info(
            // aaNotify.warning(
            // aaNotify.danger/.error( (same thing)
            //set a new one with aaNotifyConfigProvider.addConfig(...)  AND  aaNotifyConfigProvider.setDefaultConfig(...)
            self.addOrUpdateNotifyConfig('default',
                {
                    //this is the 'per notification' template that is ng-repeated
                    template:
                        '<div class="alert aa-notify-notification" ng-class="notification.cssClasses">' +
                            '<div class="pull-right aa-notify-close" ng-if="notification.showClose" ng-click="close(notification)">' +
                                '<span class="fa-stack fa-lg">' +
                                    '<i class="fa fa-circle fa-stack-2x"></i>' +
                                    '<i class="fa fa-times fa-stack-1x fa-inverse"></i>' +
                                '</span>' +
                            '</div>' +
                            '<i class="aa-notify-icon" ng-if="notification.iconClass" ng-class="notification.iconClass"></i>&nbsp;' +
                            '<span ng-if="!notification.allowHtml" class="aa-notify-message">{{notification.message}}</span>' +
                            '<span ng-if="notification.allowHtml" class="aa-notify-message" ng-bind-html="notification.message"></span>' +
                        '</div>',
                    options: {
                        ttl: 4000,              //overridable on a per-call basis
                        replaceExisting: false  //replace any existing messages. only one will show up at a time
                    },
                    namedDefaults: {
                        success: function (message, options, notifier) {
                            return notifier.add(angular.extend({ message: message, messageType: 'success'}, options));
                        },
                        info: function (message, options, notifier) {
                            return notifier.add(angular.extend({ message: message, messageType: 'info'}, options));
                        },
                        warning: function (message, options, notifier) {
                            return notifier.add(angular.extend({ message: message, messageType: 'warning'}, options));
                        },
                        danger: function (message, options, notifier) {
                            return notifier.add(angular.extend({ message: message, messageType: 'danger'}, options));
                        },
                        error: function (message, options, notifier) {
                            return notifier.add(angular.extend({ message: message, messageType: 'error'}, options));
                        }
                    },
                    defaultTargetContainerName: 'default',
                    optionsTransformer: function(options, $sce) {
                        //transform the options of each message however you want right before it shows up
                        //in this case options is being customized for twitter bootstrap 2/3 based on the notification type
                        //this exists to allow partial template overrides (change logic but keep template)

                        if(!options.cssClasses) {
                            options.cssClasses = '';
                        }

                        if (options.messageType === 'success') {
                            options.cssClasses += 'alert-success';

                        } else if (options.messageType === 'info') {
                            options.cssClasses += 'alert-info';

                        } else if (options.messageType === 'warning') {
                            options.cssClasses += 'alert-warning';

                        } else if (options.messageType === 'danger' || options.messageType === 'error') {
                            options.cssClasses += 'alert-danger alert-error'; //support old/new bootstrap
                        }

                        if(options.allowHtml) {
                            options.message = $sce.trustAsHtml(options.message);
                        }
                    }
                }
            );
            self.defaultNotifyConfig = 'default';

            this.$get = function() {
                return {
                    notifyConfigs: self.notifyConfigs,
                    defaultNotifyConfig: self.defaultNotifyConfig
                };
            };
        })
        .run(['aaNotifyConfig', '$templateCache', function(aaNotifyConfig, $templateCache) {
            //add templates to the template cache if specified
            angular.forEach(aaNotifyConfig.notifyConfigs, function(config) {
                if (config.templateName) {
                    $templateCache.put(config.templateName, config.template);
                }
            });
        }]);
})();
;/*
 * AngularAgility Select2
 *
 * NOTE! In addition to Angular.js this plugin
 * requires jQuery and Select2 http://ivaynberg.github.io/select2/
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2014 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

angular
    .module('aa.select2', [])
    .directive('aaSelect2', ['$q', function ($q) {

        return {
            require: 'ngModel',
            template: '<input type="text" />',
            replace: true,
            link: function (scope, element, attrs, ngModel) {

                //native select2 options directly from the user. always takes prescedence
                //copy the object before we muck with it incase multiple select2s are sharing settings
                var settings = angular.copy(scope.$eval(attrs.aaSelect2));

                if(!angular.isObject(settings) || isEmptyObject(settings)) {
                    throw 'aa-select2 options must be specified. Ex: <div aa-select2="*options here*"...\r\n';
                }

                //possible select2 options derived from user selections on settings
                var derivedOpts = {},

                //directive settings (aka nice wrapper for select2)
                    inAjaxMode = settings ? angular.isFunction(settings.options) : false,
                    inLocalArrayMode = settings ? angular.isArray(settings.options) : false,
                    inIdMode = settings && settings.mode ? settings.mode.indexOf('id') !== -1 : false,
                    inObjectMode = settings && settings.mode ? settings.mode.indexOf('object') !== -1 : false,
                    inTagsMode = settings && settings.mode ? settings.mode.indexOf('tags') !== -1 : false,
                    inThisMode = settings && settings.id === "@this" && settings.text === "@this";

                //need a placeholder for allow clear to work
                //fix bug?/weird api odditiy
                if(settings.select2 && settings.select2.allowClear) {
                    derivedOpts.placeholder = "Select...";
                }

                if(attrs.placeholder) {
                    derivedOpts.placeholder = attrs.placeholder;
                }

                //configure select2's options per passed settings
                if(settings) {


                    if(inThisMode) {
                        settings.id = 'id';
                        settings.text = 'text';
                    } else {
                        settings.id = settings.id || 'id';
                        settings.text = settings.text || 'text';
                    }

                    //have 'options' client side in an array
                    if(inLocalArrayMode) {
                        derivedOpts.data = derivedOpts.data || {};
                        derivedOpts.data.text = settings.text;

                        if(inThisMode) {
                            var newData = [];
                            angular.forEach(settings.options, function(obj) {
                                newData.push({id: obj, text: obj});
                            });
                            derivedOpts.data.results = newData;
                        } else {
                            derivedOpts.data.results = settings.options;
                        }
                    }

                    //AJAX MODE
                    //run a query to get options (search)
                    if(inAjaxMode) {
                        derivedOpts.query = function(query) {
                            settings.options(query.term)
                                .success(function (data) {
                                    if(inThisMode) {
                                        var newData = [];
                                        angular.forEach(data, function(str) {
                                            newData.push({id: str, text: str});
                                        });
                                        data = newData;
                                    }
                                    query.callback({
                                        results: data,
                                        text: settings.text
                                    });
                                });
                        };

                        if(inIdMode) {
                            derivedOpts.initSelection = function(e, callback) {

                                if(!ngModel.$modelValue) {
                                    return;
                                }
                                
                                if(inThisMode && inTagsMode) {
                                    var newData = [];
                                    angular.forEach(ngModel.$modelValue, function(str) {
                                        newData.push({id: str, text: str});
                                    });
                                    callback(newData);
                                    return;

                                }

                                if(inThisMode) {
                                    callback({id: ngModel.$modelValue, text: ngModel.$modelValue});
                                    return;
                                }

                                //allow for multiple lookups in tags mode (or just one in other modes)
                                var modelValueIsArray = angular.isArray(ngModel.$modelValue),
                                    lookups = [];

                                if(modelValueIsArray) {
                                    angular.forEach(ngModel.$modelValue, function(val) {
                                        lookups.push(settings.textLookup(val));
                                    });
                                } else {
                                    lookups.push(settings.textLookup(ngModel.$modelValue));
                                }

                                //resolves promises and resolved values alike
                                $q.all(lookups)
                                    .then(function(results) {

                                        if(modelValueIsArray) {
                                            var mappedResults = [];

                                            angular.forEach(results, function(result) {
                                                mappedResults.push(resultMapper(result));
                                            });

                                            callback(mappedResults);
                                        } else {
                                            callback(resultMapper(results[0]));
                                        }


                                        function resultMapper(data) {
                                            var result;
                                            if(angular.isUndefined(data.data)) {
                                                result = data;
                                            } else {
                                                result = data.data;
                                            }

                                            if(!angular.isObject(result)) {
                                                //passed back just the text. resolve:
                                                var newResult = {};
                                                newResult[settings.id] = ngModel.$modelValue;
                                                newResult[settings.text] = result;
                                                result = newResult;
                                            }
                                            return result;
                                        }
                                    });
                            };
                        }
                    }

                    derivedOpts.id = settings.id;

                    derivedOpts.formatSelection = function(obj) {
                        return obj[settings.text];
                    };
                    derivedOpts.formatResult = function(obj) {
                        return obj[settings.text];
                    };

                    if(inTagsMode) {
                        derivedOpts.tags = ngModel.$modelValue || [];
                    }

                }

                var staticOpts = {
                    width: 'resolve'
                };

                //order of prescedence for passing into select2 native api:
                //static opts loses first
                //then derivedOpts (the facade for select2 API that was created above aka what makes this plugin easy)
                //finally any explicit user opts passed into settings as 'select2' will always win
                var opts = angular.extend(staticOpts, derivedOpts, settings.select2);

                //setup select2 with options
                element.select2(opts);

                //programmatic changes to the model
                ngModel.$render = function () {

                    if(!ngModel.$modelValue) {
                        element.select2('val', "");
                        return;
                    }

                    if(inIdMode) {
                        element.select2('val', ngModel.$modelValue);
                    } else if(inObjectMode) {
                        element.select2('data', ngModel.$modelValue);
                    }
                };

                //when select2 changes
                element.bind("change", function () {
                    scope.$apply(function () {
                        var select2Data = element.select2('data');

                        var ngValue = null;

                        if (!select2Data) {
                            ngValue = null;
                        } else if(inObjectMode) {
                            ngValue = select2Data;
                        } else if(inIdMode) {

                            if(angular.isArray(select2Data)) {

                                ngValue = [];
                                angular.forEach(select2Data, function(obj) {
                                    ngValue.push(obj[settings.id]);
                                });

                            } else {
                                ngValue = select2Data[settings.id];
                            }
                        }
                        ngModel.$setViewValue(ngValue);
                    });
                });



                //other stuff
                element.bind("$destroy", function() {
                    element.select2("destroy");
                });

                //util
                //assumes object is defined
                function isEmptyObject(obj) {
                    if(!Object.keys) {  //<=IE 8
                        return JSON.stringify(obj) === "{}";
                    }

                    return Object.keys(obj).length === 0;
                }
            }
        };
    }]);