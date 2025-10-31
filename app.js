// Vivac Go - Vanilla JS
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180;
  const Δλ = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

let postas=[];

const statusEl = document.getElementById('status');
const posEl = document.getElementById('posinfo');
const listaEl = document.getElementById('lista');
const forceBtn = document.getElementById('force');

const recorridoNameEl = document.getElementById('recorrido-name');

const infoCardEl = document.getElementById('info-card');
const orientationCardEl = document.getElementById('orientation-card');
const distanceEl = document.getElementById('distance');
let startingPoint;
let lastPosition;
let closestPosta = null;
let minDistance = Infinity;
let currentLat = 0;
let currentLon = 0;

fetch('postas.json').then(r=>r.json()).then(data=>{
  console.log('Fetched data:', data);
  startingPoint = data.startingPoint;
  infoCardEl.innerHTML = ''; // Start empty
  infoCardEl.style.display = 'none'; // Start hidden
  let recorridoId = localStorage.getItem('recorridoId');
  if (!recorridoId) {
    recorridoId = Math.floor(Math.random() * data.recorridos.length);
    localStorage.setItem('recorridoId', recorridoId);
  }
  const recorrido = data.recorridos[recorridoId];
  console.log('Assigned recorrido:', recorrido);
  postas = recorrido.postas;
  console.log('Postas for current recorrido:', postas);
  recorridoNameEl.textContent = recorrido.name;
  statusEl.textContent = 'Esperando geolocalización...';
  renderList();
}).catch(e=>{ statusEl.textContent='Error cargando postas'; console.error(e); });

function renderList(){
  listaEl.innerHTML='';
  postas.forEach(p=>{
    const done = localStorage.getItem('completed_'+p.id);
    const li = document.createElement('li');
    const statusClass = done ? 'completed' : 'incomplete';
    li.innerHTML = `<div><strong>${p.name}</strong></div><div class="status ${statusClass}"></div>`;
    li.onclick = () => {
      infoCardEl.innerHTML = `<h2>${p.name}</h2><p>${p.description}</p>`;
      infoCardEl.style.display = 'block';
    };
    listaEl.appendChild(li);
  });
}

function onPosition(pos){
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const acc = pos.coords.accuracy;
  currentLat = lat;
  currentLon = lon;
  posEl.textContent = lat.toFixed(6)+', '+lon.toFixed(6)+' (±'+Math.round(acc)+' m)';

  let inPosta = false;
  postas.forEach(p=>{
    const d = distanceMeters(lat,lon,p.lat,p.lon);
    const key = 'completed_'+p.id;
    const done = localStorage.getItem(key);
    if (d <= p.radius) {
      inPosta = true;
      infoCardEl.innerHTML = `<h2>${p.name}</h2><p>${p.description}</p>`;
      infoCardEl.style.display = 'block';
      console.log('infoCardEl content (inPosta):', infoCardEl.innerHTML);
      if (!done) {
        localStorage.setItem(key, JSON.stringify({at:new Date().toISOString(), lat, lon}));
        statusEl.textContent = '¡Posta completada: '+p.name+'!';
        renderList();
        try{ navigator.vibrate && navigator.vibrate(200); }catch(e){}
      }
    }
  });

  if (!inPosta) {
    infoCardEl.innerHTML = '';
    infoCardEl.style.display = 'none';
    console.log('infoCardEl content (not inPosta): hidden');
  }

    closestPosta = null;
  minDistance = Infinity;
  let allPostasCompleted = true;
  for (let i = 0; i < postas.length; i++) {
    const p = postas[i];
    const key = 'completed_'+p.id;
    const done = localStorage.getItem(key);
    if (!done) {
      allPostasCompleted = false;
      closestPosta = p;
      minDistance = distanceMeters(lat,lon,p.lat,p.lon);
      break; // Found the next incomplete posta
    }
  }


  if (allPostasCompleted) {
    statusEl.textContent = '¡Recorrido completado!';
    orientationCardEl.style.display = 'none';
  } else if (closestPosta) {
    statusEl.textContent = `A ${Math.round(minDistance)} m de ${closestPosta.name}`;
    orientationCardEl.style.display = 'flex';
    distanceEl.textContent = `Distancia: ${Math.round(minDistance)} m`;
  } else {
    statusEl.textContent = 'Esperando geolocalización...';
    orientationCardEl.style.display = 'none';
  }

  lastPosition = pos;
}

function onError(err){ statusEl.textContent = `GPS Error: ${err.message || err.code}. Por favor, asegúrate de que el GPS esté activado y los permisos de ubicación concedidos.`; console.error('GPS Error:', err); }

if ('geolocation' in navigator){
  forceBtn.onclick = ()=> navigator.geolocation.getCurrentPosition(onPosition, onError, {enableHighAccuracy:true});
} else {
  statusEl.textContent = 'GPS no disponible en este dispositivo';
  forceBtn.disabled = true;
}