let lat1, lon1, lat2, lon2

//Para poner musiquita
function onPlayerReady(event) {
  event.target.playVideo();
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: '_ueM9sNrSmU',
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: '_ueM9sNrSmU'
    },
  });
}

    // latitud=phi   longitud=lambda

    // Función para calcular el rumbo y la distancia en una ruta loxodrómica
  function calcLoxo(lat1, lon1, lat2, lon2) {
    let rumbolox=0
    let dislox=0
    var radioTierra = 6371; // en kilómetros
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    dislox = radioTierra * Math.sqrt(dLat*dLat + dLon*dLon);
    rumbolox = Math.atan2(dLon, dLat) * 180 / Math.PI;
    if (rumbolox < 0) rumbolox += 360;
    return [rumbolox.toFixed(3), dislox.toFixed(3)];
  }

  // Función para calcular el rumbo y la distancia en una ruta ortodrómica
  function calcOrto(lat1, lon1, lat2, lon2) {
    let rumboort=0
    let distort=0
    var radioTierra = 6371; // en kilómetros
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distort = radioTierra * c;
    rumboort = Math.atan2(Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180), Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon)) * 180 / Math.PI;
    if (rumboort < 0) rumboort += 360;
    return [rumboort.toFixed(3), distort.toFixed(3)];
  }

//Creo el mapa
const mymap = L.map("map",{
minZoom: 1
}).setView([39.484, -0.481], 9);

// Agrega una capa de OpenStreetMap al mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: 'Alberto Notario &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(mymap);

// Para añadir la ubi
L.control.locate().addTo(mymap);

// Pongo un marcador en la ETSIAE con su logo
var marcador2 = L.icon({
  iconUrl:'https://www.etsiae.upm.es/fileadmin/documentos/Escuela/Conoce_la_Escuela/Identidad_Grafica/Images/ETSIAE-PNG.png',
  iconSize: [95, 85]
});
var marker2 = L.marker([40.440524, -3.724566], {icon: marcador2}).addTo(mymap);
marker2.bindPopup("<b>Aquí se encuentra la ETSIAE</b><br><a href='https://www.etsiae.upm.es' target='_blank'>Web ETSIAE</a>");

//Agregamos un evento que detecta cuando cambia el nivel de zoom del mapa
mymap.on('zoomend', function() {
  var currentZoom = mymap.getZoom();
  
  if (currentZoom < 10) { //Si el zoom es menor que 10, ocultar el marcador de la ETSIAE y no dejar hacer click
    marker2.setOpacity(0);
    marker2.off('click');
  } else { //Si el zoom es igual o mayor que 10, muestra el marcador y deja hacer click
    marker2.setOpacity(1);
    marker2.on('click', function() {marker2.openPopup();});
  }
});

// Aquí voy a almacenar las coordenadas
let coords = [];

// Agrego al mapa el controlador de eventos
mymap.on("click", onMapClick);

// Cuendo clickas en el mapa se activa
function onMapClick(e) {
  // Sirve para asegurarte que máximo hay 2 clicks
  if (coords.length < 2) {
    // Agrega el punto seleccionado
    coords.push(e.latlng);

    // Crea un marcador en el punto seleccionado
    var marker1 = L.marker(e.latlng);
    marker1.bindPopup('<span style="font-size: 12px; font-weight: bold;">Latitud: ' + e.latlng.lat.toFixed(3) + '<br>Longitud: ' + e.latlng.lng.toFixed(3) + '</span>');
    marker1.addTo(mymap);

    console.log(`Latitud: ${e.latlng.lat}, Longitud: ${e.latlng.lng}`); //Ya no sirve

    // Si ya se seleccionaron 2 puntos, ya puedo calcular los rumbos
    if (coords.length === 2) {
        // Me guardo las coordenadas de los dos puntos
        const lat1 = coords[0].lat;
        const lat2 = coords[1].lat;
        const lon1 = coords[0].lng;
        const lon2 = coords[1].lng;

        // Calculo rumb y dist iniciando sus respectivas funciones
        const [rumboort, distort] = calcOrto(lat1, lon1, lat2, lon2);
        const [rumbolox, distlox] = calcLoxo(lat1, lon1, lat2, lon2);


        // Para borrar
        const botonBorrar = document.getElementById("borrar");
        
        botonBorrar.addEventListener("click", borrarMarcadores);

        function borrarMarcadores() {
          // Elimina los marcadores del mapa excepto (ETSIAE)
          mymap.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer !== marker2) {
              mymap.removeLayer(layer);
            }
          });
    
          coords = []; // Reinicia las coords


          // Limpia el HTML que muestra las coordenadas y los rumbos
          document.getElementById("rumbolox").innerHTML = "";
          document.getElementById("distlox").innerHTML = "";
          document.getElementById("rumboort").innerHTML = "";
          document.getElementById("distort").innerHTML = "";
          distanciauds1.innerHTML = "<strong>DISTANCIA [Km]:</strong>";
          distanciauds2.innerHTML = "<strong>DISTANCIA [Km]:</strong>";
          BotonNM1.style.backgroundColor = " rgb(42, 183, 129)";
          BotonNM2.style.backgroundColor = "rgb(232, 187, 163)";
        }
          
          //Llevo al HTML los resultados
          document.getElementById("rumbolox").innerHTML = rumbolox;
          document.getElementById("distlox").innerHTML = distlox;
          document.getElementById("rumboort").innerHTML = rumboort;
          document.getElementById("distort").innerHTML = distort;

          //Para pasar a NM al pulsar el botón
          document.getElementById("BotonNM1").addEventListener("click", convertirMillasNauticas);
          document.getElementById("BotonNM2").addEventListener("click", convertirMillasNauticas);

          function convertirMillasNauticas() {
            BotonNM1.style.backgroundColor = "green";
            BotonNM2.style.backgroundColor = "orange";
            let distortnm = distort * 0.539957;
            let distloxnm = distlox * 0.539957;
            document.getElementById("distort").innerHTML = distortnm.toFixed(3);
            document.getElementById("distlox").innerHTML = distloxnm.toFixed(3);

            const distanciauds1 = document.getElementById('distanciauds1');
            const distanciauds2 = document.getElementById('distanciauds2');

            //Cambio l texto que especifica las unidades
            if (distanciauds1.textContent === "DISTANCIA [Km]:") {
              distanciauds1.innerHTML = "<strong>DISTANCIA [NM]:</strong>";
            }
            if (distanciauds2.textContent === "DISTANCIA [Km]:") {
              distanciauds2.innerHTML = "<strong>DISTANCIA [NM]:</strong>";
            }
          } 
    }
  }
}





