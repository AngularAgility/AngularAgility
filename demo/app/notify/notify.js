angular.module('angularAgilityDemo')
    .controller('notify', function($scope, aaNotify, $timeout) {

        $scope.trySuccess = function() {
            //the default notifyConfig sets the life to 4 seconds
            //you can tweak this globally or add your own default notifyConfig
            aaNotify.success('Example success message!');
        };

        $scope.tryInfo = function() {
            //configure to 1 second life here only
            aaNotify.info('Example info message!', { ttl: 1000 });
        };

        $scope.tryWarning = function() {
            var handle = aaNotify.warning('Example warning message!', { ttl: 999999999 });

            //whoops that message is going to be around a little *too* long with that ttl.
            //use the handle to remove it after only 4 seconds
            $timeout(function() { aaNotify.remove(handle); }, 4000);

        };

        $scope.tryDanger = function() {
            aaNotify.danger('Example danger message!',
                {
                    //any args here end up on the notification template's scope...
                    //In other words you can register a different template
                    //and *do whatever you want* for a notification!
                    //if you like the sound of this keep scrolling...
                    showClose: true,
                    iconClass: 'fa fa-exclamation-triangle',
                    ttl: 0 //forever
                });
        };

        $scope.notifyBuilder = function() {

            aaNotify[$scope.type]($scope.message, { ttl: $scope.ttl});

            $scope.message = null;
            $scope.type = null;
            $scope.ttl =  null;
        };
    });