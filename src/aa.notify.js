/*
 * AngularAgility Notify
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2014 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function () {
    'use strict';
    angular.module('aa.notify', [])

        // aaNotify.success(
        // aaNotify.info(
        // aaNotify.warning(
        // aaNotify.danger/.error( (same thing)
        .factory('aaNotify', function (aaNotifyConfig, $rootScope) {

            return {
                //simple api uses aaNotifyConfigProvider.defaultNotifyConfig
                success: function (message, options) {
                    return this.add(angular.extend({ message: message, messageType: 'success'}, options));
                },
                info: function (message, options) {
                    return this.add(angular.extend({ message: message, messageType: 'info'}, options));
                },
                warning: function (message, options) {
                    return this.add(angular.extend({ message: message, messageType: 'warning'}, options));
                },
                danger: function (message, options) {
                    return this.add(angular.extend({ message: message, messageType: 'danger'}, options));
                },
                error: function (message, options) {
                    return this.add(angular.extend({ message: message, messageType: 'error'}, options));
                },

                //complicated API with full options
                //options:                  NULLABLE: whatever you want the scope.options to be when the template is rendered
                //targetContainerName:      NULLABLE: what aa-notify directive (container-name) do you wish to target?
                //notifyConfig:             NULLABLE: which notification configuration should be used?
                //                          Either string for a previously registered one OR one off as an object
                add: function (options, targetContainerName, notifyConfig) {

                    //resolve notify config to a config object.. could be a string
                    notifyConfig = notifyConfig || aaNotifyConfig.notifyConfigs[aaNotifyConfig.defaultNotifyConfig];
                    if(angular.isString(notifyConfig)) {
                        notifyConfig = aaNotifyConfig.notifyConfigs[notifyConfig];
                    }

                    targetContainerName = targetContainerName || notifyConfig.defaultTargetContainerName;
                    options = angular.extend(notifyConfig.options, options);

                    //resolve the notification configuration object to use
                    options.$messageHandle = {};

                    $rootScope.$broadcast('aaNotifyContainer-' + targetContainerName + '-add',
                        {
                            notifyConfig: notifyConfig,
                            options: options
                        });

                    return options.$messageHandle; //allow for removing of the message later with this handle and the func below...
                },

                remove: function (containerName, messageHandle) {
                    $rootScope.$broadcast('aaNotifyContainer-' + containerName + '-remove', messageHandle);
                }
            };
        })

        //place the directive wherever you'd like with whatever classes you'd like to position it
        .directive('aaNotify', function ($timeout) {
            return {
                template:
                    '<div class="aa-notify-container">' +
                        '<div ng-repeat="notification in notifications">' +
                            '<div ng-include="notification.template"></div>' +
                        '</div>' +
                    '</div>',
                replace: true,
                link: function (scope, element, attrs) {

                    scope.notifications = [];

                    //this aa-notify will listen on container-name
                    var containerName = attrs.containerName || 'default';

                    scope.$on('aaNotifyContainer-' + containerName + '-add', function(args) {

                        var notification = {
                            options: args.options,
                            template: args.notifyConfig.templateUrl || args.notifyConfig.template
                        };

                        scope.notifications.push(notification);

                        if(args.options.ttl > 0) {
                            $timeout(function() {

                                scope.notifications.remove(notification);

                            }, args.options.ttl);
                        }
                    });

                    scope.$on('aaNotifyContainer-' + containerName + '-remove', function(messageHandle) {

                    });
                }
            };
        })

        .provider('aaNotifyConfig', function ($templateCache) {

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
            self.addNotifyConfig = function (name, opts) {

                var config = self.notifyConfigs[name] = self.notifyConfigs[name] || {};

                if (opts.template) {
                    config.templateName = name;
                    $templateCache.put(config.templateName, opts.template);
                }

                config.templateUrl = opts.templateUrl;
                config.options = opts.options;
            };


            //SETUP THE DEFAULT CONFIGURATION
            // USED BY DEFAULT FOR ALL:
            // aaNotify.success(
            // aaNotify.info(
            // aaNotify.warning(
            // aaNotify.danger/.error( (same thing)
            //set a new one with aaNotifyConfigProvider.addConfig(...)  AND  aaNotifyConfigProvider.setDefaultConfig(...)
            self.addNotifyConfig('default',
                {
                    //this is the 'per notification' template that is ng-repeated
                    template:
                        '<div class="aa-notify alert" ng-class="cssClasses">' +
                        '{{options.message}}' +
                        '</div>',
                    options: {
                        ttl: 4000 //overridable on a per-call basis
                    },
                    defaultTargetContainerName: 'default',
                    optionsTransformer: function(options) {
                        //transform the options of each message however you want right before it shows up
                        //in this case options is being customized for twitter bootstrap 2/3 based on the notification type

                        if(options.messageType === 'success') {
                            options.cssClasses += 'alert-success';

                        } else if(options.messageType === 'info') {
                            options.cssClasses += 'alert-info';

                        } else if(options.messageType === 'warning') {
                            options.cssClasses += 'alert-warning';

                        } else if(options.messageType === 'danger' || options.messageType === 'error') {
                            options.cssClasses += 'alert-danger alert-error'; //support old/new bootstrap
                        }
                    }
                }
            );
            self.setDefaultNotifyConfig = function(defaultName) {
                self.defaultNotifyConfig = defaultName;
            };
            self.defaultNotifyConfig = 'default';

            this.$get = function () {
                return {
                    notifyConfigs: self.notifyConfigs,
                    defaultNotifyConfig: self.defaultNotifyConfig
                };
            };
        });
})();
