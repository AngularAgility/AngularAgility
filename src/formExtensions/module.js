/*globals angular */

/**
 * @object
 * @name aaNotifyConfigProvider
 *
 * @description
 * This module contains the form extension directives that are used to easily generate
 * angular form elements using an external configuration.
 **/

(function () {
  'use strict';

  angular.module('aa.formExtensions', ['aa.notify'])
    .config(['aaNotifyConfigProvider', '$httpProvider', '$provide', function (aaNotifyConfigProvider, $httpProvider, $provide) {

      //register a notifyConfig to be used by default for displaying validation errors in forms
      //**if this doesn't work for you by all means register a new one with the same key!**
      aaNotifyConfigProvider.addOrUpdateNotifyConfig('aaFormExtensionsValidationErrors', {
        template: '<div class="alert alert-danger aa-form-extensions-validation-errors">' +
          '<div class="pull-right aa-notify-close" ng-click="close(notification)">' +
          '<span class="fa-stack fa-lg">' +
          '<i class="fa fa-circle fa-stack-2x"></i>' +
          '<i class="fa fa-times fa-stack-1x fa-inverse"></i>' +
          '</span>' +
          '</div>' +
          '<strong>{{notification.getValidationTitle()}}: </strong>' +
          '<ul>' +
          '<li ng-repeat="error in notification.validationErrorsToDisplay()">' +
          '{{ error.message }}&nbsp;' +
          '<a href="" title="Focus Field" ng-show="error.field" ng-click="notification.showField(error)"><i class="fa fa-search"></i></a>' +
          '</li>' +
          '</ul>' +
          '</div>',
        options: {
          ttl: 0, //forever until manually removed by form extensions
          showField: function (error) {
            error.field.$element[0].focus();
          }
        }
      });


      //setup ajax watcher that tracks loading, this is useful by its self
      //and is required for changed tracking
      //NOTE: if you do non Angular AJAX you will need to call increment/decrement yourself
      $provide.factory('aaLoadingWatcher', ['$rootScope', 'aaFormExtensions', 'aaUtils', function ($rootScope, aaFormExtensions, aaUtils) {
        var pendingRequests = 0;

        var debouncedLoadingChanged = aaFormExtensions.aaIsLoadingDoneDebounceMS ?
          aaUtils.debounce(loadingChanged, aaFormExtensions.aaIsLoadingDoneDebounceMS) : loadingChanged;

        var watcher = {
          isLoading: false,
          increment: function () {
            pendingRequests++;
            loadingChanged();
          },
          decrement: function () {
            pendingRequests--;
            debouncedLoadingChanged();
          }
          //perhaps add a 'runWhenDoneLoading' here
        };


        function loadingChanged() {
          $rootScope.aaIsLoading = watcher.isLoading = pendingRequests > 0;
          $rootScope.$broadcast('aaIsLoading', watcher.isLoading);

          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

        return watcher;
      }]);

      //tracks JUST ANGULAR http requests.
      $provide.factory('aaAjaxInterceptor', ['aaLoadingWatcher', '$q', 'aaFormExtensions',
        function (aaLoadingWatcher, $q, aaFormExtensions) {

          function shouldIgnore(config) {
            return config.aaIsLoadingIgnore === true || 
              config.cached ||
              (aaFormExtensions.aaIsLoadingIgnoreTemplate && 
                config.url &&
                config.url.indexOf('.html') > -1);
          }

          return {
            request: function (request) {
              if(!shouldIgnore(request)) {
                aaLoadingWatcher.increment();
              }
              return request;
            },
            response: function (response) {
              if(!shouldIgnore(response.config)) {
                aaLoadingWatcher.decrement();
              }
              return response;
            },
            responseError: function (response) {
              if(!shouldIgnore(response.config)) {
                aaLoadingWatcher.decrement();
              }

              if (aaFormExtensions.ajaxValidationErrorMappingStrategy) {
                aaFormExtensions.ajaxValidationErrorMappingStrategy(
                  response, aaFormExtensions.availableForms
                );
              }

              return $q.reject(response);
            }
          };
        }]);
      $httpProvider.interceptors.push('aaAjaxInterceptor');


      //allows for any controller to inject in $aaFormExtensions to *eventually* talk to any form that may show
      //up in the DOM without coupling:
      //
      //broacast doesn't seem to be the best choice here because parent controllers are always created
      //prior to their child forms.  the only other thing I could think of would be to use $timeout to allow
      //the form(s) to init and then a broadcast to run but this would have the issue of REQUIRING
      //this helper to have the controller scope passed in (don't want to broadcast these messages on rootscope
      //because there very well could be other forms that we don't want to accidentally mess with)
      //
      //the below will run on the first child form (or targetFormName matching child form) that appears
      $provide.decorator('$controller', ['$delegate', function ($delegate) {
        return function (expression, locals) {
          if (!locals.$aaFormExtensions /* <--unit testing only*/ && locals.$scope) {
            locals.$aaFormExtensions = {

              $addChangeDependency: function (expr, deepWatch, /*optional*/
                                              targetFormName /*optional*/) {
                addTodo({
                  type: '$addChangeDependency',
                  args: [expr, deepWatch],
                  targetFormName: targetFormName
                });
              },

              $resetChanged: function (targetFormName /*optional*/) {
                addTodo({
                  type: '$resetChanged',
                  args: [],
                  targetFormName: targetFormName
                });
              },

              $reset: function (shouldNotConfirmReset, /*optional*/
                                targetFormName /*optional*/) {
                addTodo({
                  type: '$reset',
                  args: [shouldNotConfirmReset],
                  targetFormName: targetFormName
                });
              },

              $clearErrors: function (targetFormName /*optional*/) {
                addTodo({
                  type: '$clearErrors',
                  args: [],
                  targetFormName: targetFormName
                });
              },

              $addValidationError: function (messageText, optionalFieldNamesOrFieldReferences, targetFormName /*optional*/) {
                addTodo({
                  type: '$addValidationError',
                  args: [messageText, optionalFieldNamesOrFieldReferences],
                  targetFormName: targetFormName
                });
              }
            };
          }

          function addTodo(todo) {
            if (!locals.$scope.$$aaFormExtensionsTodos) {
              locals.$scope.$$aaFormExtensionsTodos = [];
            }
            locals.$scope.$$aaFormExtensionsTodos.push(todo);
          }

          return $delegate.apply(this, arguments);
        };
      }]);
    }]);
})();
