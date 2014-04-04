/*
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
    'use strict';

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
    <aa-configured-form validation-config="formconfig" form-name="'exampleForm'">
        <input type="text" ng-model="user.name" />
    </aa-configured-form>
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
    <aa-configured-form validation-config="formconfig" form-name="'exampleForm'">
        <input type="text" ng-model="user.name" />
    </aa-configured-form>
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
    <aa-configured-form validation-config="formconfig" form-name="'exampleForm'">
        <input type="text" ng-model="user.name" />
    </aa-configured-form>
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
    <aa-configured-form validation-config="formconfig" form-name="'exampleForm'">
        <input type="text" ng-model="user.name" />
    </aa-configured-form>
</div>
    </pre>
    *
    * Known issue: Using aa-field or aa-field-group inside the aaConfiguredForm directive
    * will result in errors like this:
    * TypeError: Object #<Comment> has no method 'setAttribute'
    *
    */
    angular.module('aa.formExternalConfiguration', [])
        .directive('aaConfiguredForm', ['$compile', function($compile) {
            return {
                restrict: 'EA',
                replace:true,
                template:'<div ng-transclude ng-form="{{formName}}"></div>',
                transclude:true,
                scope: {
                    validationConfig:'=',
                    formName:'='
                },
                compile: function(elem) {
                    var _this = this;
                    elem.removeAttr('ng-transclude');
                    return function (scope, elem, attr) {
                        if (scope.validationConfig) {
                            _this.findFormElements(['input', 'select'], elem, scope);
                        }
                        $compile(elem)(scope);
                    };
                },
                findFormElements: function(names, rootElement, scope) {
                    var _this = this;
                    angular.forEach(names, function(name) {
                        _this.processElements(name, rootElement, scope);
                    });
                },
                processElements: function(name, rootElement, scope) {
                    var elements = rootElement.find(name);
                    for(var i= 0, ii = elements.length; i < ii; i++) {
                        this.processElement(elements[i], scope);
                    }
                },
                processElement:function(element, scope) {
                    var jqElm = angular.element(element);
                    var nameAttr = jqElm.attr('ng-model') || jqElm.attr('ngModel');
                    if (nameAttr) {
                        jqElm.attr('name', nameAttr.split('.').join('-'));
                        this.addAttributes(scope, jqElm, nameAttr);
                    }
                },
                addAttributes: function(scope, jqElm, modelValue) {
                    var parts;
                    var name;
                    var config = scope.validationConfig;

                    if (modelValue.indexOf('.') > -1) {
                        parts = modelValue.split('.');
                    } else {
                        throw new Error("the name attribute value needs to contain a '.' char");
                    }

                    var modelName = parts[parts.length-2];
                    var propName = parts[parts.length-1];

                    modelName = this.resolveModelName(modelName, modelValue, config);

                    var validation = config.validations[modelName];
                    if (validation) {
                        var validationAttrs = validation[propName];
                        for (name in validationAttrs) {
                            jqElm.attr(name, validationAttrs[name]);
                        }

                        var globals = config.globals;
                        if (globals) {
                            for (name in globals) {
                                jqElm.attr(name, globals[name]);
                            }
                        }
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
})();
