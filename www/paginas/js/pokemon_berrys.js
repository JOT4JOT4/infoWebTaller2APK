document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('item-list');
    const filterInput = document.getElementById('berryFilter');
    
    let ALL_BERRIES = []; 
    
    container.innerHTML = '<span class="text-white">Cargando la lista de bayas...</span>';

    const renderBerries = (berriesToRender) => {
        container.innerHTML = ''; 

        if (berriesToRender.length === 0) {
            container.innerHTML = '<span class="text-red-400">No se encontraron bayas con ese filtro.</span>';
            return;
        }

        berriesToRender.forEach(berry => {
            const el = document.createElement('div');
            el.className = 'bg-white/80 rounded-lg shadow-lg p-4 w-80 flex flex-col gap-2';
            
            const formattedName = berry.name.charAt(0).toUpperCase() + berry.name.slice(1);
            
            el.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900">${formattedName}</h3>
                
                <img src="${berry.image}" alt="Imagen de ${formattedName}" class="w-16 h-16 object-contain self-center mb-2" />
                
                <p class="text-gray-700">
                    <span class="font-semibold">Firmeza:</span> ${berry.firmness || 'Desconocida'}
                </p>
                
                <p class="text-gray-700">
                    <span class="font-semibold">Efecto:</span> ${berry.description || 'Sin efecto.'}
                </p>
            `;
            container.appendChild(el);
        });
    };

    if (filterInput) {
        filterInput.disabled = true;
    }


    try {

        const listRes = await fetch('https://pokeapi.co/api/v2/berry/');
        const listData = await listRes.json();
        
        const detailPromises = listData.results.map(async (berry) => {
            const detailRes = await fetch(berry.url);
            const detailData = await detailRes.json();
            

            const itemUrl = detailData.item.url;
            const itemRes = await fetch(itemUrl);
            const itemData = await itemRes.json();
            
            return {
                name: berry.name,
                image: itemData.sprites.default, 
                description: itemData.effect_entries[0].effect,
                firmness: detailData.firmness.name
            };
        });
        

        ALL_BERRIES = await Promise.all(detailPromises);
        

        renderBerries(ALL_BERRIES);

        if (filterInput) {
            filterInput.disabled = false;
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<span class="text-red-400">Error al cargar los datos de las bayas de Pokémon.</span>';
        return;
    }


    if (filterInput) {
        filterInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            
            if (!searchTerm) {

                renderBerries(ALL_BERRIES);
                return;
            }


            const filteredBerries = ALL_BERRIES.filter(berry => {

                const nameMatch = berry.name.toLowerCase().includes(searchTerm);
                const firmnessMatch = berry.firmness.toLowerCase().includes(searchTerm);
                
                return nameMatch || firmnessMatch;
            });

            renderBerries(filteredBerries);
        });
    }
});