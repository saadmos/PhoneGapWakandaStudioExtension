// Created by Choisel Fogang
// Handles all calls to urls starting by /cors/, with the handleCORSMethod from the cors.js file.
addHttpRequestHandler("^/cors/", "utils/cors.js",  "handleCORSMethod");
