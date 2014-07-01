app
.service('AudioAnalyzer',function( $rootScope ){
  var t = {
    data:[],
    analyserNode:null,
    updateAnalysers:function(time) {

      // analyzer draw code here
      var canvasWidth = 1000;
      var SPACING = 3;
      var BAR_WIDTH = 1;
      var numBars = Math.round( canvasWidth / SPACING );
      var freqByteData = new Uint8Array( t.analyserNode.frequencyBinCount );

      t.analyserNode.getByteFrequencyData(freqByteData); 

      var multiplier = t.analyserNode.frequencyBinCount / numBars;
      
      var maxMagnitude = 0;

      // Draw rectangle for each frequency bin.
      for (var i = 0; i < numBars; ++i) {
          var magnitude = 0;
          var offset = Math.floor( i * multiplier );
          // gotta sum/average the block, or we miss narrow-bandwidth spikes
          for (var j = 0; j< multiplier; j++)
              magnitude += freqByteData[offset + j];
          magnitude = magnitude / multiplier;
          t.data[i] = magnitude;
          
          maxMagnitude = Math.max( maxMagnitude , magnitude );
          
      }
      
       if ( maxMagnitude > 0 )
            console.log("Got stream level", maxMagnitude );

      
    },
  
    attachStream:function( stream ){
    
      console.log("AudioAnalyzer attached stream" , stream );
    
      var audioContext = new AudioContext();
      var inputPoint = audioContext.createGain();      
      var realAudioInput = audioContext.createMediaStreamSource( stream );
      realAudioInput.connect(inputPoint);

    //    audioInput = convertToMono( input );

      t.analyserNode = audioContext.createAnalyser();
      t.analyserNode.fftSize = 2048;
      inputPoint.connect( t.analyserNode );

      var zeroGain = audioContext.createGain();
      zeroGain.gain.value = 0.0;
      inputPoint.connect( zeroGain );
      zeroGain.connect( audioContext.destination );
      setInterval ( t.updateAnalysers , 1000 );
        
      
    }
  };
  
  
  return t;
})

