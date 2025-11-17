document.addEventListener("DOMContentLoaded", async () => {
  const section = document.getElementById("section-offert");
  section.innerHTML = "<p class='text-white'>Cargando ofertas...</p>";

  try {
    // Tu API propia
    const response = await fetch("http://127.0.0.1:8000/api/v1/games/"); 
    const deals = await response.json();

    section.innerHTML = "";
    deals.forEach(deal => {
      // Calculamos el precio con descuento
      const precioFinal = (deal.price * (100 - deal.discount)) / 100;

      section.innerHTML += `
        <div class="offer-card flex flex-col hover:scale-105 transition-transform relative" 
             title="${deal.name}">
          <div class="relative">
            <img src="${deal.image}" alt="${deal.name}" 
                 class="h-32 w-64 self-center object-cover rounded-lg"/>
            <span class="absolute bottom-2 right-2 bg-yellow-300 border-2 border-yellow-600 
                         rounded-lg px-2 py-1 text-red-600 font-bold text-lg shadow-lg">
              ${deal.discount}%
            </span>
          </div>
          <div class="flex justify-center">
            <h3 class="text-white font-bold text-center">${deal.name}</h3>
          </div>
          <div class="flex justify-center gap-2 mt-1">
            <span class="text-green-400 font-bold">\$${precioFinal.toFixed(2)}</span>
            <span class="text-gray-400 line-through">\$${deal.price}</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
    section.innerHTML = "<p class='text-red-500'>Error al cargar ofertas.</p>";
  }
});