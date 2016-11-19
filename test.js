const cmd = require('node-cmd');

setInterval(function() {

  cmd.get(
    'spotify status',
    function(data) {
      //var position = data.split("Position: ")[1];
      //console.log(position);
      console.log(data);
      }
  )

}, 
1000);
