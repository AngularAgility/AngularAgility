/**
 * Created by Roland on 4/3/2014.
 */
describe('aa.formExternalConfiguration.js >', function () {
    beforeEach(module('aa.formExternalConfiguration'));

    describe('aaConfiguredForm >', function () {
        var scope, compile, directive;

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

        it('copies the validation and global config to the input element but skips the element whose name is in the ignore list.', function () {
            scope.config = {
                globals:{
                    'aa-valid-icon':''
                },
                ignore: {
                    'user-lastname':true
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
            var element2 = angular.element('<input type="text" ng-model="user.lastname" name="user-lastname"/>');
            directive.append(element);
            directive.append(element2);

            compile(directive)(scope);
            element = angular.element(directive.find('input')[0]);
            expect(element.attr('aa-valid-icon')).toEqual('');
            element = angular.element(directive.find('input')[1]);
            expect(element.attr('aa-valid-icon')).toBeUndefined();
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

        it('needs to merge inherited property validations and honor overridden ones', function() {
            scope.config = {
                resolveFn: function(modelValue){
                    return 'UserType';
                },
                validations: {
                    'UserType':{
                        name: {
                            'aa-valid-icon':'',
                            'ng-minlength':'1'
                        },
                        lastname: {
                            'aa-inherit':'name',
                            'ng-minlength':'2'
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element1 = angular.element('<input type="text" ng-model="user.name"/>');
            var element2 = angular.element('<input type="text" ng-model="user.lastname"/>');
            directive.append(element1);
            directive.append(element2);

            compile(directive)(scope);
            element1 = angular.element(directive.find('input')[0]);
            element2 = angular.element(directive.find('input')[1]);
            expect(element1.attr('aa-valid-icon')).toEqual('');
            expect(element1.attr('ng-minlength')).toEqual('1');
            expect(element2.attr('aa-valid-icon')).toEqual('');
            expect(element2.attr('ng-minlength')).toEqual('2');
        });

        it('needs to be able inherit from a different object property', function() {
            scope.config = {
                resolveFn: function(modelValue){
                    return 'UserType';
                },
                validations: {
                    'PersonType': {
                        name: {
                            'aa-valid-icon':''
                        }
                    },
                    'UserType':{
                        name: {
                            'aa-inherit':'PersonType.name',
                            'ng-minlength':'1'
                        },
                        lastname: {
                            'aa-inherit':'PersonType.name',
                            'ng-minlength':'2'
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element1 = angular.element('<input type="text" ng-model="user.name"/>');
            var element2 = angular.element('<input type="text" ng-model="user.lastname"/>');
            directive.append(element1);
            directive.append(element2);

            compile(directive)(scope);
            element1 = angular.element(directive.find('input')[0]);
            element2 = angular.element(directive.find('input')[1]);
            expect(element1.attr('aa-valid-icon')).toEqual('');
            expect(element1.attr('ng-minlength')).toEqual('1');
            expect(element2.attr('aa-valid-icon')).toEqual('');
            expect(element2.attr('ng-minlength')).toEqual('2');
        });

        it('needs to be able to inherit recursively', function() {
            scope.config = {
                resolve: {
                    user:'UserType'
                },
                validations: {
                    'BaseType': {
                        name: {
                            'aa-valid-icon': ''
                        }
                    },
                    'PersonType': {
                        name: {
                            'aa-inherit': 'BaseType.name',
                            required: true
                        }
                    },
                    'UserType': {
                        name: {
                            'aa-inherit': 'PersonType.name',
                            'ng-minlength': '1'
                        },
                        lastname: {
                            'aa-inherit': 'name',
                            'ng-minlength': '2'
                        }
                    }
                }
            };
            scope.user = {
                name:'test'
            };

            var directive = angular.element("<div aa-configured-form validation-config=\"config\" ng-form=\"exampleForm\"></div>");
            var element1 = angular.element('<input type="text" ng-model="user.name"/>');
            var element2 = angular.element('<input type="text" ng-model="user.lastname"/>');
            directive.append(element1);
            directive.append(element2);

            compile(directive)(scope);
            element1 = angular.element(directive.find('input')[0]);
            element2 = angular.element(directive.find('input')[1]);
            expect(element1.attr('aa-valid-icon')).toEqual('');
            expect(element1.prop('required')).toBeTruthy();
            expect(element1.attr('ng-minlength')).toEqual('1');
            expect(element2.attr('aa-valid-icon')).toEqual('');
            expect(element2.prop('required')).toBeTruthy();
            expect(element2.attr('ng-minlength')).toEqual('2');
        });

    });
});