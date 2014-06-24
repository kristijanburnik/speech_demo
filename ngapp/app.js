
var app = angular.module("SpeechRecognitionDemo",['ngRoute'],
function( $routeProvider , $locationProvider ){


  $routeProvider

    .when('/microphone', {
        templateUrl: 'ngapp/view/microphone.ngview.html',
        controller: 'MicrophoneController'
      })


    .when('/recorded', {
        templateUrl: 'ngapp/view/recorded.ngview.html',
        controller: 'RecordedController'
      })


    .otherwise({
      redirectTo: '/'
    })

  ;

  

});
