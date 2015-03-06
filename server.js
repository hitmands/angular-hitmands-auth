(function() {
   "use strict";
   /*jshint es5: true */

   var
      path = require('path'),
      bodyParser = require('body-parser'),
      express = require('express'),
      fs = require('fs'),
      isStatic = /(assets|images|partials|bower_components)/,
      app = express();

   app
      .set('port', 3000 )
      .use('/images', express.static(__dirname   +   '/sample/images') )
      .use('/partials', express.static(__dirname +   '/sample/partials') )
      .use('/assets', express.static(__dirname   +   '/sample') )
      .use('/vendor', express.static(__dirname     +   '/src/vendor') )
      .use('/build', express.static(__dirname     +   '/release') )
      .use( bodyParser.json() )
      .use( bodyParser.urlencoded( {extended: true} ) )


      .get('*', function( request, response ) {

         if(isStatic.test(request.originalUrl) && !fs.exists(request.originalUrl)) {
            return response.status(404).send('Not Found');
         }

         return response.sendFile(
            'sample/index.html', { root: __dirname }
         );
      });


   var
      serverPort = app.get('port'),
      server = app.listen(serverPort, function() {
         console.info('angular.hitmands.auth, server listening on port:',  serverPort);
      });


})();
