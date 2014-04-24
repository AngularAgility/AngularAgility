/**
 * Created by Roland on 4/3/2014.
 */
describe('aa.formExternalConfiguration.js >', function () {
    beforeEach(module('aa.formExternalConfiguration'));

    describe('aaConfiguredForm >', function () {
        var scope, compile;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();
            compile = $compile;
        }));

        it('copies the validation config to the input element', function () {
            scope.config = {
                validations: {
                    user:{
                        name: {
                            'ng-minlength':5
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element = angular.element('<input type="text" ng-model="user.name"/>');
            directive.append(element);

            compile(directive)(scope);
            element = directive.find('input');
            expect(element.attr('ng-minlength')).toEqual('5');
        });

        it('copies the validation and global config to the input element', function () {
            scope.config = {
                globals:{
                    'aa-valid-icon':''
                },
                validations: {
                    user:{
                        name: {
                            'ng-minlength':5
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element = angular.element('<input type="text" ng-model="user.name"/>');
            directive.append(element);

            compile(directive)(scope);
            element = directive.find('input');
            expect(element.attr('aa-valid-icon')).toEqual('');
        });

        it('resolves the validation name using the "resolve" property', function () {
            scope.config = {
                resolve: {
                    user:'UserType'
                },
                validations: {
                    'UserType':{
                        name: {
                            'aa-valid-icon':''
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element = angular.element('<input type="text" ng-model="user.name"/>');
            directive.append(element);

            compile(directive)(scope);
            element = directive.find('input');
            expect(element.attr('aa-valid-icon')).toEqual('');
        });

        it('resolves the validation name using the "resolveFn" function', function () {
            scope.config = {
                resolveFn: function(modelValue){
                    return 'UserType';
                },
                validations: {
                    'UserType':{
                        name: {
                            'aa-valid-icon':''
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element = angular.element('<input type="text" ng-model="user.name"/>');
            directive.append(element);

            compile(directive)(scope);
            element = directive.find('input');
            expect(element.attr('aa-valid-icon')).toEqual('');
        });

    });
});