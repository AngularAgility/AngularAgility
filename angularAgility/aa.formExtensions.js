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

        //generate validation messages for all ngModels at form.$aaFormExtensions.
        //messages can be used there manually or emitted automatically with aaGenValMsg
        .directive('ngModel', ['aaFormExtensions', '$document', '$timeout', function (aaFormExtensions, $document, $timeout) {
            return {
                require: ['ngModel', '^form'],
                priority: 1,
                link: function (scope, element, attrs, controllers) {
                    var ngModel = controllers[0],
                        ngForm = controllers[1],
                        fieldName = "This field";

                    var errorMessages = [];
                    ensureaaFormExtensions(ngForm);
                    ngForm.$aaFormExtensions[ngModel.$name] = {
                        $errorMessages: errorMessages
                    }
                    ngForm.$aaFormExtensions[ngModel.$name].$element = element;

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

                    //need this to run AFTER angular's 'ngModel' runs... another way?
                    $timeout(calcErrorMessages, 0);

                    ngModel.$viewChangeListeners.push(calcErrorMessages); //subsequent runs

                    function calcErrorMessages() {
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

        .directive('aaValMsg', function() {

        })

        .directive('aaValMsgFor', function() {
            //generate the validation message for a particular form field here
            return {
                link: function(scope, element, attrs) {

                },
                template: ''
            }
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
            }
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

                    element.removeAttr('aa-auto-field');

                    element.replaceWith(outerHTML(element[0]));

                    return function(scope, element, attrs) {
                        $compile(element)(scope);
                    }
                }
            }
        }])

        .directive('aaValidIcon', ['aaFormExtensions', function(aaFormExtensions) {
            return {
                require: 'ngModel',
                scope: false,
                compile: function(element) {

                    var container = aaFormExtensions.validIconStrategy.getContainer(element);

                    var validIcon = angular.element(aaFormExtensions.validIconStrategy.validIcon)
                    container.append(validIcon);

                    var invalidIcon = angular.element(aaFormExtensions.validIconStrategy.invalidIcon)
                    container.append(invalidIcon);

                    return function(scope, element, attrs, ngModel) {

                        scope.$watch(function() {
                            return ngModel.$modelValue;
                        }, function() {

                            if(ngModel.$pristine) {
                                validIcon[0].style.display = 'none';
                                invalidIcon[0].style.display = 'none';
                                return
                            }

                            if(ngModel.$valid) {
                                validIcon[0].style.display = '';
                                invalidIcon[0].style.display = 'none';
                            } else {
                                validIcon[0].style.display = 'none';
                                invalidIcon[0].style.display = '';
                            }
                        })

                    }
                }
            }
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
                    ]

                    if(unsupported.indexOf(ele[0].type) !== -1) {
                        throw "Generating a label for and input type " + ele[0].type + " is unsupported."
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
                email: "{0} must be an email.",
                minlength: "{0} must be at least {1} character(s).",
                maxlength: "{0} must be less than {1} characters.",
                pattern: "{0} is invalid.",
                url: "{0} must be a valid URL.",
                number: "{0} must be number."
            }
            this.setValidationMessage = function(directiveName, messages) {
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

    function ensureaaFormExtensions(obj) {
        if(!obj.$aaFormExtensions) {
            obj.$aaFormExtensions = {};
        }
    }
})()