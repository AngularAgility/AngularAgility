angular.module('angularAgilityDemo')
  .controller('notify', function ($scope, aaNotify, $timeout) {
    'use strict';
    $scope.trySuccess = function () {
      //the default notifyConfig sets the life to 4 seconds
      //you can tweak this globally or add your own default notifyConfig
      aaNotify.success('Example success message!');
    };

    $scope.tryInfo = function () {
      //configure to 1 second life here only
      aaNotify.info('Example info message!', { ttl: 1000 });
    };

    $scope.tryWarning = function () {
      var handle = aaNotify.warning('Example warning message!', { ttl: 999999999 });

      //whoops that message is going to be around a little *too* long with that ttl.
      //use the handle to remove it after only 4 seconds
      $timeout(function () {
        aaNotify.remove(handle);
      }, 4000);

    };

    $scope.tryDanger = function () {
      aaNotify.danger('Example danger message!<br/><br/><br/>This text after some &lt;br/&gt;s',
        {
          //You can register many different templates and
          //*do whatever you want* for a notification, wherever/however you want!
          //(you aren't bound by this dev's idea of what a notification should look like)
          //if you like the sound of this keep scrolling to Advanced Mode below...

          //the default template has these options
          //*if you don't like them *easily* make your own template!*
          showClose: true,                            //close button
          iconClass: 'fa fa-exclamation-triangle',    //iconClass for a <i></i> style icon to use
          allowHtml: true,                            //allows HTML in the message to render as HTML

          //common to the framework as a whole
          ttl: 0  //time to live in ms
        });
    };

    $scope.notifyBuilder = function () {

      aaNotify[$scope.type]($scope.message, { ttl: $scope.ttl});

      $scope.message = null;
      $scope.type = null;
      $scope.ttl = null;
    };
  });