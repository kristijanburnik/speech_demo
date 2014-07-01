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

.controller("MainController",function( Menu , $rootScope, DemoSpeechRecognition ){

  $rootScope.menu = Menu;
  
})

.controller("MicrophoneController",function( Menu , DemoSpeechRecognition ){
  
  Menu.set('microphone'); 
  DemoSpeechRecognition().streamMicrophone();
  
})

.controller("RecordedController",function( Menu , $rootScope, DemoSpeechRecognition ){

  Menu.set('recorded');
  var url = "audio_long16.wav";     
  DemoSpeechRecognition().streamAudioFile( url );

});


