function cl(d) {
    console.log(d)
}

var API_URL  = 'https://hitsa.entu.ee/api/'

angular.module('s3cApp', ['ngRoute', 'ngResource'])



// ROUTER
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        // $locationProvider.html5Mode(true)
        $routeProvider
            .when('/', {
                templateUrl: 'start',
                controller: 'startCtrl'
            })
            .when('/:id', {
                templateUrl: 'application',
                controller: 'applicationCtrl'
            })
            .otherwise({
                redirectTo: '/'
            })
    }])



// START
    .controller('startCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    }])



// APPLICATION
    .controller('applicationCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    }])
