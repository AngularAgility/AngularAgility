describe('aa.formExtensions.js >', function() {
    beforeEach(module('aa.formExtensions'));

    describe('aaValMsg >', function() {
        var scope, form, element;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();

            form = angular.element('<div ng-form="exampleForm"></div>');
            element = angular.element('<input type="email" ng-model="current.user.email" name="current.user.email" aa-val-msg >');
            form.append(element);

            $compile(form)(scope);
        }));

        it('handles many dots', function() {
	    //just make sure there is no exceptions
        });
    });
});