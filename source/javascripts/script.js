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



var PAGE_URL       = 'http://hitsa.github.io/c3s-registration/'
var API_URL        = 'https://dev.entu.ee/api2/'
var API_FOLDER     = 619
var API_DEFINITION = 'c3sregistration'
var API_USER       = 621
var API_KEY        = '2jBg6SXqqxd3Z8Qas3fAM47wyDC4W6aJ'

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
        $scope.sendLink = function() {
            $scope.sending = true
            $scope.key = makeKey()
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
        $scope.application = {}

        $http({
                method : 'GET',
                url    : API_URL + 'entity-' + $routeParams.application_id,
                params : getSignedData($routeParams.application_id, $routeParams.key, {})
            })
            .success(function(data) {
                for (key in data.result.properties) {
                    if(data.result.properties[key].values) {
                        $scope.application[key.replace('-', '_')] = {
                            id: data.result.properties[key].values[0].id,
                            old: data.result.properties[key].values[0].value,
                            value: data.result.properties[key].values[0].value
                        }
                    }
                }
            })
            .error(function(data) {
                $location.path('/')
            })

        $scope.doSave = function(e) {
            var field = angular.element(e.srcElement).attr('id')
            var property = API_DEFINITION + '-' + field.replace('_', '-')

            if(!$scope.application[field]) return
            if(!$scope.application[field].old && $scope.application[field].value || $scope.application[field].value != $scope.application[field].old) {
                $scope.sending = true

                if($scope.application[field].id) property += '.' + $scope.application[field].id

                var properties = {}
                properties[property] = $scope.application[field].value

                $http({
                        method : 'PUT',
                        url    : API_URL + 'entity-' + $routeParams.application_id,
                        data   : getSignedData($routeParams.application_id, $routeParams.key, properties)
                    })
                    .success(function(data) {
                        var property = API_DEFINITION + '-' + field.replace('_', '-')
                        if(data.result.properties[property]) {
                            $scope.application[field] = {
                                id: data.result.properties[property][0].id,
                                old: data.result.properties[property][0].value,
                                value: data.result.properties[property][0].value
                            }
                        } else {
                            $scope.application[field] = {}
                        }
                        $scope.sending = false
                    })
                    .error(function(data) {
                        $scope.sending = false
                    })
            }
        }

    }])
