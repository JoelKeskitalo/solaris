// Globala variabler
const baseURL = "https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies";
let planetsData = {}; // vi gör planetsData till ett tomt objekt just nu... det kommer att fyllas sen. det är infon om planeterna. 
let globalApiKey = ''; // samma koncept som ovan, en tom sträng som sedan kommer att innahålla vår API-nyckel 


// Här tillskriver vi ett nr för varje planet, underlättar hämtningen genom API senare
const planetIdMap = {
    mercury: 1,
    venus: 2,
    earth: 3,
    mars: 4,
    jupiter: 5,
    saturn: 6,
    uranus: 7,
    neptune: 8
};



// Funktion för att sätta upp eventlyssnare på planeterna
function setupPlanetEventListeners() {
    const planets = document.querySelectorAll('.planet'); // deklaration av variabeln planets, som innehåller en selector som ska "targeta" alla planeterna, dvs. klassen '.planet', se HTML
    planets.forEach(planet => { // en for each loop, dvs gå igenom varje planet 
        planet.addEventListener('click', () => { // när en planet klickas på så anropas funktionen setupPlanetEventListeners
            const planetNumericId = planetIdMap[planet.id];
            if (planetNumericId) {
                displayPlanetInfo(planetNumericId); // här anropar vi funktionen displayPlanetInfo, en funktion som skapats nedan på rad 95 
            } else {
                console.error('Kunde inte hitta numeriskt ID för planeten:', planet.id);
            }
        });
    });

    document.getElementById('close-info').addEventListener('click', closePlanetInfo);
}



// Funktion för att hämta API-nyckeln
async function getApiKey() {
    try {
        const response = await fetch("https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(`API-nyckel anrop misslyckades: ${response.status}`);
        }

        const data = await response.json();
        return data.key;
    } catch (error) {
        console.error("Ett fel uppstod vid hämtning av API-nyckeln:", error);
    }
}



// Funktion för att hämta och lagra all planetdata
async function getPlanets() {
    try {
        globalApiKey = await getApiKey();
        const response = await fetch(baseURL, {
            method: "GET",
            headers: { "x-zocom": globalApiKey },
        });

        if (!response.ok) {
            throw new Error(`Fel vid hämtning av planetdata: ${response.status}`);
        }
        const data = await response.json();
        planetsData = data.bodies;
    } catch (error) {
        console.error("Ett fel uppstod: ", error);
    }
}



// Funktion för att dölja andra planeter, ändra solens färg samt ta fram stjärnorna i bakgrunden. FIXA: se till så att stjärnorna inte hamnar i soleN!! 
function hideOtherPlanets() {
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
        if (planet.id !== 'sun') {
            planet.style.display = 'none';
        }
    });
    document.getElementById('sun').style.backgroundColor = 'blue'; // gör så att solen blir blå
}




// Funktion för att visa information om en planet
async function displayPlanetInfo(planetId) {
    const planet = planetsData.find(p => p.id === planetId);

    if (!planet) {
        console.error('Kunde inte hitta planeten med ID:', planetId);
        return;
    }

    // Dölj andra planeter och ändra solens färg
    hideOtherPlanets(planetId);

    // Uppdatera planetinformationen
    const planetInfoDiv = document.getElementById("planet-info");
    planetInfoDiv.style.display = "block";
    planetInfoDiv.innerHTML = `
    <h3 class="planet-title">${planet.name}</h3>
    <p class="planet-subtitle">${planet.latinName}</p>
    <p>${planet.desc}</p>
    <hr class="info-separator">
    <p><strong>Omkrets:</strong> ${planet.circumference} km</p>
    <p><strong>Avstånd från solen:</strong> ${planet.distance} km</p>
    <p><strong>Dagens temperatur:</strong> ${planet.temp.day} °C</p>
    <p><strong>Nattens temperatur:</strong> ${planet.temp.night} °C</p>
    <p><strong>Rotationstid:</strong> ${planet.rotation} jorddygn</p>
    <p><strong>Banperiod:</strong> ${planet.orbitalPeriod} jorddygn</p>
    <hr class="info-separator">
    <p>Månar: ${planet.moons.join(", ")}</p>
`;

}



// Funktion för att stänga planetinformationen och återställa visningen
function closePlanetInfo() {
    // Dölj informationsrutan
    document.getElementById('planet-info').style.display = 'none';

    // Visa alla planeter och återställ solens färg
    document.querySelectorAll('.planet').forEach(planet => {
        planet.style.display = 'block';
    });
    document.getElementById('sun').style.backgroundColor = 'rgb(255, 187, 0)';
}



// Laddar planetdata och ställer in eventlyssnare när sidan laddas
document.addEventListener('DOMContentLoaded', async () => {
    await getPlanets();
    setupPlanetEventListeners(); // här anropar vi ju funktionen som vi skapade på rad 22, dvs funktionen som sätter på eventlyssnare på planeterna 
});





// en händelselyssnare som väntar på att HTML, CSS och Javascript är fullständigt laddat innan de kör koden. All data ska vara tillgänglig för manipulation innan javascriptkoden körs 
document.addEventListener('DOMContentLoaded', () => {
    const planetInfo = document.getElementById('planet-info');
    const planets = document.querySelectorAll('.planet');
    const sun = document.getElementById('sun');

    // Funktion för att lägga till stjärnor
    function addStars() {
        for (let i = 0; i < 50; i++) {
            let star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * window.innerWidth}px`;
            star.style.top = `${Math.random() * window.innerHeight}px`;
            document.body.appendChild(star);
        }
    }

    // Funktion för att ta bort stjärnor
    function removeStars() {
        document.querySelectorAll('.star').forEach(star => star.remove());
    }

    // Funktion för att återställa vyn till startsidan
    function resetView() {
        planetInfo.style.display = 'none'; // Stäng informationsrutan
        sun.classList.remove('sun-glow'); // Ta bort skimmer-effekten från solen
        removeStars(); // Ta bort stjärnorna
        // Återställ solens färg och visa alla planeter
        document.querySelectorAll('.planet').forEach(planet => {
            planet.style.display = 'block';
        });
        document.getElementById('sun').style.backgroundColor = 'rgb(255, 187, 0)';
    }

    // Hantera klick utanför planeterna och informationsrutan
    document.addEventListener('click', function(event) {
        if (!planetInfo.contains(event.target) && !Array.from(planets).includes(event.target)) {
            resetView();
        }
    });

    // Hantera klick på varje planet
    planets.forEach(planet => {
        planet.addEventListener('click', function() {
            planetInfo.style.display = 'block';
            sun.classList.add('sun-glow');
            addStars();
        });
    });
});


