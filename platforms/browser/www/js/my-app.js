// Initialize app
var myApp = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    getLocation();
    tryingFile();
    //getWeather();
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})

var country;
var city;
var code;
var longitude;
var latitude;
var currency;
var weather;

//Functions to get the current position
function getLocation(){
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
}

function geoCallback(position){
    
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    
    document.getElementById('position').innerHTML = latitude;
    document.getElementById('position2').innerHTML = longitude;
    displayMap();
    function displayMap(){
        var myposition = {lat: latitude, lng: longitude};
            
        // Creating the map, centred on the position 
        var myMap = new google.maps.Map(document.getElementById('map'),
            {zoom: 15,
            center: myposition });
            
        // Creating a marker at the position defined above
        var marker = new google.maps.Marker(
            { position: myposition,
            map: myMap });
        }
        
    
    openCage();
}

function onError(message){
    console.log(message);
}

//Function to get the current Country, city and currency
function openCage(){
    var http = new XMLHttpRequest();
    const url= "https://api.opencagedata.com/geocode/v1/json?q=" + latitude +"+"+ longitude + "&key=feff83919a394174a619760e780f4b57"
    http.open("GET", url );
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON= JSON.parse(response);

        city = responseJSON.results[0].components.city;
        country = responseJSON.results[0].components.country;
        currency = responseJSON.results[0].annotations.currency.iso_code;
        code = responseJSON.results[0].components.country_code;
        

        document.getElementById('country').innerHTML = country;
        document.getElementById('city').innerHTML = city;
        getWeather();
    }
}
//Function to get the current weather and show it
function getWeather(){
    var http2 = new XMLHttpRequest();
    const url2= "https://api.openweathermap.org/data/2.5/weather?q="+city+","+code+"&appid=de7f58720002a34971a8199768dc6b62";
    http2.open("GET", url2 );
    http2.send();
    http2.onreadystatechange = (e) => {
        var response2 = http2.responseText;
        var responseJSON2= JSON.parse(response2);
        console.log(responseJSON2);
        //document.getElementById('cityID').innerHTML = responseJSON2.id;
        weather = "Weather: " + responseJSON2.weather[0].main + "<br>" +
                  "Temperature(°C): " + parseInt(responseJSON2.main.temp - 273.15) + "<br>" +
                  "Humidity: " + responseJSON2.main.humidity + "<br>" +
                  "Wind speed: " + responseJSON2.wind.speed + "</br>";
        document.getElementById('weather').innerHTML =  "Weather: " + responseJSON2.weather[0].main + "<br>" +
                                                        "Temperature(°C): " + parseInt(responseJSON2.main.temp - 273.15) + "<br>" +
                                                        "Humidity: " + responseJSON2.main.humidity + "<br>" +
                                                        "Wind speed: " + responseJSON2.wind.speed + "</br>";
    }
}

function getCity(){
    document.getElementById('city2').innerHTML = city; 
    document.getElementById('xchange').innerHTML = currency;
}
//Function to convert the currency from the USD to the local currency
function conversion(){
    var input = document.getElementById('usd').value;
    var http = new XMLHttpRequest();
    const url= 'http://apilayer.net/api/live?access_key=9503128cd4c6a96bcb5cd298a8a73d42&currencies='+currency+'&source=USD&format=1';
    http.open("GET", url );
    http.send();

    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON= JSON.parse(response);
        if(responseJSON.quotes.USDEUR!=null){
        var rate = responseJSON.quotes.USDEUR;
        }
        if(responseJSON.quotes.USDGBR!=null){
            var rate = responseJSON.quotes.USDGBR;
        }
        //console.log(rate);
        //console.log(input);
        var result = input *rate;

        document.getElementById('result').innerHTML = result;

        }
}

//File Manager functions
function tryingFile(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, fileSystemCallback, onError);
}

function fileSystemCallback(fs){
    // Name of the file I want to create
    var fileToCreate = "data.txt";
    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };
var fileEntryGlobal;
var contentGlobal="";

function getFileCallback(fileEntry){
    fileEntryGlobal = fileEntry;
}

// Function to write the information
function writeFile(textToWrite) {
    readFile();

    var date = new Date();
    contentGlobal = contentGlobal + "Country: " + country + "<br>" + 
                                    "City: " + city + "<br>" + 
                                    "Currency: " + currency + "<br>" + 
                                    "Position: " + latitude + "," + longitude + "<br>" + 
                                    weather + 
                                    "Date: " + date + "<br>";

    
    var dataObj = new Blob([contentGlobal],{type: 'text/plain'})
    navigator.vibrate(500);
    alert("Your information has been saved. You can check your information in Record secction");
    fileEntry.createWriter(function (fileWriter) {

        if (!dataObj) {
            dataObj = new Blob(['Hello'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

    });
    
}

// Function to read the information
function readFile() {

    // Get the file from the file entry
    fileEntryGlobal.file(function (file) {
        
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onloadend = function() {

            document.getElementById('content').innerHTML = contentGlobal;
            contentGLobal = this.result;

        };

    }, onError);
}

// Functions to take a picture       
function pics(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    destinationType: Camera.DestinationType.FILE_URI });
}

function onSuccess(imageURI) {
    var image = document.getElementById('myImage');
    image.src = imageURI;
    //alert(imageURI);
}

function onFail(message) {
    alert('Failed because: ' + message);
}
 

       