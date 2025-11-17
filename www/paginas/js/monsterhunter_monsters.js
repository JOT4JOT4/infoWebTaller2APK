let monstersData = [];

function renderMonsters(monsters) {
  const container = document.getElementById('monster-list');
  if (monsters.length === 0) {
    container.innerHTML = '<span class="text-white">No se encontraron monstruos.</span>';
    return;
  }

  container.innerHTML = '';
  monsters.forEach(monster => {
    const el = document.createElement('div');
    el.className = 'bg-white/80 rounded-lg shadow-lg p-4 w-80 flex flex-col gap-2';

    el.innerHTML = `
      <div class="w-full flex justify-center mb-2">
        <img
          src="${monster.imagen || '../assets/placeholder-monster.png'}"
          alt="${monster.nombre}"
          class="w-24 h-24 object-contain"
        />
      </div>
      <h3 class="text-xl font-bold text-gray-900 text-center">${monster.nombre}</h3>

      <p class="text-gray-700">
        <span class="font-semibold">Tipo:</span>
        ${monster.tipo || 'Desconocido'}
      </p>

      <p class="text-gray-700">
        <span class="font-semibold">Elemento:</span>
        ${monster.elemento || 'Desconocido'}
      </p>

      <p class="text-gray-500 text-sm">ID: ${monster.id_monster}</p>
    `;

    container.appendChild(el);
  });
}

function getUnique(arr) {
  return [...new Set(arr.filter(e => e && e.length > 0))];
}

async function fetchMonsters() {
  const container = document.getElementById('monster-list');
  container.innerHTML = '<span class="text-white">Cargando...</span>';

  try {
    const res = await fetch('http://localhost:3001/monster');
    monstersData = await res.json();

    const typeSelect = document.getElementById('filter-type');
    const elementSelect = document.getElementById('filter-element');

    const types = getUnique(monstersData.map(m => m.tipo));
    const elements = getUnique(monstersData.map(m => m.elemento));

    types.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      typeSelect.appendChild(opt);
    });

    elements.forEach(element => {
      const opt = document.createElement('option');
      opt.value = element;
      opt.textContent = element;
      elementSelect.appendChild(opt);
    });

    renderMonsters(monstersData);
  } catch (e) {
    console.error(e);
    container.innerHTML = '<span class="text-red-400">Error al cargar los datos de monstruos.</span>';
  }
}

function applyFilters() {
  const name = document.getElementById('search-name').value.toLowerCase();
  const type = document.getElementById('filter-type').value;
  const element = document.getElementById('filter-element').value;

  const filtered = monstersData.filter(monster => {
    const matchName = monster.nombre.toLowerCase().includes(name);
    const matchType = !type || monster.tipo === type;
    const matchElement = !element || monster.elemento === element;
    return matchName && matchType && matchElement;
  });

  renderMonsters(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchMonsters();

  document.getElementById('search-name').addEventListener('input', applyFilters);
  document.getElementById('filter-type').addEventListener('change', applyFilters);
  document.getElementById('filter-element').addEventListener('change', applyFilters);
});
