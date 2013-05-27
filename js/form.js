/*     PHONEGAP EXTENSION
 Created by : Saad Mousliki and Mohcine El Bouazzi
*/ 






/* isProject funstion tests if project given in parameter
 *      is a project (.waProject)
 *
 * parameter :  "path" is the project path 
 */
function isProject(path){	
			
    var f = studio.Folder(path);
    var myRegex = new RegExp(/waProject/);
				
    for(var i = 0, files = f.files; i < files.length; i++){
        if(myRegex.test(files[i].name)) {
            return true;
        }
    }
    return false;
}


/*
 * isAppId function tests if a given value is an app Id
 * 
 * app Id has this form : e.g com.yourcompany.app
 *  
 */
function isAppId( id ){
    
    var myRegex = new RegExp( /^\w+\.\w+\.\w+$/ );
    
    return myRegex.test( id ) ? true : false;
}



/*
 * delete space from the beginning and the end of a string
 */
function trim (s)
{
    return s = s.replace(/^\s+/g,'').replace(/\s+$/g,'')
} 



/* 
 * setProjectList function lists current solution projects
 *   and display them in the form 
 *
 */
function setProjectsList(){
			
    var projects, folder;
	
    document.getElementById('waiting').setAttribute('hidden','');
	document.getElementById('body').removeAttribute('hidden','');
	
    var pathSolution = studio.currentSolution.getSolutionFile().path.replace(studio.currentSolution.getSolutionFile().name, "");
    var tab = pathSolution.split("/");
    pathSolution = "";

    for(var i=0, l=tab.length; i < l - 2; i++){
			
        pathSolution += tab[i] + "/";
    }	
    folder = studio.Folder(pathSolution);
		
    for(var i=0, projects=folder.folders; i < projects.length; i++){
				
        if(isProject(projects[i].path)){		
            var option = document.createElement('option');
            option.value = projects[i].path;
            option.text = projects[i].name;
            document.getElementById('projectsList').appendChild(option);
        }
    }
}
	
        
/*
 * 
 * setPreferences function shows/hides preferences form 
 * 
 */        
 function setPreferences() {

                var element = document.getElementById('pref-form');
               
                element.getAttribute('hidden') === null ? element.setAttribute("hidden", "") : element.removeAttribute("hidden");

                getSettings();
 }
 
 
 
/*
 * getFilePath function retrieves path of an uploader file
 *
 * parameter : "id" id of text area
 */
function getFilePath(id) {
		
    if( document.getElementById('setPreference').checked ){
        var selFile = studio.fileSelectDialog();
        if (selFile !== null) {
            var pathStr = selFile.path;
            document.getElementById(id).value = pathStr;
        }

        detect(id);
        getSettings();
    }
}



/* 
 * isLocation function tests if a given folder as parameter 
 *  exists
 *
 */
function isLocation(folder){
    
   return studio.Folder(folder).exists ? true : false;  
}


/* detect function detects if a given value is valid or not
 *
 * parameter : 'id' refers to an object id
 *
 */
function detect(id){
    
    var v = trim( document.getElementById(id).value );
    var ip = trim(document.getElementById('ip1').value) + "." + trim(document.getElementById('ip2').value) + "." + trim(document.getElementById('ip3').value ) + "." + trim( document.getElementById('ip4').value );
    
    if(id === 'packageLocation'){        
        document.getElementById('location').className = isLocation(v) ? "check_field ok" : "check_field error";
    }
    
    if(id === 'icon')
        document.getElementById('iconPathMessage').className = isIcon(v) ?  "check_field ok" : "check_field error";
        
     if(id === 'splash')
        document.getElementById('splashPathMessage').className = isIcon(v) ?  "check_field ok" : "check_field error";
    
    
    if(id === 'appName')
        document.getElementById('appNameMessage').className = v ?  "check_field ok" : "check_field error";
    
     if(id === 'appId')
        document.getElementById('appIdMessage').className = isAppId(v) ?  "check_field ok" : "check_field error";
    
     if(id === 'author')
        document.getElementById('authorMessage').className = v ?  "check_field ok" : "check_field error";
    
    if(id === 'des')
        document.getElementById('descMessage').className = v ?  "check_field ok" : "check_field error";
    
    if(id === 'port')
         document.getElementById('portMessage').className =  isPortNumber(v) ?  "check_field ok" : "check_field error";
        
     if(id === 'ip1' || id === 'ip2' || id === 'ip3' || id === 'ip4')
         document.getElementById('ipMessage').className =   isIp(ip) ?  "check_field ok" : "check_field error";
    
}



/* isIcon tests if a given path is an icon
 * 
 * parameter : icon path    
 */
function isIcon(iconPath){

    if( studio.File(iconPath).exists && iconPath ){
        
        var reg = new RegExp( /\.(png|jpg|bmp|gif)$/ );
        return reg.test(iconPath) ? true : false;
    }
    else return false;
}



/* getFolderPath retrieves folder path and display it into a text area
 *
 *  parameter : 'id' refers to object id
 */
function getFolderPath(id) {
		
    var selFile = studio.folderSelectDialog();
    if (selFile !== null) {
        var pathStr = selFile.path;
        document.getElementById(id).value = pathStr;
    }

     detect(id);
     getSettings();
}


/*
 *  isIp test if a given string is an address IP
 *
 */
function isIp(ip){
	
    var ipRE = new RegExp( /^\d+\.\d+\.\d+\.\d+$/ );	
    if(ipRE.test(ip)){
			
        var tab = ip.split('.');	
        for(var i = 0; i < tab.length; i ++){
			
            if( tab[i] > 255 || tab[i] < 0 ){
                return false;
            }
        }
        return true;
    }
    else return false;
}

/*
 * isPortNumber
 */
function isPortNumber(port){
	
    var reg = new RegExp( /^\d+$/ );
		
    if(reg.test(port)) return true;
		
    return false;
		
}
	
/*  storageSettings saves settings in storage 
 *
 *  parameter : 'settings' is an array of data retrieved from form
 */
function storageSettings(settings){
    	
    var items = [ "appPath", "projectName", "appName", "appId", "ip", "port", "packageLocation" ];
    for( var i = 0, length = items.length; i < length; i++ ){
        studio.extension.storage.setItem( items[i], settings[i]);
    }
}


/*
 * storagePreferences
 * 
 */
function storagePreferences(settings){
    
    var items = [ "author", "description", "icon", "splash", "apiArray", "pgVersion", "deviceOrientation", "deviceTarget", "fullScreen", "sdkMax", "sdkMin" ];

    for( var i = 0, length = items.length; i < length; i++ ){
        studio.extension.storage.setItem( items[i], settings[i]);
    }
}



/*
 * getSettings funcion gets data from the form and store them
 */
function getSettings(){		

    //get project path 
    var projectList = document.getElementById('projectsList'); 
    var appPath = projectList.options[projectList.selectedIndex].value;
    var projectName = projectList.options[projectList.selectedIndex].text;
    var packageLocation = trim( document.getElementById('packageLocation').value );	
    var name = trim ( document.getElementById('appName').value );
    var appId = trim( document.getElementById('appId').value );
    var ip = trim( document.getElementById('ip1').value ) + "." + trim( document.getElementById('ip2').value ) + "." + trim( document.getElementById('ip3').value ) + "." + trim( document.getElementById('ip4').value);
    var port = trim( document.getElementById('port').value );

    var isChecked = document.getElementById('setPreference').checked;
    
    if( isChecked ){
        
         var apiArray = new Array();

        var author = document.getElementById('author').value;
        var description = document.getElementById('des').value;
        var icon = trim(document.getElementById('icon').value);
        var splash = trim(document.getElementById('splash').value);

        var api = document.getElementsByName('api');
        for (var i = 0; i < api.length; i++) {
            if ( api[i].checked )
                apiArray.push( api[i].value );
        }

        var choices = document.getElementById('phonegap-version');
        var pgVersion = choices.options[choices.selectedIndex].text;

        var choices = document.getElementById('device-orientation');
        var deviceOrientation = choices.options[choices.selectedIndex].text;
        
        var choices = document.getElementById('device-target');
        var deviceTarget = choices.options[choices.selectedIndex].text;
        
        var choices = document.getElementById('screen-mode');
        var fullScreen = choices.options[choices.selectedIndex].text;

        var choices = document.getElementById('min-sdk-version');
        var sdkMin = choices.options[choices.selectedIndex].value;

        var choices = document.getElementById('max-sdk-version');
        var sdkMax = choices.options[choices.selectedIndex].value;
        
    }
    
    var settings = null,pref = null;
    
    if( appPath && isPortNumber(port) && isIp(ip)&& isLocation(packageLocation) && name && isAppId(appId) ){
        
        settings = [ appPath, projectName, name, appId, ip, port, packageLocation ];
        if(!isChecked){
            document.getElementById("button").removeAttribute("disabled");
           
        }
        else{
            if( author && description && isIcon(icon) && isIcon(splash) ){
                pref = [ author, description, icon, splash, apiArray, pgVersion, deviceOrientation, deviceTarget, fullScreen, sdkMax, sdkMin ];
                document.getElementById("button").removeAttribute("disabled");
            }
            else{
                document.getElementById("button").setAttribute("disabled", "");
            }
        }
    }
    
    else{
        document.getElementById("button").setAttribute("disabled", "");
    }
   
    return [ settings, pref ];
}




/*
 * packaging function gets settings and store them if settings array is full
 * 
 */
function packaging(){
    
    var settings,preferences;
    
	document.getElementById('waiting').removeAttribute('hidden');
	//document.getElementById("button").setAttribute("disabled", "");
	document.getElementById("body").setAttribute("hidden", "");
	
	setTimeout(function(){
		settings = getSettings()[0];
		preferences = getSettings()[1];
		
		if( preferences !== null ){
				storagePreferences(preferences);
				studio.extension.storage.setItem( 'withPref', 'OK');
		}
			
		storageSettings(settings);
		
		studio.sendCommand( 'PhoneGap.packaging' );
		
		document.getElementById('waiting').setAttribute('hidden','');
		document.getElementById('body').removeAttribute('hidden');
		
		if( studio.extension.storage.getItem( 'CommandError') === 'OK' ){
			
			studio.extension.storage.removeItem( 'CommandError');
			studio.alert('Package created successfully !');
		}
		studio.extension.quitDialog();}, 1000);
    
	}
