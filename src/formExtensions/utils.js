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
        }
      };
    });
})();
