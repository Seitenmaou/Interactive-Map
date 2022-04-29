//Current User Location
async function getCoords(){
    pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    })
    
    return [pos.coords.latitude, pos.coords.longitude]
}

//Init user location coordinates as global for access to all function
let userCoords
const searchLimit = 5
let nearbyLocations = []

//list of category buttons
let categoryButtonID = [
    "button-cafe",
    "button-diners",
    "button-groceries",
    "button-gas"
]

//Load map AFTER geting user coordinates
window.onload = async () => {
    userCoords = await getCoords()
    const myMap = L.map('map', {
        center: userCoords,
        zoom: 1,
    });

    // Add openStreetMap tiles:
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: '10',
    }).addTo(myMap)

    //Custom Pin
    const redPin = L.icon({
        iconUrl: './assets/red-pin.png',
        iconSize: [38, 38],
        iconAnchor: [19, 15],
    })

    //Current Locaion Marker
    const marker = L.marker(userCoords, {icon: redPin})
    marker.addTo(myMap).bindPopup('<p1><b>You are here</b></p1>').openPopup()

    //create buttons for search query
    categoryButtonID.forEach((buttonID) => {
        document.getElementById(buttonID).addEventListener('click', () => {

            //get category from button id
            let searchCategory = buttonID.split('-').pop();

            const options = {
                method: 'GET',
                headers: {
                Accept: 'application/json',
                Authorization: 'fsq3Waw4qmGXNVBhfWEFZ+u2DEyC/S2VuyisWy4G/9VECuw='
                }
            };
            
            let userCoordsLat = userCoords[0];
            let userCoordsLon = userCoords[1];

            //search query
            fetch(`https://api.foursquare.com/v3/places/search?query=${searchCategory}&ll=${userCoordsLat}%2C${userCoordsLon}&limit=${searchLimit}`, options)
                .then(response => response.json())
                .then(response => addNearbyLocations(response))
                .catch(err => console.error(err));
        })
    })

    //make list and markers of coordinates for nearby locations
    function addNearbyLocations(list){

        clearSearch()

        for (let i = 0; i < searchLimit; i++){
            let newNearbyLocation = new L.marker([list.results[i].geocodes.main.latitude, list.results[i].geocodes.main.longitude])
               nearbyLocations.push(newNearbyLocation)
               newNearbyLocation.addTo(myMap).bindPopup(list.results[i].name)
               console.log(nearbyLocations[i])
        }
    }

    //remove any previous search
    function clearSearch(){
        console.log(searchLimit)
        for (let i = searchLimit; i >= 0; i--){
            if (nearbyLocations[i] != null){
                console.log(i)
                myMap.removeLayer(nearbyLocations[0])
                nearbyLocations.shift()
            }
        }
    }
}

    