app


.service("Menu",function( ){

  var t = {
    section:null,
    set:function( section ) {
        t.section = section;
    }
  };

  return t;

})


.controller("MainController",function( Menu , $rootScope, SpeechRecognition  ){

  $rootScope.menu = Menu;
  $rootScope.sr = SpeechRecognition.init();

})

.controller("MicrophoneController",function( Menu , $rootScope , DemoSpeechRecognition ){
  Menu.set('microphone');
  $rootScope.sr = DemoSpeechRecognition();

})

.controller("RecordedController",function(
  Menu , $scope , $rootScope, DemoSpeechRecognition , $http ){

  Menu.set('recorded');

  $scope.currentSample = null;
  $scope.selectSample = function( sample ){
     $scope.currentSample = sample;
  }

  $scope.startRecognition = function ( sample ) {
    DemoSpeechRecognition().streamAudioFile( sample.filename );
  }

  $http.get('samples.json')
    .then(function(res) {
      $scope.samples = res.data
    })

});


