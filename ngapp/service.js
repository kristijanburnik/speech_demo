app


.service('SpeechRecognition',function(){

  var t = {
  
    _recognition:null, // webkitSpeechRecognition object ref.    
    _callbacks:{},
    _isAvailable:false, // does the browser support it
    _isActive:false,  // is it currently recognizing speech
    _isSpeechDetected:true,    
    _isUserMediaRequested:false,
    _isUserMediaDecided:false, // did user click on allow/deny (any of those)    
    _isUserMediaAllowed:false, // what did he click then?
    _isMicrophoneDetected:true,
    _isMicrophoneAllowed:true,
    _mediaStream:null, // the stream attached to user media
    _onUserMediaDecidedCallback:function(){},    
    _startTimestamp:-1,
    _onInvalidateCallback:function(){},
    
    _invalidate:function(){
      console.log("Invalidation ...");
      t._onInvalidateCallback();
    },
    
    // config for the webkitSpeechRecognition object
    _config: {
      lang:'en-US',
      continuous:true,
      interimResults:true,
    },
    _audioTrack:null,    
    _exposedEvents:[ 'error' , 'start' , 'end' , 'result' , 'nomatch' , 'audiostart' , 'audioend' , 'soundstart' , 'soundend' ],
        
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
      
      t._invalidate();
      
      return true;
    },
    _checkMediaStream:function(){
      if (t._mediaStream == null)
        throw "Media stream is not set!\nCheck if user media was requested and allowed!"        
    },  
    _debug:function(){    
       // attach all SR events to console output for debugging
      for ( var i in t._exposedEvents )
        t.on( t._exposedEvents[i] , function(e){} );        
    },
    
    // init the service        
    init:function(){
    
      t._callbacks = {};
      
      t._isAvailable = ( 'webkitSpeechRecognition' in window );
      
      t._recognition = new webkitSpeechRecognition();
      
      t._debug();
      
      t
        .on('error',function(event){
          if (event.error == 'no-speech')
            t._isSpeechDetected = false;
          
          if (event.error == 'audio-capture')
            t._isMicrophoneDetected = false;
          
          if (event.error == 'not-allowed')
              t._isMicrophoneAllowed = false;            
        })
        .on('start',function(event){
          t._isSpeechDetected = true;
          t._startTimestamp = event.timeStamp;
          t._isActive = true;
        })
        .on('end',function(event){
          t._isActive = false;
        })
        .on('result',function(event){
          if (typeof(event.results) == 'undefined') {
            t._recognition.onend = null; // TODO: deregister?
            console.error("Got undefined result from SR");
            t.stop();
            return;
          }
        })
       ;
       
       t._invalidate();
       
       return t;      
    },
    
    
    // recognition config    
    setLanguage:function( lang ){
      t._config.lang = lang;
      return t;
    },    
    getLanguage:function(){
      return t._config.lang;callback
    },    
    setAudioTrack:function( audioTrack ){      
      t._audioTrack = audioTrack;
      console.log( "Audio track is set", audioTrack );
      return t;
    },    
    getAudioTrack:function() {
      return t._audioTrack;
    },   
    
    requestUserMedia:function( callback ){
    
      if ( callback )
        t._onUserMediaDecidedCallback = callback;    
    
      getUserMedia(
        { audio:true }, 
        function( stream ){          
           t._isUserMediaDecided = true;
           t._isUserMediaAllowed = true;                  
           t._mediaStream = stream;
           t._onUserMediaDecidedCallback( true );
           var videoElement = $("video")[0];
           attachMediaStream( videoElement , stream );
           
           t._invalidate();
        },
        function( event ){
          t._isUserMediaDecided = true;
          t._isUserMediaAllowed = false;          
          t._mediaStream = null;
          t._onUserMediaDecidedCallback( false );        
          
          t._invalidate();  
        }
      );
    
      t._isUserMediaRequested = true;
          
      return t;    
    },

    streamMicrophone:function(){

      t.requestUserMedia(function( allowed ){
      
        if ( !allowed )
        {
          console.info("User disallowed microphone usage");
          return;
        }
        
        var audioTracks = t._mediaStream.getAudioTracks();

        t.setAudioTrack( audioTracks[0] );
        console.warn("automatic start from SpeechRecognition.streamMicrophone");
        t.start();
      
      });
     
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
          
          // set the media stream
          t._mediaStream = t._mediaStreamDestination.stream;
          
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
    
      if ( ! t._audioTrack  )
      {
        console.error("No audio track was set!\nUse .setAudioTrack() before .start()");
        return false;
      }
      
      // setup
      t._recognition.lang = t._config.lang;      
      t._recognition.continuous = t._config.continuous;      
      t._recognition.interimResults = t._config.interimResults;            
      
      // connect and start
      t._recognition.connect( t._audioTrack );
      t._recognition.start();
      
      t._invalidate();
      
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
   
    on:function( eventName , callback ) {
    
      eventName = eventName.toLowerCase();
      
      if ( eventName == 'invalidate' )
      {
        t._onInvalidateCallback = callback;
        return t;
      }
      
      if ( t._exposedEvents.indexOf( eventName ) < 0 )
        throw "Unknown SpeechRecognition event '" + eventName + "'";
      
      var fullEventName = 'on' + eventName;
      return t._registerCallback( fullEventName , callback );
    }
    
  }

  return t;

})

