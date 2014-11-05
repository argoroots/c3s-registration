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



var PAGE_URL       = 'http://c3sregistration.studyitin.ee/'
var API_URL        = 'https://hitsa.entu.ee/api2/'
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
            .when('/:application_id/:application_key', {
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
            if(!$scope.email) return

            $scope.sending = true
            $scope.key = makeKey()
            $http({
                    method : 'POST',
                    url    : API_URL + 'entity-619',
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
                                    url    : API_URL + 'entity-' + $scope.id + '/rights',
                                    data   : getSignedData(API_USER, API_KEY, {
                                        'entity': API_USER
                                    })
                                })
                                .success(function(data) {
                                    $http({
                                            method : 'POST',
                                            url    : API_URL + 'email',
                                            data   : getSignedData(API_USER, API_KEY, {
                                                'to': $scope.email,
                                                'subject': '2015 Cyber Security Summer School',
                                                'message': 'Here is the link to your personal application form of the 2015 Cyber Security Summer School. Please keep it safe, you will need it until the end of Summer School.<br>\n<br>\n<a href="' + url + '">' + url + '</a><br>\n<br>\nDo not share it!'
                                            })
                                        })
                                        .success(function(data) {
                                            $scope.sending = false
                                            $scope.sent = true
                                        })
                                        .error(function(data) {
                                            cl(data.error)
                                            $scope.sending = false
                                        })
                                })
                                .error(function(data) {
                                    cl(data.error)
                                    $scope.sending = false
                                })
                        })
                        .error(function(data) {
                            cl(data.error)
                            $scope.sending = false
                        })
                })
                .error(function(data) {
                    cl(data.error)
                    $scope.sending = false
                })
        }
    }])



// APPLICATION
    .controller('applicationCtrl', ['$scope', '$http', '$routeParams', '$location', '$timeout', function($scope, $http, $routeParams, $location, $timeout) {
        $scope.application = {}

        $http({
                method : 'GET',
                url    : API_URL + 'entity-' + $routeParams.application_id,
                params : getSignedData($routeParams.application_id, $routeParams.application_key, {})
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
            var target = e.target || e.srcElement
            var field = angular.element(target).attr('id')
            var property = 'c3sregistration-' + field.replace('_', '-')

            if(!$scope.application[field]) return
            if(!$scope.application[field].old && $scope.application[field].value || $scope.application[field].value != $scope.application[field].old) {
                $scope.sending = true

                if($scope.application[field].id) property += '.' + $scope.application[field].id

                var properties = {}
                properties[property] = $scope.application[field].value

                $http({
                        method : 'PUT',
                        url    : API_URL + 'entity-' + $routeParams.application_id,
                        data   : getSignedData($routeParams.application_id, $routeParams.application_key, properties)
                    })
                    .success(function(data) {
                        var property = 'c3sregistration-' + field.replace('_', '-')
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
                        cl(data.error)
                        $scope.sending = false
                    })
            }
        }

        $scope.fakeSave = function() {
            $scope.sending = true
            $timeout(function() {
                $scope.sending = false
            }, 2000)
        }

        $scope.doFileUpload = function(e) {
            $scope.sending = true

            var field = e.id
            var file  = e.files[0]
            var xhr   = new XMLHttpRequest()
            var form  = new FormData()

            var form_data = getSignedData($routeParams.application_id, $routeParams.application_key, {
                entity   : $routeParams.application_id,
                property : 'c3sregistration-' + field.replace('_', '-'),
                filename : file.name
            })

            for(var i in form_data) {
                form.append(i, form_data[i])
            }
            form.append('file', file)

            xhr.upload.addEventListener('progress', function (ev) {
                if(!ev.lengthComputable) return
                $scope.application[field] = {
                    progress: (ev.loaded * 100 / ev.total - 0.1).toFixed(1)
                }
                $scope.$apply()
            }, false)

            xhr.onreadystatechange = function(ev) {
                if(xhr.readyState != 4) return
                if(xhr.status == 200) {
                    var property = 'c3sregistration-' + field.replace('_', '-')
                    var data = JSON.parse(xhr.response)

                    if(data.result.properties[property]) {
                        $scope.application[field] = {
                            id: data.result.properties[property][0].id,
                            old: data.result.properties[property][0].value,
                            value: data.result.properties[property][0].value
                        }
                        $scope.$apply()
                    } else {
                        $scope.application[field] = {}
                        $scope.$apply()
                    }
                    $scope.sending = false
                } else {
                    cl(xhr)
                    $scope.application[field] = {}
                    $scope.$apply()
                }
            }

            xhr.open('POST', API_URL + 'file', true)
            xhr.send(form)
        }

        $scope.doFileDelete = function(field, id) {

            if(!window.confirm('Are you sure, you want to delete this file?')) return

            var properties = {}

            properties['c3sregistration-' + field.replace('_', '-') + '.' + id] = ''

            $http({
                    method : 'PUT',
                    url    : API_URL + 'entity-' + $routeParams.application_id,
                    params : getSignedData($routeParams.application_id, $routeParams.application_key, properties)
                })
                .success(function(data) {
                    delete $scope.application[field]
                })
                .error(function(data) {
                    cl(data.error)
                })
        }

        $scope.doCancel = function() {

            if(!window.confirm('Are you sure, you want to cancel your application? If you change your mind later, you must start over again.')) return

            $http({
                    method : 'DELETE',
                    url    : API_URL + 'entity-' + $routeParams.application_id,
                    params : getSignedData($routeParams.application_id, $routeParams.application_key, {})
                })
                .success(function(data) {
                    $location.path('/')
                })
                .error(function(data) {
                    cl(data.error)
                })
        }
    }])
