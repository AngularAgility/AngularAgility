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

;(function () {
    var formExtensions = angular.module('aa.formExtensions', [])

        .directive('aaSaveForm', ['aaFormExtensions', function (aaFormExtensions) {
            return {
                scope: {
                    onInvalidAttempt: '&',
                    aaSaveForm: '&'
                },
                restrict: 'A',
                require: '^form',
                link: function (scope, element, attrs, ngForm) {

                    ensureaaFormExtensions(ngForm);

                    element.on('click', function () {
                        scope.$apply(function () {
                            if (ngForm.$valid) {
                                ngForm.$aaFormExtensions.$invalidAttempt = false;
                                scope.aaSaveForm();
                            } else {
                                ngForm.$aaFormExtensions.$invalidAttempt = true;

                                var hasScopeFunction = typeof scope.onInvalidAttempt() === 'function';
                                var hasGlobalFunction = typeof aaFormExtensions.defaultOnInvalidAttempt === 'function';

                                if(hasScopeFunction || hasGlobalFunction) {
                                    //calc error messages

                                    var errorMessages = [];

                                    angular.forEach(ngForm.$aaFormExtensions, function(fieldObj, fieldName) {

                                        if(fieldName.indexOf('$') === 0){ return; }

                                        errorMessages = errorMessages.concat(fieldObj.$errorMessages);
                                    });

                                    if(hasScopeFunction) {
                                        scope.onInvalidAttempt(errorMessages, ngForm);
                                        return;
                                    }

                                    aaFormExtensions.defaultOnInvalidAttempt(errorMessages, ngForm);
                                }
                            }
                        });
                    });
                }
            };
        }])

        //constructs myForm.$aaFormExtensions.myFieldName object
        //including validation messages for all ngModels at form.$aaFormExtensions.
        //messages can be used there manually or emitted automatically with aaValMsg
        .directive('ngModel', ['aaFormExtensions', '$document', '$timeout', function (aaFormExtensions, $document, $timeout) {
            return {
                require: ['ngModel', '?^form'],
                priority: 1,
                link: function (scope, element, attrs, controllers) {
                    var ngModel = controllers[0],
                        ngForm = controllers[1],
                        fieldName = "This field";

                    if(!ngForm)
                        return; //only for validation with forms

                    if(attrs.aaLabel) {
                        //use default label
                        fieldName = attrs.aaLabel;

                    } else if(element[0].id){
                        //is there a label for this field?
                        angular.forEach($document.find('label'), function(label) {
                            if(label.getAttribute("for") === element[0].id) {
                                fieldName = (label.innerHTML || "").replace('*', '').trim();
                            }
                        });
                    }

                    ensureaaFormExtensionsFieldExists(ngForm, ngModel.$name);
                    ngForm.$aaFormExtensions[ngModel.$name].$element = element;
                    element.on('blur', function() {

                        scope.$apply(function() {
                            ngForm.$aaFormExtensions[ngModel.$name].$hadFocus = true;
                            element.addClass('aa-had-focus');
                        });
                    });


                    scope.$watch(function() {
                        return ngForm.$aaFormExtensions.$invalidAttempt;
                    }, function(val) {
                        if(val) {
                            element.addClass('aa-invalid-attempt');
                        }
                    });

                    //need this to run AFTER Angular's 'ngModel' runs... another way?
                    $timeout(calcErrorMessages, 0);

                    //subsequent runs after value changes in GUI...
                    ngModel.$parsers.push(calcErrorMessages);

                    function calcErrorMessages(val) {
                        var errorMessages = ngForm.$aaFormExtensions[ngModel.$name].$errorMessages;
                        errorMessages.length = 0;

                        for (var key in ngModel.$error) {
                            if(ngModel.$error[key]) {

                                if(key === 'minlength') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.ngMinlength)
                                    );
                                } else if (key === 'maxlength') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.ngMaxlength)
                                    );
                                } else if (key === 'min') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.min)
                                    );
                                } else if (key === 'max') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.max)
                                    );
                                } else if (key === 'required' && element[0].type === 'number') {
                                    //angular doesn't correctly flag numbers as invalid rather as required when something wrong is filled in
                                    //hack around it
                                    errorMessages.push(
                                        /*jshint -W069 */
                                        stringFormat(aaFormExtensions.validationMessages['number'], fieldName)
                                    );
                                } else if (aaFormExtensions.validationMessages[key]) {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName)
                                    );
                                }
                            }
                        }
                        return val;
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

                    var ngModel = ctrls[0];
                    var form = ctrls[1];

                    var msgElement = aaFormExtensions.valMsgPlacementStrategies[attrs.aaValMsg ||  aaFormExtensions.defaultValMsgPlacementStrategy](
                        element, form.$name, attrs.name
                    );

                    $compile(msgElement)(scope);
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
                                fieldInFormExtensions.$hadFocus
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
        .directive('aaLabel', ['aaFormExtensions', function (aaFormExtensions) {
            return {
                link: function (scope, element, attrs) {

                    var strategyName = attrs.aaLabelStrategy || aaFormExtensions.defaultLabelStrategy;
                    var isRequiredField = (attrs.required !== undefined);

                    //auto generate an ID for compliant label names
                    if (!element[0].id) {
                        element[0].id = guid();
                    }

                    aaFormExtensions.labelStrategies[strategyName](element, attrs.aaLabel, isRequiredField);
                }
            };
        }])

        .directive('aaAutoField', ['$compile', function ($compile) {
            return {
                restrict: 'A',
                scope: false,
                replace: true,
                priority: 1000,
                terminal: true,
                compile: function(element, attrs) {

                    //use the passed value for ng-model
                    element.attr("ng-model", attrs.aaAutoField);

                    var lastPartOfName = attrs.aaAutoField.substring(attrs.aaAutoField.lastIndexOf('.') + 1);

                    //if no name set calc one
                    if (!attrs.name) {
                        element.attr("name", lastPartOfName);
                    }

                    //if no label and "no-label" don't calc one
                    if (!attrs.aaLabel && attrs.noLabel === undefined) {
                        element.attr('aa-label', toTitleCase(splitCamelCase(lastPartOfName)));
                    }

                    element.attr("aa-val-msg", "");

                    element.removeAttr('aa-auto-field');

                    element.replaceWith(outerHTML(element[0]));

                    return function(scope, element, attrs) {
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

        .provider('aaFormExtensions', function () {

            var self = this;

            this.defaultLabelStrategy = "default";
            this.setDefaultLabelStrategy = function(strategyName) {
                this.defaultLabelStrategy = strategyName;
            };
            this.labelStrategies = {

                //create a bootstrap3 style label
                bootstrap3InlineForm: function (ele, labelText, isRequired) {

                    var label = angular.element('<label>')
                        .attr('for', ele[0].id)
                        .addClass('col-sm-2 control-label')
                        .html(labelText + (isRequired ? ' *' : ''));


                    var unsupported = [
                        'button',
                        'submit'
                    ];

                    if(unsupported.indexOf(ele[0].type) !== -1) {
                        throw "Generating a label for and input type " + ele[0].type + " is unsupported.";
                    }

                    ele.parent().parent().prepend(label);
                },

                //create a no-frills label directly before the element
                default: function (ele, labelText, isRequired) {
                    ele[0].parentNode.insertBefore(
                        angular.element('<label>')
                            .attr('for', ele[0].id)
                            .html(labelText + (isRequired ? ' *' : ''))[0],
                        ele[0]);
                }

                //add you own here using registerLabelStrategy
            };
            this.registerLabelStrategy = function (name, strategy) {
                this.labelStrategies[name] = strategy;
            };



            this.defaultValMsgPlacementStrategy = "default";
            this.setDefaultValMsgPlacementStrategy = function(strategyName) {
                this.defaultValMsgPlacementStrategy = strategyName;
            };
            this.valMsgPlacementStrategies = {

                default: function(formFieldElement, formName, formFieldName) {

                    var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}"></div>', formName, formFieldName));
                    var fieldType = formFieldElement[0].type.toLowerCase();

                    if(fieldType === 'radio') {
                        //radios tend to be wrapped, go up a few levels (of course you can customize this with your own strategy)
                        formFieldElement.parent().parent().append(msgElement);

                    } else {
                        formFieldElement.after(msgElement);
                    }

                    return msgElement;
                }
            };
            this.registerValMsgPlacementStrategy = function(name, strategy) {
                this.valMsgPlacementStrategies[name] = strategy;
            };


            //bootstrap 3 + font awesome
            this.validIconStrategy = {
                validIcon: '<i class="fa fa-check fa-lg"></i>',
                invalidIcon: '<i class="fa fa-exclamation-circle fa-lg"></i>',
                getContainer: function(element) {
                    var ele = angular.element('<div class="col-xs-1 validation-icons"></span>');
                    element.parent().after(ele);
                    return ele;
                }
            };
            this.setValidIconStrategy = function(strategy) {
                self.validIconStrategy = strategy;
            };


            this.validationMessages = {
                required: "{0} is required.",
                email: "The field {0} must be an email.",
                minlength: "{0} must be at least {1} character(s).",
                maxlength: "{0} must be less than {1} characters.",
                min: "{0} must be at least {1}.",
                max: "{0} must be at most {1}.",
                pattern: "{0} is invalid.",
                url: "{0} must be a valid URL.",
                number: "{0} must be number."
            };
            this.setValidationMessage = function(directiveName, message) {
                self.validationMessages[directiveName] = message;
            };
            this.setValidationMessages = function(messages) {
                self.validationMessages = messages;
            };

            this.valMsgForTemplate ='<div class="validation-error" ng-show="showMessages" ng-repeat="msg in errorMessages">{{msg}}</div>';
            this.setValMsgForTemplate = function(valMsgForTemplate) {
                this.valMsgForTemplate = valMsgForTemplate;
            };

            this.defaultOnInvalidAttempt = function() {
                //todo integrate with 'growl like' notifications
            };
            this.setDefaultOnInvalidAttempt = function(func) {
                this.defaultOnInvalidAttempt = func;
            };

            this.$get = function () {
                return {
                    defaultLabelStrategy: self.defaultLabelStrategy,
                    labelStrategies: self.labelStrategies,
                    validIconStrategy: self.validIconStrategy,
                    validationMessages: self.validationMessages,
                    valMsgForTemplate: self.valMsgForTemplate,
                    valMsgPlacementStrategies: self.valMsgPlacementStrategies,
                    defaultValMsgPlacementStrategy: self.defaultValMsgPlacementStrategy,
                    defaultOnInvalidAttempt: self.defaultOnInvalidAttempt
                };
            };
        });

    //utility
    function guid(a) {
        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, guid);
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function splitCamelCase(str) {
        return str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    }

    function outerHTML(node){
        // if IE, Chrome take the internal method otherwise build one
        return node.outerHTML || (
            function(n){
                var div = document.createElement('div'), h;
                div.appendChild( n.cloneNode(true) );
                h = div.innerHTML;
                div = null;
                return h;
            })(node);
    }

    function stringFormat(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }

    function ensureaaFormExtensions(form) {
        if(!form.$aaFormExtensions) {
            form.$aaFormExtensions = {};
        }
    }
    
    function ensureaaFormExtensionsFieldExists(form, fieldName) {
        ensureaaFormExtensions(form);

        if(!form.$aaFormExtensions[fieldName]) {
            form.$aaFormExtensions[fieldName] = {
                $hadFocus: false,
                $errorMessages: [],
                $element: null
            };
        }
    }
})();;/*
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
    .directive('aaSelect2', function () {

        return {
            require: 'ngModel',
            template: '<input type="hidden" />',
            replace: true,
            link: function (scope, element, attrs, ngModel) {

                //native select2 options directly from the user. always takes prescedence
                var userOpts = scope.$eval(attrs.aaSelect2) || {},

                //possible select2 options derived from user selections on $settings
                    derivedOpts = {},

                //directive settings (aka nice wrapper for select2)
                    settings = userOpts.$settings,
                    inAjaxMode = settings ? angular.isFunction(settings.options) : false,
                    inLocalArrayMode = settings ? angular.isArray(settings.options) : false,
                    inIdMode = settings && settings.mode ? settings.mode.indexOf('id') != -1 : false,
                    inObjectMode = settings && settings.mode ? settings.mode.indexOf('object') != -1 : false,
                    inTagsMode = settings && settings.mode ? settings.mode.indexOf('tags') != -1 : false,
                    inThisMode = settings && settings.id === "@this" && settings.text === "@this";

                delete userOpts.$settings; // no longer needed

                var modelValue = scope.$eval(attrs.ngModel);

                //configure select2's options per passed $settings
                if(settings) {

                    if(inThisMode) {
                        settings.id = 'id';
                        settings.text = 'text';
                    }

                    if(inObjectMode) {
                        settings.id = settings.id || 'id';
                        settings.text = settings.text || 'text';
                    }

                    //allow for flexibility of mapping ajax object back to the bound ng-model
                    settings.ajaxMap = derivedOpts.ajaxMap || function(ajaxResultObject) { return ajaxResultObject;};

                    //have 'options' client side in an array
                    if(inLocalArrayMode) {
                        derivedOpts.data = derivedOpts.data || {};
                        derivedOpts.data.text = settings.text;
                        derivedOpts.data.results = settings.options;
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


                        if(modelValue && inIdMode) {
                            derivedOpts.initSelection = function(e, callback) {

                                if(inThisMode) {
                                    callback({id: modelValue, text: modelValue});
                                    return;
                                }

                                settings.textLookup(modelValue)
                                    .success(function(data) {
                                        callback(data);
                                    });
                            };
                        }
                    }

                    if(settings.id) {
                        derivedOpts.id = settings.id;
                    }

                    if(settings.text) {
                        derivedOpts.formatSelection = function(obj) {
                            return obj[settings.text];
                        };
                        derivedOpts.formatResult = function(obj) {
                            return obj[settings.text];
                        };
                    }

                    if(inTagsMode) {
                        derivedOpts.tags = modelValue || [];
                    }

                }

                var staticOpts = {
                    width: 'resolve'
                };

                //order of prescedence
                //static opts loses first
                //then derivedOpts (the facade for select2 API, aka what makes this plugin easy)
                //finally any explicit user opts will always win
                var opts = angular.extend(staticOpts, derivedOpts, userOpts);

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
                        var val = element.select2('val');

                        if (val === "") {
                            ngModel.$setViewValue(null);
                            return;
                        }

                        if(inIdMode) {

                            ngModel.$setViewValue(val);

                        } else if (inObjectMode) {

                            var valObj = element.select2('data');
                            ngModel.$setViewValue(valObj);
                        }
                    });
                });



                //other stuff
                element.bind("$destroy", function() {
                    element.select2("destroy");
                });
            }
        };
    });