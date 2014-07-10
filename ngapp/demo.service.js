app

.service("DemoSpeechRecognition",function( $rootScope , SpeechRecognition , AudioAnalyzer , Visualizer ){

  return function() {
  

  
    $rootScope.sr = SpeechRecognition;

    $rootScope.transcript = {
       'interim':"",
       'final':"",    
    };
     
    var final_transcript = "";    
    
    SpeechRecognition
      .init()
      .on('invalidate',function(){
        if ( ! $rootScope.$$phase )
          $rootScope.$digest();
      })
      .on('start',function(){
      
         Visualizer.init();
        
         AudioAnalyzer
          .attachStream( SpeechRecognition.getStream() )
          .onUpdate(function( data ){     
              Visualizer.update( data );
          })
         ;
         
      })
      .on('end',function(){
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
      });
    
    return SpeechRecognition;
  
  }

})

