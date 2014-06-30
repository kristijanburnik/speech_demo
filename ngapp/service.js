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

      // Draw rectangle for each frequency bin.
      for (var i = 0; i < numBars; ++i) {
          var magnitude = 0;
          var offset = Math.floor( i * multiplier );
          // gotta sum/average the block, or we miss narrow-bandwidth spikes
          for (var j = 0; j< multiplier; j++)
              magnitude += freqByteData[offset + j];
          magnitude = magnitude / multiplier;
          t.data[i] = magnitude;
      }
      
      // console.log( "input", t.data );
      
      
      $rootScope.$digest();
      
    },
  
    attachStream:function( stream ){
    
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
      setInterval ( t.updateAnalysers , 100 );
        
      
    }
  };
  
  
  return t;
})

.service('SpeechRecognition',function(){

  var t = {
  
    _recognition:null, // webkitSpeechRecognition object ref.
    
    _callbacks:{},
    _isAvailable:false, // does the browser support it
    _isActive:false,  // is it currently recognizing speech
    
    // TODO : init the states via onStart
    _isSpeechDetected:true,
    
    _isUserMediaRequested:false,
    _isUserMediaDecided:false, // did user click on allow/deny (any of those)    
    _isUserMediaAllowed:false, // what did he click then?
    _isMicrophoneDetected:true,
    _isMicrophoneAllowed:true,
    
    _mediaStream:null, // the stream attached to user media
    
    _onUserMediaDecidedCallback:function(){},
    
    _startTimestamp:-1,
    
   // config for the webkitSpeechRecognition object
    _config: {
      lang:'en-US',
      continuous:true,
      interimResults:true,
      track:null,
    },
    
    // callback handling
    
    _registerCallback:function( eventName , callback ){
    
      if ( ! ( eventName in t._callbacks ) )
      {
        t._callbacks[ eventName ] = [];
        t._recognition[ eventName ] = function(event){
          t._executeCallback( eventName , event );
        }
      }
      
      t._callbacks[ eventName ].push( callback );
      
      return t;
    
    },
    _executeCallback:function( eventName , event ){
    
      if ( ! ( eventName in t._callbacks ) )
      {
        console.info("Missing callback for event name" , eventName );      
        return false;      
      }
      
      console.info("SR event", eventName, event );
      
      var listeners = t._callbacks[ eventName ];
      
      for ( var i in listeners )
        listeners[i]( event );
        
      return true;
    },
    
    
    
    debug:function(){
    
      // attach all SR events to console output for debugging
       for ( var i in t._exposedEvents )
        t.on( t._exposedEvents[i] , function(e){} );
        
    },
    // init the service
        
    init:function(){
      t._recognition = new webkitSpeechRecognition();
      t._isAvailable = ( 'webkitSpeechRecognition' in window );
      
      
      t.debug();
      
      
      t
        .on('error',function(event){
        
            if (event.error == 'no-speech') {
              t._isSpeechDetected = false;
            }
            
            if (event.error == 'audio-capture') {
              t._isMicrophoneDetected = false;
            }
            
            if (event.error == 'not-allowed') {
                t._isMicrophoneAllowed = false;
            }
            
        })      
        .on('start',function(event){
          t._isSpeechDetected = true;
          t._startTimestamp = event.timeStamp;
          console.info("On start");        
          t._isActive = true;
        })
        .on('end',function(event){
          t._isActive = false;
          console.info("On end");
        })
        .on('result',function(event){
          console.log("onResult event occured!");
          if (typeof(event.results) == 'undefined') {
            t._recognition.onend = null; // TODO: deregister?
            console.log("Got undefined result from SR");
            t.stop();          
            return;
          }
          
          console.info( "SR results" , event.results );
          
        })
       ;
      
    },
    
    
    // recognition config
    
    setLanguage:function( lang ){
      t._config.lang = lang;
      return t;
    },
    
    getLanguage:function(){
      return t._config.lang;
    },
    
    setAudioTrack:function( audioTrack ){      
      t._config.audioTrack = audioTrack;
      console.log( "Audio track is set", audioTrack );
      return t;
    },
    
    getAudioTrack:function() {
      return t._config.audioTrack;
    },
    
    
    requestUserMedia:function( callback ){
    
      if ( callback )
        t._onUserMediaDecidedCallback = callback;
    
    
      getUserMedia({audio:true, video:true}, function( stream ){
          
           t._isUserMediaDecided = true;
           t._isUserMediaAllowed = true;
        
           // TODO: place to a directive
           var videoElement = $("video")[0];
           
           attachMediaStream( videoElement , stream );
           
           
           t._mediaStream = stream;
           
           console.info("get user media first callback");
           
           
           t._onUserMediaDecidedCallback( true );
           
        }, function() {
        
          t._isUserMediaDecided = false;
          t._isUserMediaAllowed = false;
          
          console.info("get user media second callback");
                    
          t._onUserMediaDecidedCallback( false );
          
        });
    
        t._isUserMediaRequested = true;
          
        return t;
    
    },
    
    _checkMediaStream:function(){
      if (t._mediaStream == null)
        throw "Media stream is not set!\nCheck if user media was requested and allowed!"
        
    },
    
    streamMicrophone:function(){

      t._checkMediaStream();
      
      var audioTracks = t._mediaStream.getAudioTracks();

      t.setAudioTrack( audioTracks[0] );
     
      return t;
    },
    
    // todo: place up
    _mediaStreamDestination:null,
    
    _loadAudioBuffer:function(url, context , callback) {
      trace("load audio buffer");
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function(oEvent) {
        trace("onload");
        context.decodeAudioData(request.response, function (decodedAudio) {
          trace("decode audio data");
          callback( decodedAudio );
        });
      }
      request.send(null);
    },
    
    streamAudioFile:function( url ){
    
        var context = new AudioContext();
        t._mediaStreamDestination = context.createMediaStreamDestination();
        t._loadAudioBuffer( url , context , function(voiceSoundBuffer) {
          var voiceSound = context.createBufferSource();
          voiceSound.buffer = voiceSoundBuffer;
          
          // TODO: find out why connected twice ?
          voiceSound.connect( context.destination );
          voiceSound.connect( t._mediaStreamDestination );
          
          console.log( context.destination, t._mediaStreamDestination  );
          voiceSound.start( 0 );
          
          var audioTracks = t._mediaStreamDestination.stream.getAudioTracks();
          
          t.setAudioTrack( audioTracks[0] );
          
          console.warn("automatic start from SpeechRecognition.streamAudioFile");
          t.start();
        });
        
        return t;
    
    },
    
    getStream:function(){
      return t._mediaStream;
    },
    
    // starting the recognition
    
    start:function(){
    
      if ( ! t._config.audioTrack  )
      {
        console.error("No audio track was set!\nUse .setAudioTrack() before .start()");
        return false;
      }
        
      
      t._recognition.lang = t._config.lang;      
      t._recognition.continuous = t._config.continuous;      
      t._recognition.interimResults = t._config.interimResults;            
      
      console.log( t._recognition  );
           
      t._recognition.connect( t._config.audioTrack );      
      t._recognition.start();
      
      return true;
          
    },
    
    stop:function(){
      t._recognition.stop();
    },
    
    // service state    
    
    isAvailable:function(){
      return t._isAvailable;
    },
    
    isActive:function(){ // is recognition alive and in progress
      return t._isActive;
    },
    isSpeechDetected:function(){
      return t._isSpeechDetected;
    },
    isMicrophoneDetected:function(){
      return t._isMicrophoneDetected;
    },
    
    isUserMediaRequested:function(){
      return t._isUserMediaRequested;
    },
    isUserMediaDecided:function(){ 
      return t._isUserMediaDecided; 
    },
    isUserMediaAllowed:function(){
      return t._isUserMediaAllowed;
    },
    
    isMicrophoneAllowed:function(){
      return t._isMicrophoneAllowed;
    },
    isMicrophoneBlocked:function(){
      return t._isMicrophoneBlocked;
    },

    // event chains
    _exposedEvents:[ 'error' , 'start' , 'end' , 'result' , 'nomatch' , 'audiostart' , 'audioend' , 'soundstart' , 'soundend' ],
    
    on:function( eventName , callback ) {
    
      eventName = eventName.toLowerCase();
      
      if ( t._exposedEvents.indexOf( eventName ) < 0 )
        throw "Unknown SpeechRecognition event '" + eventName + "'";
      
      var fullEventName = 'on' + eventName;      
      return t._registerCallback( fullEventName , callback );
    }
 
    
  }
  
  // init the service
  t.init()
  
  return t;

})

