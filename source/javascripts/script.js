function cl(d) {
    console.log(d)
}



function getSignedData(user, key, data) {
    if(!user || !key) return

    var conditions = []
    for(k in data) {
        conditions.push({k: data[k]})
    }

    var expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() + 10)

    data['user'] = user
    data['policy'] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify({expiration: expiration.toISOString(), conditions: conditions})))
    data['signature'] = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(data['policy'], key))

    return data
}



function makeKey() {
    var text = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for(var i=0; i < 64; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}



var PAGE_URL   = 'http://hitsa.github.io/c3s-registration/'
var API_URL    = 'https://dev.entu.ee/api2/'
var API_FOLDER = 619
var API_USER   = 621
var API_KEY    = '2jBg6SXqqxd3Z8Qas3fAM47wyDC4W6aJ'

angular.module('s3cApp', ['ngRoute', 'ngResource'])



// ROUTER
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        // $locationProvider.html5Mode(true)
        $routeProvider
            .when('/', {
                templateUrl: 'start',
                controller: 'startCtrl'
            })
            .when('/:application_id/:key', {
                templateUrl: 'application',
                controller: 'applicationCtrl'
            })
            .otherwise({
                redirectTo: '/'
            })
    }])



// START
    .controller('startCtrl', ['$scope', '$http', function($scope, $http) {

        $scope.key = makeKey()

        $scope.sendLink = function() {
            $scope.sending = true
            $http({
                    method : 'POST',
                    url    : API_URL + 'entity-' + API_FOLDER,
                    data   : getSignedData(API_USER, API_KEY, {
                        'definition': 'c3sregistration',
                        'c3sregistration-email': $scope.email,
                        'c3sregistration-entu-api-key': $scope.key
                    })
                })
                .success(function(data) {
                    $scope.id = data.result.id
                    $http({
                            method : 'POST',
                            url    : API_URL + 'entity-' + $scope.id + '/rights',
                            data   : getSignedData(API_USER, API_KEY, {
                                'entity': $scope.id,
                                'right': 'editor'
                            })
                        })
                        .success(function(data) {
                            var url = PAGE_URL + '#/' + $scope.id + '/' + $scope.key
                            $http({
                                    method : 'POST',
                                    url    : API_URL + 'email',
                                    data   : getSignedData(API_USER, API_KEY, {
                                        'to': $scope.email,
                                        'subject': '2015 Cyber Security Summer School',
                                        'message': 'Here is the link to your personal application form of 2015 Cyber Security Summer School:\n\n' + url + '\n\nDo not share it!'
                                    })
                                })
                                .success(function(data) {
                                    $scope.sending = false
                                    $scope.sent = true
                                })
                                .error(function(data) {
                                    cl(data)
                                    $scope.sending = false
                                })
                        })
                        .error(function(data) {
                            $scope.sending = false
                        })
                })
                .error(function(data) {
                    $scope.sending = false
                })
        }

    }])



// APPLICATION
    .controller('applicationCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
        $http({
                method : 'GET',
                url    : API_URL + 'entity-' + $routeParams.application_id,
                params : getSignedData($routeParams.application_id, $routeParams.key, {})
            })
            .success(function(data) {
                cl(data)
                // $scope.request_count += 1
                // try        { $scope.title = data.result.displayname }
                // catch(err) { $scope.title = '' }
                // try        { $scope.description = data.result.properties.pollheader.values[0].value }
                // catch(err) { $scope.description = '' }
                // try        { $scope.howto = data.result.properties.pollhowto.values[0].value }
                // catch(err) { $scope.howto = '' }
            })
            .error(function(data) {
                cl(data)
                // $location.path('/')
            })


    }])
