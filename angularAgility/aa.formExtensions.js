(function () {
    var formExtensions = angular.module('aa.formExtensions', [])

        .directive('aaSaveForm', function () {
            return {
                restrict: 'A',
                require: '^form',
                link: function (scope, element, attrs, ngForm) {

                    ensureaaFormExtensions(ngForm);

//                    scope.$watch(function () {
//                        return ngForm.$invalid;
//                    }, function (val) {
//                        element.toggleClass("disabled", val);
//                    });

                    element.on('click', function () {
                        scope.$apply(function () {
                            if (ngForm.$valid) {
                                ngForm.$aaFormExtensions.$invalidAttempt = false;
                                scope.$eval(attrs.aaSaveForm);
                            } else {
                                ngForm.$aaFormExtensions.$invalidAttempt = true;
                            }
                        });
                    });
                }
            };
        })

        //constructs myForm.$aaFormExtensions.myFieldName object
        //including validation messages for all ngModels at form.$aaFormExtensions.
        //messages can be used there manually or emitted automatically with aaValMsg
        .directive('ngModel', ['aaFormExtensions', '$document', '$timeout', function (aaFormExtensions, $document, $timeout) {
            return {
                require: ['ngModel', '^form'],
                priority: 1,
                link: function (scope, element, attrs, controllers) {
                    var ngModel = controllers[0],
                        ngForm = controllers[1],
                        fieldName = "This field";

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
                    //might need to get more elaborate with this

                    //TODO: this breaks ng-options
                    ngModel.$parsers.push(calcErrorMessages);

                    function calcErrorMessages() {
                        var errorMessages = ngForm.$aaFormExtensions[ngModel.$name].$errorMessages;
                        errorMessages.length = 0;

                        for (var key in ngModel.$error) {
                            if(ngModel.$error[key]) {

                                if(key === 'minlength') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.ngMinlength)
                                    )
                                } else if (key === 'maxlength') {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName, attrs.ngMaxlength)
                                    )
                                } else {
                                    errorMessages.push(
                                        stringFormat(aaFormExtensions.validationMessages[key], fieldName)
                                    )
                                }
                            }
                        }
                    }
                }
            };
        }])

        //place on an element with ngModel to generate validation messages for it
        //will use the default configured validation message placement strategy unless a custom strategy is passed in
        .directive('aaValMsg', ['$compile', function($compile) {
            return {
                require: ['ngModel', '^form'],
                link: function(scope, element, attrs, ctrls) {

                    var ngModel = ctrls[0];
                    var form = ctrls[1];

                    //TODO allow for strategy selection in attrs.aaValMsg's value
                    //TODO use a provider strategy rather than hardcoded
                    var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}"></div>', form.$name, attrs.name));
                    element.after(msgElement);
                    $compile(msgElement)(scope);
                }
            };
        }])

        //if used directly rather than passively with aaValMsg allows for direct placement of validation messages
        //for a given form field. ex. pass "myForm.myFieldName"
        .directive('aaValMsgFor', function() {
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
                template: '<div class="validation-error" ng-show="showMessages" ng-repeat="msg in errorMessages">{{msg}}</div>',
                replace: true
            };
        })

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
                        element.attr('aa-label', toTitleCase(splitCamelCase(lastPartOfName)))
                    }

                    element.attr("aa-val-msg", "")

                    element.removeAttr('aa-auto-field');

                    element.replaceWith(outerHTML(element[0]));

                    return function(scope, element, attrs) {
                        $compile(element)(scope);
                    }
                }
            };
        }])

        .directive('aaValidIcon', ['aaFormExtensions', function(aaFormExtensions) {
            return {
                require: 'ngModel',
                scope: false,
                compile: function(element) {

                    var container = aaFormExtensions.validIconStrategy.getContainer(element);

                    var validIcon = angular.element(aaFormExtensions.validIconStrategy.validIcon)
                    container.append(validIcon);
                    validIcon[0].style.display = 'none';

                    var invalidIcon = angular.element(aaFormExtensions.validIconStrategy.invalidIcon)
                    container.append(invalidIcon);
                    invalidIcon[0].style.display = 'none';

                    return function(scope, element, attrs, ngModel) {
                        ngModel.$parsers.push(function() {

                            if(ngModel.$valid) {
                                validIcon[0].style.display = '';
                                invalidIcon[0].style.display = 'none';
                            } else {
                                validIcon[0].style.display = 'none';
                                invalidIcon[0].style.display = '';
                            }
                        });
                    }
                }
            };
        }])

        .provider('aaFormExtensions', function () {

            var self = this;

            this.defaultLabelStrategy = "default";
            this.labelStrategies = {

                //create a bootstrap3 style label
                bootstrap3InlineForm: function (ele, labelText, isRequired) {

                    var label = angular.element('<label>')
                        .attr('for', ele[0].id)
                        .addClass('col-sm-2 control-label')
                        .html(labelText + (isRequired ? ' *' : ''));


                    var unsupported = [
                        'button',
                        'checkbox',
                        'hidden',
                        'radio',
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
            this.setDefaultLabelStrategy = function(strategyName) {
                this.defaultLabelStrategy = strategyName;
            }

            //bootstrap 3 + font awesome
            this.validIconStrategy = {
                validIcon: '<i class="fa fa-check fa-lg"></i>',
                invalidIcon: '<i class="fa fa-exclamation-circle fa-lg"></i>',
                getContainer: function(element) {
                    var ele = angular.element('<div class="col-xs-1 validation-icons"></span>')
                    element.parent().after(ele)
                    return ele;
                }
            }
            this.setValidIconStrategy = function(strategy) {
                self.validIconStrategy = strategy;
            }


            this.validationMessages = {
                required: "{0} is required.",
                email: "The field {0} must be an email.",
                minlength: "{0} must be at least {1} character(s).",
                maxlength: "{0} must be less than {1} characters.",
                pattern: "{0} is invalid.",
                url: "{0} must be a valid URL.",
                number: "{0} must be number."
            }
            this.setValidationMessage = function(directiveName, message) {
                self.validationMessages[directiveName] = message;
            }
            this.setValidationMessages = function(messages) {
                self.validationMessages = messages;
            }


            this.$get = function () {
                return {
                    defaultLabelStrategy: self.defaultLabelStrategy,
                    labelStrategies: self.labelStrategies,
                    validIconStrategy: self.validIconStrategy,
                    validationMessages: self.validationMessages
                }
            };
        });

    //utility
    function guid(a) {
        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, guid)
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
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    };

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
})()