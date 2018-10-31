/*globals angular */
/**
 * @object
 * @name aaUtils
 *
 * @description
 * Description place holder.
 **/
(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .factory('aaUtils', function () {
      return {
        guid: function () {
          /*jshint bitwise: false*/
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        },

        toTitleCase: function (str) {
          return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        },

        splitCamelCase: function (str) {
          return str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
        },

        outerHTML: function (node) {
          // if IE, Chrome take the internal method otherwise build one
          return node.outerHTML || (function (n) {
            var div = document.createElement('div'), h;
            div.appendChild(n.cloneNode(true));
            h = div.innerHTML;
            div = null;
            return h;
          })(node);
        },

        stringFormat: function (format) {
          var args = Array.prototype.slice.call(arguments, 1);
          return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
          });
        },

        ensureaaFormExtensionsFieldExists: function (form, fieldName) {
          if(!form) {
            throw new Error('Form was ' + form);
          }

          if(!fieldName) {
            throw new Error('Form was ' + fieldName);
          }

          if (!form.$aaFormExtensions[fieldName]) {
            form.$aaFormExtensions[fieldName] = {
              showErrorReasons: [],
              $errorMessages: [],
              $element: null
            };
          }
        },

        arrayRemove: function (array, item) {
          if (!array || !item) {
            return;
          }

          var idx = array.indexOf(item);

          if (idx !== -1) {
            array.splice(idx, 1);
          }
        },

        //all parent forms need to know about a changed dependency, crawl up the graph to distribute to all of them
        recursivePushChangeDependency: function (form, dep) {
          form.$aaFormExtensions.$changeDependencies.push(dep);

          if (form.$aaFormExtensions.$parentForm) {
            this.recursivePushChangeDependency(form.$aaFormExtensions.$parentForm, dep);
          }
        },

        //call after changed has changed
        //recursively check this and each parent form for changed fields. set the form (and parent forms)
        //changed indicator accordingly
        recursiveParentCheckAndSetFormChanged: function (form) {

          this.checkAndSetFormChanged(form);

          if (form.$aaFormExtensions.$parentForm) {
            this.recursiveParentCheckAndSetFormChanged(form.$aaFormExtensions.$parentForm);
          }
        },

        //checks if a given form has any changes based on it's change dependencies
        checkAndSetFormChanged: function (form) {
          var hasAnyChangedField = false;

          angular.forEach(form.$aaFormExtensions.$changeDependencies, function (dep) {
            if (dep.isChanged) {
              hasAnyChangedField = true;
            }
          });

          form.$aaFormExtensions.$changed = hasAnyChangedField;
        },

        //https://github.com/lodash/lodash/blob/3.7.0/lodash.src.js#L7841
        debounce: function (func, wait, options) {
          /* jshint ignore:start */
          var args,
            maxTimeoutId,
            result,
            stamp,
            thisArg,
            timeoutId,
            trailingCall,
            lastCalled = 0,
            maxWait = false,
            trailing = true;

          function now() {
            return new Date().getTime();
          }

          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          wait = wait < 0 ? 0 : (+wait || 0);
          if (options === true) {
            var leading = true;
            trailing = false;
          } else if (angular.isObject(options)) {
            leading = options.leading;
            maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
            trailing = 'trailing' in options ? options.trailing : trailing;
          }

          function cancel() {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            if (maxTimeoutId) {
              clearTimeout(maxTimeoutId);
            }
            maxTimeoutId = timeoutId = trailingCall = undefined;
          }

          function delayed() {
            var remaining = wait - (now() - stamp);
            if (remaining <= 0 || remaining > wait) {
              if (maxTimeoutId) {
                clearTimeout(maxTimeoutId);
              }
              var isCalled = trailingCall;
              maxTimeoutId = timeoutId = trailingCall = undefined;
              if (isCalled) {
                lastCalled = now();
                result = func.apply(thisArg, args);
                if (!timeoutId && !maxTimeoutId) {
                  args = thisArg = null;
                }
              }
            } else {
              timeoutId = setTimeout(delayed, remaining);
            }
          }

          function maxDelayed() {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            maxTimeoutId = timeoutId = trailingCall = undefined;
            if (trailing || (maxWait !== wait)) {
              lastCalled = now();
              result = func.apply(thisArg, args);
              if (!timeoutId && !maxTimeoutId) {
                args = thisArg = null;
              }
            }
          }

          function debounced() {
            args = arguments;
            stamp = now();
            thisArg = this;
            trailingCall = trailing && (timeoutId || !leading);

            if (maxWait === false) {
              var leadingCall = leading && !timeoutId;
            } else {
              if (!maxTimeoutId && !leading) {
                lastCalled = stamp;
              }
              var remaining = maxWait - (stamp - lastCalled),
                isCalled = remaining <= 0 || remaining > maxWait;

              if (isCalled) {
                if (maxTimeoutId) {
                  maxTimeoutId = clearTimeout(maxTimeoutId);
                }
                lastCalled = stamp;
                result = func.apply(thisArg, args);
              }
              else if (!maxTimeoutId) {
                maxTimeoutId = setTimeout(maxDelayed, remaining);
              }
            }
            if (isCalled && timeoutId) {
              timeoutId = clearTimeout(timeoutId);
            }
            else if (!timeoutId && wait !== maxWait) {
              timeoutId = setTimeout(delayed, wait);
            }
            if (leadingCall) {
              isCalled = true;
              result = func.apply(thisArg, args);
            }
            if (isCalled && !timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
            return result;
          }
          debounced.cancel = cancel;
          return debounced;
          /* jshint ignore:end */
        }
      };
    });
})();
