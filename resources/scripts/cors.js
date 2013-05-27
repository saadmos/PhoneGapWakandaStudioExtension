/**
* This cors.js file is intended to provide a CORS support to your application.
* @author Choisel Fogang, Alexandre Morgaut , a fixing of an image issue is done by Saad Mousliki
*/
var
    headersBlackList, // We don't reuse the headers provided in this list
    defaultScheme, // Default HTTP scheme to use.
    allowedDomains; // List of the allowed domains that can make cross origin calls to this application

headersBlackList = ['Host', 'Date', 'Server', 'Content-Length'];
defaultScheme = "http://";
allowedDomains = "*"; // for specific values use "," as a separator

function formatHeaderName(headerName) {
    "use strict";
    headerName = headerName.toLowerCase();
    headerName = headerName.split('_');
    return headerName.map(
        function UpperCaseFirst(namePart) {
            return namePart[0].toUpperCase() + namePart.substr(1);
        }
    ).join('-');
}

/**
* This method will be invoke to handle incoming request
* @param request {HTTPRequest} the request made to the wakanda server
* @param response {HTTPResponse} the response wakanda server will send back to the caller
*/
function handleCORSMethod(request, response) {
    "use strict";

    var
        req,
        scheme,
        urlToCall,
        headers,
        requestedHeader;

	// add CORS headers
    response.headers["Access-Control-Allow-Origin"] = allowedDomains;
    requestedHeader = request.headers["Access-Control-Request-Headers"];
    response.headers["Access-Control-Allow-Headers"] = requestedHeader !== undefined ? requestedHeader + " ,Content-Type" : "Content-Type";

	if (request.method === "OPTIONS") {
		// Client is asking for the allowed methods
		// We provide the allowed methods and stop the execution
		response.headers["Access-control-allow-methods"] = "POST,GET,PUT,DELETE,OPTIONS";
		return;
	}

    /*
     * manage the Request to transfert
     */
    headers = request.headers;
    req = new XMLHttpRequest();

    // get the scheme
    // Note : the isSSL attribute is supported since Wakanda 3
    if (request.hasOwnProperty('isSSL')) {
        scheme = request.isSSL ? 'https://' : 'http://';
    } else {
        scheme = defaultScheme;
    }
    // format the request URL according to the path used with the addHttpRequestHandler
    urlToCall = scheme + request.host + request.url.replace("/cors/", "/rest/");
    // set request method and URL, we use synchronous call
    req.open(request.method, urlToCall, false);
    // copy request headers
    Object.keys(headers).forEach(
        function setRequestHeader(headerName) {
            var
                headerValue;
            headerValue = headers[headerName];
            headerName = formatHeaderName(headerName);
            if (headerValue !== undefined && headersBlackList.indexOf(headerName) === -1) {
                req.setRequestHeader(headerName, headerValue);
            }
        }
    );
    // send the request with a copy the body if it exists
    req.send(request.body || null);

    /*
     * manage the Response to send back
     */
    // set response status
    response.statusCode = req.status;
    // copy response headers
    headers = req.getAllResponseHeaders().trim().split(/\r?\n/);
    headers.forEach(
        function setResponseHeader(header) {
            var
                headerName,
                headerValue;

            header = header.split(':');
            headerName = header[0];
            headerValue = header[1];
            if (headerValue && headersBlackList.indexOf(headerName) === -1) {
                response.headers[headerName] = headerValue;
            }
        }
    );

    // copy response body if it exists
    var searchString = new RegExp("/rest/", 'g');
    var result;

    if (response.contentType.indexOf("image") != -1) {
        req.responseType = "blob";
        result = req.response;
    } else {
        if (req.responseText !== undefined)
            result = req.responseText.replace(searchString, '\/cors\/');
    }      
    response.body = result || null;
	
}