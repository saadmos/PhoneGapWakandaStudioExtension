/*     PHONEGAP EXTENSION
 Created by : Saad Mousliki and Mohcine El Bouazzi
*/ 





function createFolder( path ){

    var folder = studio.Folder( path ).create();
    return folder ? true : false;
}



/*
 *  copyFile has 3 parameters : 
 *  src : file source
 *  dest : file destination
 *  name : file new name (facultatif)
 **/

function copyFile( src, dest, name){

    var file = studio.File( src );
    if(file.exists){
        name = name ? name : file.name;
        file.copyTo( studio.File( dest + "/" + name),true );
        return true;
    }
    return false;
}


function copyFolder(source,dest){

    var folder = studio.Folder(source);
   
    folder.forEachFolder(function(sub) {
      
        studio.Folder(dest + sub.name + "/").create();
        copyFolder(sub.path, dest + sub.name + "/");
    });
      
    folder.forEachFile(function(file){

        file.copyTo( studio.File(dest + file.name),true );
    });
}


/*
 * getMobileFolder function is used to get web mobile pages location
 *  from the project
 *
 */
function getMobileFolder( pathProject )
{	
    var project = studio.Folder( pathProject + "WebFolder" );
    var c = null;
    
    project.forEachFolder( function( folder ){

        for( var i = 0; i < folder.files.length; i++ ){		
            if( folder.files[i].name === "index-smartphone.html" )
            {
                c = folder.name;
                break;
            }
        }
    });
    
    return c;
}




/* 
 * toZip compress package to zip format 
 *	
 * argument : package location 
 * 
 **/

function toZip( location ){
	
	var myWorker = studio.SystemWorker;
	
	if( navigator.platform === 'Win32' ){
				/*  Windows platform  */
				 
		var zipItLoaction = studio.extension.getFolder().path + "resources/zipit";
		zipItLoaction = zipItLoaction.replace( /\//g, "\\" );
		location = location.replace( /\//g, "\\" );
		myWorker.exec( "cmd /c Zipit.exe " + location + ".zip " + location, zipItLoaction );

		
		//myWorker.prototype.wait();
		
		//studio.alert('ziping...');
		
	}
	else{
			    /* Mac or Linux platform */

		myWorker.exec( "bash -c zip -r " + location + ".zip " + location );
		//myWorker.prototype.wait();
	}
}



/*
 * packageFunction gather all resources needed by the application into one folder
 * called "applicationName-Package"
 * 
 *  The package contains  : 
 *      - index.html
 *      - config.xml
 *      - icon
 *      - splash
 *      - scripts : loader.js, index-smartphone.js,waf-optimze.js
 *      - styles  : index-smartphone.css, waf-optimize.css, application.css
 *      - walib folder
 *      - images folder  
 * 
 **/

function packageFunction(){
	
    if( data.appPath ){

        var path = data.appPath;
        var packageLocation = data.packageLocation + data.appName +"-package";
        var newFolder = studio.Folder(packageLocation);
        var mobileFolderName = getMobileFolder(path);
        var a;
	
        if( mobileFolderName === null ) {
            studio.alert("Error : No Web mobile page detected !");
            //data.reset();
            return ;
        }
        
        if (newFolder.exists) 
        {
            if(!studio.confirm( "Package folder already exist ! Would you like to overwrite it?" ))
                return;
        }
	
        var isOK = newFolder.create();
        if(!isOK){
            studio.alert("Folder not created !");
            return;
        }
	
        else{					
        
		
            /*                CREATE PACKAGE FOLDERS TO HOST APPLICATION RESOURCES                              
             *                
             *       "utils", "bootstrap" in application root folder	; these two folders are used when interaction client-server 
             *              "bootstrap" contains "handlers.js",this will handle every request made to “/cors” and redirect them to “/rest” 
             *              BUT it’ll add the headers needed for browsers to allow a domain to hit yours.      
             *        "styles" and "scripts" host application css files and js scripts         
             *        "walib" folder for application resources
             *        "images folder         
             *                
             */
            
            
          //try{	
                createFolder( path + "bootStrap" );
                createFolder( path + "utils" );
                createFolder( packageLocation + "/styles" );
                createFolder( packageLocation+ "/scripts" );
                createFolder( packageLocation+ "/images" );
                
                copyFolder( studio.extension.getFolder().path + "resources/walib/WAF", packageLocation + "/walib/WAF/" );
                copyFolder( path +"WebFolder/images", packageLocation + "/images/" );
           /* }
            catch(err){
                studio.alert(err.message);
                return;
            }
            
            /*              COPY CSS and JS files                   */
            
            
            //var indexContent = loadText(path + "WebFolder/" + mobileFolderName + "/index-smartphone.html");
			
			var stream = studio.TextStream( studio.File(path + "WebFolder/" + mobileFolderName + "/index-smartphone.html"), "Read" );			
			var indexContent = stream.read();
			stream.close();
			
            var regJS = /(content|src)=.+\.js/g;
            var regCSS = /(content|href)=.+\.css/g;
            
            var JS = indexContent.match(regJS);
            var CSS = indexContent.match(regCSS);
            var cssPath = [];
            var jsPath = [];
            

            for(var i =0; i < JS.length; i++){

                tab = JS[i].split("\"");
                JS[i] = tab[1];
            }
            for(var i=0; i < CSS.length; i++){

                tab = CSS[i].split("\"");
                CSS[i] = tab[1];
            }
            
            for(var i=0; i<JS.length; i++){
                if(JS[i][0] == "/"){
                    var c = JS[i].replace(JS[i][0],"");
                    copyFile(path + "WebFolder/" + c, packageLocation + "/scripts");
                    jsPath[i] = path + "WebFolder/" + c;
                }
                else{
                    copyFile(path + "WebFolder/" + mobileFolderName + "/" + JS[i], packageLocation + "/scripts");
                    jsPath[i] = path + "WebFolder/" + mobileFolderName + "/" + JS[i];
                }
            }
            
            for(var i=0; i<CSS.length; i++){
                if(CSS[i][0] == "/"){
                    var c = CSS[i].replace(CSS[i][0],"");
                    copyFile(path + "WebFolder/" + c, packageLocation + "/styles");
                    cssPath[i] = path + "WebFolder/" + c;
                }
                else{
                    copyFile(path + "WebFolder/" + mobileFolderName + "/" + CSS[i], packageLocation + "/styles");
                    cssPath[i] = path + "WebFolder/" + mobileFolderName + "/" + CSS[i];
                }
            }
            
            
            
            
            /*                COPY FILES NEEDED TO PACKAGE  
             *                
             *     copy "index-smartphone.html" to package and rename it as "index.html"                  	
             *     copy "index-smartphone.css", "index-smartphone.js"                 	      	
             *     copy "cors.js" and "handlers.js" and "loader.js" from the  extension to package                 	      	      	
             *     copy "waf-optimize.js" "waf-optimize.css" from our extension to package
             *     
             *     
             */                      	      	      	      	      	                 	      	      	      	      	
 			
			
        
            copyFile( path + "WebFolder/" + mobileFolderName + "/scripts/index-smartphone.js",  packageLocation + "/scripts" );
            copyFile( path + "WebFolder/" + mobileFolderName + "/index-smartphone.html", packageLocation, "index.html" );
                 
            var streamOut = studio.TextStream( studio.File(packageLocation + "/index.html"), "Read" );			
			indexContent = streamOut.read();
			streamOut.close();
			
            metaCSS = "<meta name=\"WAF.config.loadCSS\" id=\"waf-optimize\" content=\"styles/waf-optimize.css\"/>",
            metaJS = "<meta name=\"WAF.config.loadJS\" id=\"waf-optimize\" content=\"scripts/waf-optimize.js\"/>";
            metaJS = isOK ? metaJS : metaJS + "\n<meta name=\"WAF.config.loadJS\" id=\"waf-script\" content=\"scripts/index-smartphone.js\"/>";// in case index.js doesn't exist

            indexContent = indexContent.replace("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>","<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>\n"  + metaJS + "\n" + metaCSS);
            indexContent = indexContent.replace("/walib/WAF/", "walib/WAF/" );
            indexContent = indexContent.replace( "<script type=\"text/javascript\" src=\"/waLib/WAF/Loader.js\"></script>", "<script type=\"text/javascript\" src=\"walib/WAF/Loader.js\"></script><script type=\"text/javascript\" src=\"phonegap.js\"></script>" );
            indexContent = indexContent.replace("walib/WAF/Loader.js", "scripts/Loader.js" );
            indexContent = indexContent.replace(/data-src="\//g, "data-src=");
            //indexContent = indexContent.replace("/application.css", "styles/application.css" );
                
            for(var i=0; i < JS.length; i++){
                indexContent = indexContent.replace( JS[i], "scripts/" + studio.File(jsPath[i]).name );
            }
            for(var i=0; i < CSS.length; i++){
                indexContent = indexContent.replace( CSS[i], "styles/" + studio.File(cssPath[i]).name );
            }
              
			
			var streamIn = studio.TextStream( studio.File(packageLocation + "/index.html"), "Overwrite" );
			streamIn.write( indexContent );		
			streamIn.close();
			
                    
            var streamOut = studio.TextStream( studio.File(packageLocation + "/scripts/index-smartphone.js"), "Read" );			
			var content = streamOut.read();
			streamOut.close();
			
			var l = "WAF.core.baseURL = 'http://" + data.ip + ":" + data.port + "';\n\
                WAF.core.restConnect.defaultService = 'cors';\n\
                WAF.core.restConnect.baseURL = 'http://" + data.ip + ":" + data.port + "';";
            l += content ? "\n" + content : "";
            
			var streamIn = studio.TextStream( studio.File(packageLocation + "/scripts/index-smartphone.js"), "Overwrite" );
			streamIn.write( l );		
			streamIn.close();
            
			
           //try{
                    
                copyFile( path + "WebFolder/" + mobileFolderName + "/styles/index-smartphone.css", packageLocation + "/styles" );
                copyFile( path + "WebFolder/application.css", packageLocation + "/styles" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/Loader.js", packageLocation + "/scripts" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/waf-optimize.js", packageLocation + "/scripts" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/handlers.js", path + "bootStrap" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/cors.js", path + "utils" );
                copyFile( studio.extension.getFolder().path + "/resources/styles/waf-optimize.css", packageLocation + "/styles" );
               
            /*}
            catch(err){
                studio.alert(err.message);
                return;
            }*/
                        
            
					
            /*       
             *      Create config.xml file 
             *       
             *                    
             */
            
            
            if( data.withPref ){
                        
                var streamOut = studio.TextStream( studio.File(studio.extension.getFolder().path + "resources/config2.xml"), "Read" );			
				var contentXML = streamOut.read();
				streamOut.close();
				
                var appInfo = [ "\""+data.appId+"\"", data.appName, data.description, data.author, "\"" + studio.File(data.icon).name + "\"", "\"" + studio.File(data.splash).name + "\"", "\""+data.pgVersion+"\"", "\""+data.deviceOrientation+"\"", "\""+data.deviceTarget+"\"", "\""+data.fullScreen+"\"", "\""+data.sdkMin+"\"", "\""+data.sdkMax+"\"" ];
                var key = [ "appId", "appName", "appDescription", "appAuthor", "\"icon\"", "\"splash\"", "pg-version", "pref-orientation", "pref-targ-device", "pref-fullscreen", "pref-minSDK", "pref-maxSDK" ];
				
                for(var i=0; i < key.length; i ++){				
						contentXML = contentXML.replace( key[i], appInfo[i] );
                }					

				for( var i=0; i< data.APIs.length; i++ ){
						contentXML = contentXML.replace('</widget>', '<feature name="http://api.phonegap.com/1.0/' + data.APIs[i] + '" />\n</widget>');
				}
                
               copyFile( data.icon, packageLocation );
               copyFile( data.splash, packageLocation );
			   
            }
            else{ 
                
				var streamOut = studio.TextStream( studio.File(studio.extension.getFolder().path + "resources/config1.xml"), "Read" );			
				var contentXML = streamOut.read();
				streamOut.close();
				
                contentXML = contentXML.replace( 'appId', '"' + data.appId + '"');
                contentXML = contentXML.replace( 'appName', data.appName ); 
						
            }
           
		    var configFile = studio.File(packageLocation + "/config.xml");
			configFile.create();
			var streamIn = studio.TextStream( configFile, "write" );
			streamIn.write( contentXML );		
			streamIn.close();
			
                        
                        
            /*
             *      Set bootStrap/hanlders.js as active bootStrap 
             */
           
		   
			var streamOut = studio.TextStream( studio.File(path + data.projectName + ".waProject"), "Read" );			
			var content = streamOut.read();
			streamOut.close();
        
			content = content.replace( "</project>", "<file path=\"./bootStrap/handlers.js\"><tag name=\"bootStrap\"/></file></project>" );
            
			var streamIn = studio.TextStream( studio.File(path + data.projectName + ".waProject"), "write" );
			streamIn.write( content );		
			streamIn.close();
			
			
			/*  compress package to zip format */
				
						
           //toZip( packageLocation );
		    
		   //studio.Folder( packageLocation ).remove();
		   
		   
		   
			
			var worker = new Worker('index.js');
			
			worker.onmessage = function (event)
			{
				studio.Folder( packageLocation ).remove();
				document.getElementById('waiting').setAttribute('hidden');
				studio.alert('Package created sucessfully !');
				studio.extension.quitDialog();
				close();
			}
			worker.postMessage( packageLocation );
			
							
        }  
    }
}

