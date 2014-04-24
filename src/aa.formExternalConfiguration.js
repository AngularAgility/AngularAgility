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
    * Known issue: Using aa-field or aa-field-group inside the aaConfiguredForm directive
    * will result in errors like this:
    * TypeError: Object #<Comment> has no method 'setAttribute'
    *
    */
    angular.module('aa.formExternalConfiguration', [])
        .directive('aaConfiguredForm', ['$compile', '$parse', function($compile, $parse) {
            return {
                restrict: 'A',
                scope: false,
                replace: true,
                priority: 500,
                terminal: true,
                compile: function() {
                    return function (scope, elem, attr) {
                        s = scope;
                        var validationConfig = $parse(attr.validationConfig)(scope);
                        elem.removeAttr('validation-config');
                        elem.removeAttr('form-name');
                        elem.removeAttr('aa-configured-form');
                        if (validationConfig) {
                            validationConfig.ignore = validationConfig.ignore || {};
                            _this.findFormElements(elem.children(), validationConfig);
                            $compile(elem.get(0))(scope);
                        }
                    };
                },
                findFormElements: function(elements, validationConfig) {
                    var _this = this;
                    angular.forEach(elements, function (element) {
                        var jqElm = angular.element(element);
                        var modelAttr = jqElm.attr('ng-model') || jqElm.attr('ngModel');
                        if (modelAttr) {
                            if (validationConfig.ignore[jqElm.get(0).name]) {
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
                    this.addAttributes(jqElm, nameAttr, validationConfig);
                },
                addAttributes: function(jqElm, modelValue, validationConfig) {
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

                    var validation = validationConfig.validations[modelName];
                    if (validation) {
                        var validationAttrs = validation[propName];
                        for (name in validationAttrs) {
                            jqElm.attr(name, validationAttrs[name]);
                        }
                    }
                    var globals = validationConfig.globals;
                    if (globals) {
                        for (name in globals) {
                            jqElm.attr(name, globals[name]);
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