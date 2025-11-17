// URL base de tu API NestJS
const API_BASE = "http://localhost:3000";

// Colores para cada tier (por nombre)
const tierColors = {
  S: "bg-red-500",
  A: "bg-orange-500",
  B: "bg-yellow-400",
  C: "bg-slate-500",
  Personajes: "bg-sky-500"
};

let tiersById = {};
let currentItems = [];

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("tierlist-container");
  container.innerHTML = "<p class='text-white'>Cargando tier list...</p>";

  try {
    // 1) Traemos tiers e items de la API Nest
    const [tiersRes, itemsRes] = await Promise.all([
      fetch(`${API_BASE}/tiers`),
      fetch(`${API_BASE}/items`)
    ]);

    const tiers = await tiersRes.json();
    const items = await itemsRes.json();
    currentItems = items;

    // 2) Guardamos un mapa tierId -> tier y los ordenamos por 'order'
    tiers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    tiersById = tiers.reduce((acc, tier) => {
      acc[tier.id] = tier;
      return acc;
    }, {});

    // 3) Renderizamos la estructura de filas de Tier
    renderTierRows(tiers);

    // 4) Colocamos los personajes en su fila correspondiente
    placeItems(items);
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p class='text-red-300'>No se pudo cargar la tier list. Revisa que la API NestJS esté corriendo en http://localhost:3000 y que tenga CORS habilitado.</p>";
  }
});

/** Crea las filas visuales de la tierlist (S, A, B, C, Personajes) */
function renderTierRows(tiers) {
  const container = document.getElementById("tierlist-container");
  container.innerHTML = "";

  // 1) Separar la tier "Personajes" del resto
  const poolTier = tiers.find((t) => t.name === "Personajes");
  const mainTiers = tiers
    .filter((t) => !poolTier || t.id !== poolTier.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 2) Contenedor de las tiers principales (S/A/B/C)
  const mainWrapper = document.createElement("div");
  mainWrapper.className = "flex flex-col gap-3 w-full";

  mainTiers.forEach((tier) => {
    const row = document.createElement("div");
    row.className = "flex items-stretch gap-3 w-full";

    const colorClass = tierColors[tier.name] || "bg-gray-700";

    row.innerHTML = `
      <div class="w-24 md:w-32 flex items-center justify-center ${colorClass} rounded-xl font-bold text-xl border border-white/40 shadow-lg">
        ${tier.name}
      </div>
      <div
        class="flex-1 min-h-28 bg-black/40 rounded-xl p-2 flex flex-wrap gap-2 items-start border border-white/10"
        data-tier-id="${tier.id}"
      ></div>
    `;

    mainWrapper.appendChild(row);
  });

  container.appendChild(mainWrapper);

  // 3) Debajo, la fila especial de "Personajes" más separada
  if (poolTier) {
    // Separador visual
    const separator = document.createElement("div");
    separator.className = "mt-8 mb-4 border-t border-white/30";
    container.appendChild(separator);

    const label = document.createElement("p");
    label.className = "text-center text-sm md:text-base text-white/80 mb-2";
    label.textContent =
      "Personajes disponibles (arrástralos hacia arriba al rango que quieras):";
    container.appendChild(label);

    const poolRow = document.createElement("div");
    poolRow.className = "flex items-stretch gap-3 w-full";

    const colorClass = tierColors[poolTier.name] || "bg-gray-700";

    poolRow.innerHTML = `
      <div class="w-24 md:w-32 flex items-center justify-center ${colorClass} rounded-xl font-bold text-xl border border-white/40 shadow-lg">
        ${poolTier.name}
      </div>
      <div
        class="flex-1 min-h-28 bg-black/40 rounded-xl p-2 flex flex-wrap gap-2 items-start border border-white/10"
        data-tier-id="${poolTier.id}"
      ></div>
    `;

    container.appendChild(poolRow);
  }

  // 4) Volver a enganchar los eventos de drop en TODAS las zonas
  const dropzones = container.querySelectorAll("[data-tier-id]");
  dropzones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("drop", handleDrop);
  });
}


/** Crea la card del personaje */
function createItemCard(item) {
  const card = document.createElement("div");
  card.className =
    "cursor-move bg-white/90 rounded-lg shadow-md p-2 w-24 md:w-28 flex flex-col items-center gap-1 hover:scale-105 transition-transform";
  card.draggable = true;
  card.dataset.itemId = item.id;

  const safeImg =
    item.imageUrl && item.imageUrl.trim().length > 0
      ? item.imageUrl
      : "../assets/games/megabonk.jpg"; // placeholder genérico

  card.innerHTML = `
    <img
      src="${safeImg}"
      alt="${item.name}"
      class="w-16 h-16 object-cover rounded-md border border-gray-300"
    />
    <span class="text-xs text-center text-gray-900 font-semibold">
      ${item.name}
    </span>
  `;

  // Eventos de drag
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);

  return card;
}

/** Coloca cada item en el tier que le corresponde por tierId */
function placeItems(items) {
  const container = document.getElementById("tierlist-container");
  const dropzones = container.querySelectorAll("[data-tier-id]");

  // limpiamos cada zona
  dropzones.forEach((zone) => (zone.innerHTML = ""));

  items.forEach((item) => {
    const tierId =
      item.tierId ||
      (item.tier && item.tier.id) ||
      5; // por si viene con relación o solo con tierId

    const zone = container.querySelector(`[data-tier-id="${tierId}"]`);
    if (!zone) return;

    const card = createItemCard(item);
    zone.appendChild(card);
  });
}

/* ========== DRAG & DROP HANDLERS ========== */

let draggedCard = null;

function handleDragStart(event) {
  draggedCard = event.currentTarget;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedCard.dataset.itemId);
  draggedCard.classList.add("ring-2", "ring-blue-500");
}

function handleDragEnd() {
  if (draggedCard) {
    draggedCard.classList.remove("ring-2", "ring-blue-500");
  }
  draggedCard = null;
}

function handleDragOver(event) {
  event.preventDefault(); // necesario para permitir drop
  event.dataTransfer.dropEffect = "move";
}

async function handleDrop(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;
  const newTierId = parseInt(dropzone.dataset.tierId, 10);

  const itemId = event.dataTransfer.getData("text/plain");
  if (!itemId) return;

  const card =
    draggedCard ||
    document.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`);
  if (!card) return;

  dropzone.appendChild(card);

  // Persistimos el cambio en la API (PATCH /items/:id)
  try {
    await fetch(`${API_BASE}/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tierId: newTierId })
    });
  } catch (err) {
    console.error("Error actualizando tier del item:", err);
  }
}
