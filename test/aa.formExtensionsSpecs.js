describe('aa.formExtensinos.js >', function () {
    beforeEach(module('aa.formExtensions'));

    describe('aaAutoField >', function () {
        var scope, form, element;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();

            form = angular.element('<div ng-form="exampleForm"></div>');
            element = angular.element('<input type="email" aa-auto-field="testEmail">');
            form.append(element);

            $compile(form)(scope);
        }));

        it('copies field name to ng-model', function () {
            expect(element.attr('ng-model')).toEqual('testEmail');
        });
    });
});