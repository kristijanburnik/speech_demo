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


.controller("MicrophoneController",function( Menu , $rootScope , SpeechRecognition ){
  Menu.set('microphone');
  
  
  $rootScope.sr = SpeechRecognition;
  
  SpeechRecognition
    .requestUserMedia(function( allowed ){
       if ( allowed )
           SpeechRecognition.streamMicrophone()
                           
      
      
      console.log("User Media decided, allowed = ", allowed);
      
      $rootScope.$digest();
      
    })
    .onStart(function(){
      $rootScope.$digest();
    })
    ;
      
  
})



.controller("RecordedController",function( Menu ){
  Menu.set('recorded');

});


