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


.controller("MainController",function( Menu , $rootScope , SpeechRecognition ){


  $rootScope.menu = Menu;
  
  $rootScope.sr = SpeechRecognition;
  

  
  console.info( "SR availability" , SpeechRecognition.isAvailable() );
  
  
})


.controller("MicrophoneController",function( Menu , $rootScope , SpeechRecognition , AudioAnalyzer ){
  Menu.set('microphone');
  
  
  $rootScope.sr = SpeechRecognition;
  
  SpeechRecognition
    .requestUserMedia(function( allowed ){
       if ( allowed )
           SpeechRecognition.streamMicrophone();
      
      /* // experimental                     
      AudioAnalyzer.attachStream( SpeechRecognition.getStream() ) ;
      $rootScope.freqData = AudioAnalyzer.data;
      */
      
      console.log("User Media decided, allowed = ", allowed);
      
      
      $rootScope.$digest();
      
    })
    .on('start',function(){
      $rootScope.$digest();
    })
    .on('end',function(){
       $rootScope.$digest();
    })
    ;
      
  
})



.controller("RecordedController",function( Menu , $rootScope, SpeechRecognition ){
  Menu.set('recorded');
  
  // todo: place to view
  var url = "audio_long16.wav";
  
  $rootScope.sr = SpeechRecognition;
  
  $rootScope.transcript = {
    'interim':"",
    'final':"",    
  };
     
  SpeechRecognition.streamAudioFile( url );
  
  var final_transcript = "";
     
  SpeechRecognition
    .on('start',function(){
      $rootScope.$digest();
    })
    .on('end',function(){
       $rootScope.$digest();
    })
    .on('result',function(event){
      var interim_transcript = '';
      if (typeof(event.results) == 'undefined') {
        // recognition.onend = null;
        SpeechRecognition.stop();
        return;
      }
      
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
          final_transcript += '\n';
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      
      $rootScope.transcript.interim = interim_transcript;
      $rootScope.transcript.final = final_transcript;
      
      // console.log( ["interim" , interim_transcript ] , [ "final" , final_transcript ] );
      $rootScope.$digest();


    })
    ;
  
  

});


