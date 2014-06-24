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


.controller("MainController",function( Menu , $rootScope ){

  $rootScope.menu = Menu;
  
})


.controller("MicrophoneController",function( Menu ){
  Menu.set('microphone');  
})



.controller("RecordedController",function( Menu ){
  Menu.set('recorded');

});


