/*     PHONEGAP EXTENSION
 Created by : Saad Mousliki and Mohcine El Bouazzi
*/ 



var         actions = {};


var         data    = {
                            'init':function(){
                                
                                    this.appPath =  studio.extension.storage.getItem ("appPath");
                                    this.projectName =  studio.extension.storage.getItem ("projectName");
                                    this.appName = studio.extension.storage.getItem ("appName");
                                    this.appId = studio.extension.storage.getItem ("appId");
                                    this.ip = studio.extension.storage.getItem ("ip");
                                    this.port = studio.extension.storage.getItem ("port");
                                    this.packageLocation = studio.extension.storage.getItem ("packageLocation");
                                   
                                    if( studio.extension.storage.getItem ('withPref') === 'OK' ){
                                        
                                            this.withPref = true;
                                            this.author = studio.extension.storage.getItem ("author");
                                            this.description = studio.extension.storage.getItem ("description");
                                            this.icon = studio.extension.storage.getItem ("icon");
                                            this.splash = studio.extension.storage.getItem ("splash");
                                            this.APIs = studio.extension.storage.getItem ("apiArray");
                                            this.pgVersion = studio.extension.storage.getItem ("pgVersion");
                                            this.deviceOrientation = studio.extension.storage.getItem ("deviceOrientation");
                                            this.deviceTarget = studio.extension.storage.getItem ("deviceTarget");
                                            this.fullScreen = studio.extension.storage.getItem ("fullScreen");
                                            this.sdkMax = studio.extension.storage.getItem ("sdkMax");
                                            this.sdkMin = studio.extension.storage.getItem ("sdkMin");

                                    }
                                    

                            },
                            'reset':function(){

                                    var items = [ "appPath", "projectName", "appName", "appId", "ip", "description", "author", "withPref", "port", "packageLocation", "icon", "splash", "sdkMin", "sdkMax", "fullScreen", "deviceTarget", "deviceOrientation", "pgVersion", "apiArray"];	
                                    for( var i=0, length=items.length; i < length; i++ ){
                                            studio.extension.storage.removeItem( items[i] );
                                    }
                            }
                        };


function createFolder( path ){

    var folder = Folder( path ).create();
    return folder ? true : false;
}

/*
 *  copyFile has 3 parameters : 
 *  src : file source
 *  dest : file destination
 *  name : file new name (facultatif)
 **/

function copyFile( src, dest, name){

    var file = new File( src );
    if(file.exists){
        name = name ? name : file.name;
        file.copyTo( new File( dest + "/" + name),true );
        return true;
    }
    return false;
}


function copyFolder(source,dest){

    var folder = Folder(source);
   
    folder.forEachFolder(function(sub) {
      
        Folder(dest + sub.name + "/").create();
        copyFolder(sub.path, dest + sub.name + "/");
    });
      
    folder.forEachFile(function(file){

        file.copyTo(new File(dest + file.name),true);
    });
}


/*
 * getMobileFolder function is used to get web mobile pages location
 *  from the project
 *
 */
function getMobileFolder( pathProject )
{	
    var project = Folder( pathProject + "WebFolder" );
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
	
	var myWorker;
	
	if( os.isWindows ){
				/*  Windows platform  */
				
		var zipItLoaction = studio.extension.getFolder().path + "resources/zipit";
		zipItLoaction = zipItLoaction.replace( /\//g, "\\" );
		location = location.replace( /\//g, "\\" );
		myWorker = new SystemWorker( "cmd /c Zipit.exe " + location + ".zip " + location, zipItLoaction );
		myWorker.wait();
	}
	else{
			    /* Mac or Linux platform */

		myWorker = new SystemWorker( "bash -c zip -r " + location + ".zip " + location );
		myWorker.wait();
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
        var newFolder = Folder(packageLocation);
        var mobileFolderName = getMobileFolder(path);
	
        if( mobileFolderName === null ) {
            studio.alert("No Web mobile page detected !");
            data.reset();
            return false;
        }
        
        if (newFolder.exists) 
        {
            if(!studio.confirm( "Package folder already exist ! Would you like to overwrite it?" ))
                return false;
        }
	
        var isOK = newFolder.create();
        if(!isOK){
            studio.alert("Folder not created !");
            return false;
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
            
            
          try{	
                createFolder( path + "bootStrap" );
                createFolder( path + "utils" );
                createFolder( packageLocation + "/styles" );
                createFolder( packageLocation+ "/scripts" );
                createFolder( packageLocation+ "/images" );
                
                copyFolder( studio.extension.getFolder().path + "resources/walib/WAF", packageLocation + "/walib/WAF/" );
                copyFolder( path +"WebFolder/images", packageLocation + "/images/" );
            }
            catch(err){
                studio.alert(err.message);
                return false;
            }
            
            /*              COPY CSS and JS files                   */
            
			
            var indexContent = loadText(path + "WebFolder/" + mobileFolderName + "/index-smartphone.html");
            var regJS = /(content|src)=.+\.js/g;
            var regCSS = /(content|href)=.+\.css/g;
            
            var JS = indexContent.match(regJS);
            var CSS = indexContent.match(regCSS);
            var cssPath = [];
            var jsPath = [];
            
			if( JS == null || CSS == null ){
			
				studio.alert('Error : index-smartphone.html is empty !');
				return false;
			}
			
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
 			
            var isOK;        
            isOK = copyFile( path + "WebFolder/" + mobileFolderName + "/scripts/index-smartphone.js",  packageLocation + "/scripts" );
            copyFile( path + "WebFolder/" + mobileFolderName + "/index-smartphone.html", packageLocation, "index.html" );
                 
            indexContent = loadText( packageLocation + "/index.html" ),
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
                indexContent = indexContent.replace( JS[i], "scripts/" + File(jsPath[i]).name );
            }
            for(var i=0; i < CSS.length; i++){
                indexContent = indexContent.replace( CSS[i], "styles/" + File(cssPath[i]).name );
            }
                        
            saveText( indexContent, packageLocation + "/index.html" );
                    
            var l = "WAF.core.baseURL = 'http://" + data.ip + ":" + data.port + "';\n\
                WAF.core.restConnect.defaultService = 'cors';\n\
                WAF.core.restConnect.baseURL = 'http://" + data.ip + ":" + data.port + "';";
            var content = loadText(packageLocation + "/scripts/index-smartphone.js");
            l += content ? "\n" + content : "";
            saveText( l, packageLocation + "/scripts/index-smartphone.js");    
                    
            try{
                    
                copyFile( path + "WebFolder/" + mobileFolderName + "/styles/index-smartphone.css", packageLocation + "/styles" );
                copyFile( path + "WebFolder/application.css", packageLocation + "/styles" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/Loader.js", packageLocation + "/scripts" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/waf-optimize.js", packageLocation + "/scripts" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/handlers.js", path + "bootStrap" );
                copyFile( studio.extension.getFolder().path + "/resources/scripts/cors.js", path + "utils" );
                copyFile( studio.extension.getFolder().path + "/resources/styles/waf-optimize.css", packageLocation + "/styles" );
               
            }
            catch(err){
                studio.alert( err.message );
                return false;
            }
                        
            
					
            /*       
             *      Create config.xml file     
             *                    
             */
            
            
            if( data.withPref ){
                        
                var contentXML = loadText( studio.extension.getFolder().path + "resources/config2.xml" );		   
                
                var appInfo = [ "\""+data.appId+"\"", data.appName, data.description, data.author, "\"" + File(data.icon).name + "\"", "\"" + File(data.splash).name + "\"", "\""+data.pgVersion+"\"", "\""+data.deviceOrientation+"\"", "\""+data.deviceTarget+"\"", "\""+data.fullScreen+"\"", "\""+data.sdkMin+"\"", "\""+data.sdkMax+"\"" ];
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
                
                var contentXML = loadText( studio.extension.getFolder().path + "resources/config1.xml" );		   
                contentXML = contentXML.replace( 'appId', '"' + data.appId + '"');
                contentXML = contentXML.replace( 'appName', data.appName ); 
            }
           
            saveText( contentXML, packageLocation + "/config.xml" );
                        
                        
            /*
             *      Set bootStrap/hanlders.js as active bootStrap 
             */
            
            var content = loadText( path + data.projectName + ".waProject" );
            content = content.replace( "</project>", "<file path=\"./bootStrap/handlers.js\"><tag name=\"bootStrap\"/></file></project>" );
            saveText( content, path + data.projectName + ".waProject" );
			
			
			/*  compress package to zip format */
			
            toZip( packageLocation );
            Folder( packageLocation ).remove();
			
			return true;
						
        }  
    }
}



actions.packaging = function packaging( message ){

    data.init();
    var isOK = packageFunction();
    data.reset();
	
	if(isOK)	studio.extension.storage.setItem( 'CommandError', 'OK');
	
	
}


actions.showDialog = function showDialog( message ) {

    if(!studio.currentSolution.getSolutionFile()){
			
        studio.alert('No current solution detected !');
        studio.extension.quitDialog();
        return ;
    }
    
    else{
        studio.extension.showModalDialog(
            "form.html", 
            "", 
            {
                title:"Wakanda Studio", 
                dialogwidth:700, 
                dialogheight:650, 
                resizable:false
            },
            ''
            );
        return ;
    }
}


exports.handleMessage = function handleMessage( message ) {

    actions[ message.action ]( message );	
    return true;

}