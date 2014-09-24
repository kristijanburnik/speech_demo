app

.service("DemoSpeechRecognition",function( $rootScope , SpeechRecognition , AudioAnalyzer , Visualizer ){

  return function() {

    $rootScope.sr = SpeechRecognition;
    $rootScope.events = [];

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
      .on('start',function(event){
         $rootScope.events.push({type:'onstart',severity:'primary',event:event});

         // No visualizer available when getting audio from browser side.
         if ( !SpeechRecognition.isUsingMediaStreamTrack() )
            return;

         Visualizer.init();

         AudioAnalyzer
          .attachStream( SpeechRecognition.getStream() )
          .onUpdate(function( data ){
              Visualizer.update( data );
          })
         ;

      })
      .on('error',function(event){
        $rootScope.events.push({type:'onerror',severity:'danger',event:event});
      })
      .on('end',function(event){
        $rootScope.events.push({type:'onend',severity:'warning',event:event});
        SpeechRecognition.start();
      })
      .on('result',function(event){
        $rootScope.events.push({type:'onresult',severity:'success',event:event});
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

