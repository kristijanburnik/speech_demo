app

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
      
      var listeners = t._callbacks[ eventName ];
      
      for ( var i in listeners )
        listeners[i]( event );
        
      return true;
    },
    
    // init the service
    
    init:function(){
      t._recognition = new webkitSpeechRecognition();
      t._isAvailable = ( 'webkitSpeechRecognition' in window );
      
      t
        .onError(function(event){
        
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
        .onStart(function(event){
          t._isSpeechDetected = true;
          t._startTimestamp = event.timeStamp;
          console.info("On start");        
          t._isActive = true;
        })
        .onEnd(function(event){
          t._isActive = false;
          console.info("On end");
        })
        .onResult(function(event){
          if (typeof(event.results) == 'undefined') {
            t._recognition.onend = null; // TODO: deregister?
            t.stop();
            upgrade();
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
    
    
    streamMicrophone:function(){
      // var context = new AudioContext();
      // var mediaStreamDestination = context.createMediaStreamDestination();  
      
      if ( t._mediaStream == null )
      {
      
        console.error("Media stream is not set!\nCheck if user media was requested and allowed!");
        return t;
      }
      
      var audioTracks = t._mediaStream.getAudioTracks();
            
      // TODO: check if track is available
      t.setAudioTrack( audioTracks[0] );
      
      console.log("Audio track is set", audioTracks[0]);
     
      return t;

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
    
    onError:function( callback ){
      return t._registerCallback( 'onerror' , callback );
    },
    
    onStart:function( callback ){
      return t._registerCallback( 'onstart' , callback );
    },
    
    onEnd:function( callback ){
      return t._registerCallback( 'onend' , callback );
    },
    
    onResult:function( callback ){
      return t._registerCallback( 'onresult' , callback );
    },    
 
    
  }
  
  // init the service
  t.init()
  
  return t;

})

