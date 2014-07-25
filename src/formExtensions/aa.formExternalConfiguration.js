/*globals angular */

(function () {
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
    *   ignore?:Object,
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
    .directive('aaConfiguredForm', ['$compile', '$parse', function ($compile, $parse) {
      return {
        mergedAttrs: [],
        restrict: 'A',
        scope: false,
        replace: true,
        priority: 500,
        terminal: true,
        compile: function () {
          var _this = this;
          return function (scope, elem, attr) {
            var validationConfig = $parse(attr.validationConfig)(scope);
            elem.removeAttr('validation-config');
            elem.removeAttr('aa-configured-form');
            if (validationConfig) {
              validationConfig.ignore = validationConfig.ignore || {};
              _this.findFormElements(elem.children(), validationConfig);
            }
            $compile(elem)(scope);
          };
        },
        findFormElements: function (elements, validationConfig) {
          var _this = this;
          angular.forEach(elements, function (element) {
            var jqElm = angular.element(element);
            var modelAttr = jqElm.attr('ng-model') || jqElm.attr('data-ng-model') || jqElm.attr('ngModel') || jqElm.attr('aa-field') || jqElm.attr('aa-field-group') || jqElm.attr('data-aa-field') || jqElm.attr('data-aa-field-group');
            if (modelAttr) {
              if (validationConfig.ignore[jqElm[0].name]) {
                return;
              }
              _this.processElement(jqElm, modelAttr, validationConfig);
            }
            _this.findFormElements(jqElm.children(), validationConfig);
          });
        },
        processElement: function (jqElm, nameAttr, validationConfig) {
          if (!jqElm.attr('name')) {
            jqElm.attr('name', nameAttr.substring(nameAttr.lastIndexOf('.') + 1));
          }
          this.addValidations(jqElm, nameAttr, validationConfig);
        },
        addValidations: function (jqElm, modelValue, validationConfig) {
          var parts;
          var name;

          if (modelValue.indexOf('.') > -1) {
            parts = modelValue.split('.');
          } else {
            throw new Error("the name attribute value needs to contain a '.' char");
          }

          var modelName = parts[parts.length - 2];
          var propName = parts[parts.length - 1];

          modelName = this.resolveModelName(modelName, modelValue, validationConfig);

          var modelValidations = validationConfig.validations[modelName];
          if (modelValidations) {
            if (!this.checkIfAlreadyMerged(modelName + '.' + propName)) {
              if (modelValidations[propName] && modelValidations[propName]['aa-inherit']) {
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
        checkIfAlreadyMerged: function (name) {
          if (this.mergedAttrs.indexOf(name) < 0) {
            this.mergedAttrs.push(name);
            return false;
          }
          return true;
        },
        addAttributes: function (jqElm, attrs) {
          for (var name in attrs) {
            if (name !== 'aa-inherit') {
              if (name !== 'required') {
                jqElm.attr(name, attrs[name]);
              } else {
                jqElm.prop(name, attrs[name]);
              }
            }
          }
        },
        mergeInheritedAttributes: function (targetAttrs, inheritedName, validations, allValidations) {
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
        getInheritedAttributes: function (validationName, validations, allValidations) {
          if (validationName.indexOf('.') < 0) {
            return validations[validationName];
          } else {
            var parts = validationName.split('.');
            return allValidations[parts[0]][parts[1]];
          }
        },
        resolveModelName: function (modelName, modelValue, config) {
          if (!config.resolveFn) {
            return (config.resolve && config.resolve[modelName]) ? config.resolve[modelName] : modelName;
          } else {
            return config.resolveFn(modelValue);
          }
        }
      };
    }]);
})();
