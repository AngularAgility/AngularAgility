/**
 * @ngdoc directive
 * @name aaNotify
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';
  angular.module('aa.notify', [])

    // aaNotify.success(
    // aaNotify.info(
    // aaNotify.warning(
    // aaNotify.danger/.error( (same thing)
    .factory('aaNotify', ['aaNotifyConfig', '$rootScope', '$sce', function (aaNotifyConfig, $rootScope, $sce) {

      return {
        //simple api uses aaNotifyConfigProvider.defaultNotifyConfig
        success: function (message, options) {
          return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.success(message, options, this);
        },
        info: function (message, options) {
          return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.info(message, options, this);
        },
        warning: function (message, options) {
          return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.warning(message, options, this);
        },
        danger: function (message, options) {
          return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.danger(message, options, this);
        },
        error: function (message, options) {
          return aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].namedDefaults.error(message, options, this);
        },

        //complicated API with full options
        //options:                  NULLABLE: whatever you want the scope.options to be when the template is rendered
        //targetContainerName:      NULLABLE: what aa-notify directive (container-name) do you wish to target?
        //notifyConfig:             NULLABLE: which notification configuration should be used?
        //                          Either string for a previously registered one OR one off as an object
        add: function (options, targetContainerName, notifyConfig) {

          //resolve notify config to a config object.. could be a string
          notifyConfig = notifyConfig || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig];
          if (angular.isString(notifyConfig)) {
            notifyConfig = aaNotifyConfig.notifyConfigs[notifyConfig];
          }

          targetContainerName = targetContainerName || notifyConfig.defaultTargetContainerName;
          options = angular.extend(angular.copy(notifyConfig.options), options);

          //resolve the notification configuration object to use
          options.messageHandle = {};

          if (notifyConfig.optionsTransformer) {
            notifyConfig.optionsTransformer(options, $sce);
          }

          options.template = notifyConfig.templateUrl || notifyConfig.templateName;

          $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-add', options);

          return options.messageHandle; //allow for removing of the message later with this handle and the func below...
        },

        remove: function (messageHandle, targetContainerName) {
          targetContainerName = targetContainerName || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].defaultTargetContainerName;
          $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-remove', messageHandle);
        },

        clearAll: function (targetContainerName) {
          targetContainerName = targetContainerName || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig].defaultTargetContainerName;
          $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-clearAll');
        }
      };
    }])

    //place the directive wherever you'd like with whatever classes you'd like to position it
    .directive('aaNotify', ['$timeout', function ($timeout) {
      return {
        template: '<div>' +
          '<div ng-repeat="notification in notifications" class="aa-notification">' +
          '<div ng-include="notification.template"></div>' +
          '</div>' +
          '</div>',
        replace: true,
        link: function (scope, element, attrs) {

          scope.notifications = [];

          //this aa-notify will listen on container-name
          var containerName = attrs.containerName || 'default';

          scope.$on('aaNotifyContainer-' + containerName + '-add', function (e, options) {

            if (options.replaceExisting) {
              scope.notifications.length = 0;
            }

            scope.notifications.push(options);

            if (options.ttl > 0) {
              $timeout(function () {

                var idx = scope.notifications.indexOf(options);
                if (idx > -1) {
                  scope.notifications.splice(idx, 1);
                }

              }, options.ttl);
            }
          });

          scope.$on('aaNotifyContainer-' + containerName + '-remove', function (e, messageHandle) {
            for (var i = scope.notifications.length - 1; i >= 0; i--) {
              if (scope.notifications[i].messageHandle === messageHandle) {
                scope.notifications.splice(i, 1);
                break;
              }
            }
          });

          scope.$on('aaNotifyContainer-' + containerName + '-clearAll', function () {
            scope.notifications.length = 0;
          });

          scope.close = function (notification) {
            scope.notifications.splice(scope.notifications.indexOf(notification), 1);

            if (angular.isFunction(notification.onClose)) {
              notification.onClose();
            }
          };
        }
      };
    }])

    .provider('aaNotifyConfig', function () {

      var self = this;

      //PUBLIC API
      self.notifyConfigs = {};

      //add a notify configuration (there are already a few built in defaults)
      //name: the name of the configuration
      //opts:
      //  template: the HTML for the template
      //  templateUrl: the url for the template
      //  defaultTargetContainerName: the default target container of this configuration
      //  options: overriable options that will be present on each notification of this configuration type
      //      ttl: MS that the notification lasts. falsey === forever
      //  optionsTransformer: do some last minute transform to the options right before the dialog is presented
      //                      useful for customizations
      self.addOrUpdateNotifyConfig = function (name, opts) {

        var config = self.notifyConfigs[name] = self.notifyConfigs[name] || {};
        config.name = name;
        angular.extend(config, opts);

        if (config.template) {
          config.templateName = 'aaNotifyTemplate-' + config.name;
        }
      };


      //SETUP THE DEFAULT CONFIGURATION
      // USED BY DEFAULT FOR ALL:
      // aaNotify.success(
      // aaNotify.info(
      // aaNotify.warning(
      // aaNotify.danger/.error( (same thing)
      //set a new one with aaNotifyConfigProvider.addConfig(...)  AND  aaNotifyConfigProvider.setDefaultConfig(...)
      self.addOrUpdateNotifyConfig('default',
        {
          //this is the 'per notification' template that is ng-repeated
          template: '<div class="alert aa-notify-notification" ng-class="notification.cssClasses">' +
            '<div class="pull-right aa-notify-close" ng-if="notification.showClose" ng-click="close(notification)">' +
            '<span class="fa-stack fa-lg">' +
            '<i class="fa fa-circle fa-stack-2x"></i>' +
            '<i class="fa fa-times fa-stack-1x fa-inverse"></i>' +
            '</span>' +
            '</div>' +
            '<i class="aa-notify-icon" ng-if="notification.iconClass" ng-class="notification.iconClass"></i>&nbsp;' +
            '<span ng-if="!notification.allowHtml" class="aa-notify-message">{{notification.message}}</span>' +
            '<span ng-if="notification.allowHtml" class="aa-notify-message" ng-bind-html="notification.message"></span>' +
            '</div>',
          options: {
            ttl: 4000,              //overridable on a per-call basis
            replaceExisting: false  //replace any existing messages. only one will show up at a time
          },
          namedDefaults: {
            success: function (message, options, notifier) {
              return notifier.add(angular.extend({ message: message, messageType: 'success'}, options));
            },
            info: function (message, options, notifier) {
              return notifier.add(angular.extend({ message: message, messageType: 'info'}, options));
            },
            warning: function (message, options, notifier) {
              return notifier.add(angular.extend({ message: message, messageType: 'warning'}, options));
            },
            danger: function (message, options, notifier) {
              return notifier.add(angular.extend({ message: message, messageType: 'danger'}, options));
            },
            error: function (message, options, notifier) {
              return notifier.add(angular.extend({ message: message, messageType: 'error'}, options));
            }
          },
          defaultTargetContainerName: 'default',
          optionsTransformer: function (options, $sce) {
            //transform the options of each message however you want right before it shows up
            //in this case options is being customized for twitter bootstrap 2/3 based on the notification type
            //this exists to allow partial template overrides (change logic but keep template)

            if (!options.cssClasses) {
              options.cssClasses = '';
            }

            if (options.messageType === 'success') {
              options.cssClasses += 'alert-success';

            } else if (options.messageType === 'info') {
              options.cssClasses += 'alert-info';

            } else if (options.messageType === 'warning') {
              options.cssClasses += 'alert-warning';

            } else if (options.messageType === 'danger' || options.messageType === 'error') {
              options.cssClasses += 'alert-danger alert-error'; //support old/new bootstrap
            }

            if (options.allowHtml) {
              options.message = $sce.trustAsHtml(options.message);
            }
          }
        }
      );
      self.defaultNotifyConfig = 'default';

      this.$get = function () {
        return {
          notifyConfigs: self.notifyConfigs,
          defaultNotifyConfig: self.defaultNotifyConfig
        };
      };
    })
    .run(['aaNotifyConfig', '$templateCache', function (aaNotifyConfig, $templateCache) {
      //add templates to the template cache if specified
      angular.forEach(aaNotifyConfig.notifyConfigs, function (config) {
        if (config.templateName) {
          $templateCache.put(config.templateName, config.template);
        }
      });
    }]);
})();
