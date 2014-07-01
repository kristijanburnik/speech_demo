app
.service('AudioAnalyzer',function( $rootScope ){
  var t = {
    data:[],
    analyserNode:null,
    _updateCallback:function( points ){},
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
          t.data[i] = { range: i , value: magnitude };
          
      }
      
    
       t._updateCallback( t.data );
      
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
      setInterval ( t.updateAnalysers , 80 );
       
      return t;
      
    },
    
    onUpdate:function( callback ){
      t._updateCallback = callback;
      return t;
    }
  };
  
  
  return t;
})


.service('Visualizer',function(){
   
  var t = {
    lineUp:null,
    lineDown:null,
    pathUp:null,
    pathDown:null,
    heightFactor: 1.0/3.0,
    widthFactor: 4.0,
    init:function(){
      var margin = {top: 20, right: 20, bottom: 30, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom
          ;

      t.lineUp = d3.svg.line()
          .x(function(d) { return d.range * t.widthFactor; })
          .y(function(d) { return height/2 - d.value * t.heightFactor; });
          
      
      t.lineDown = d3.svg.line()
          .x(function(d) { return d.range * t.widthFactor; })
          .y(function(d) { return height/2 + d.value * t.heightFactor; });

      $("#analyzer").children().remove();

      var svg = d3.select("#analyzer").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        t.pathUp = svg.append("path")
        t.pathDown = svg.append("path")        
      
    },
    update:function( data ){
    
      t.pathUp
        .datum( data )
        .attr("class", "line")
        .attr("d", t.lineUp )
       ;


      t.pathDown
        .datum( data )
        .attr("class", "line")
        .attr("d", t.lineDown )
       ;

    
      return t;

    }
  
  }
  
  return t;


});

