document.addEventListener('DOMContentLoaded', async () => {
    const ELDENRING_API_URL = "https://eldenring.fanapis.com/api/items?limit=100";
    const container = document.getElementById('item-list');

    const filterInput = document.getElementById('itemFilter'); 
    
    let ALL_ITEMS = []; 
    
    container.innerHTML = '<span class="text-white">Cargando la lista de ítems de Elden Ring...</span>';


    const renderItems = (itemsToRender) => {
        container.innerHTML = ''; 

        if (itemsToRender.length === 0) {
            container.innerHTML = '<span class="text-red-400">No se encontraron ítems con ese filtro.</span>';
            return;
        }

        itemsToRender.forEach(item => {
            const el = document.createElement('div');

            el.className = 'bg-white/80 rounded-lg shadow-lg p-4 w-80 flex flex-col gap-2';
            
            const formattedName = item.name || 'Ítem Desconocido';
            
            el.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900">${formattedName}</h3>
                
                <img src="${item.image || 'https://via.placeholder.com/64x64?text=No+Img'}" 
                     alt="Imagen de ${formattedName}" 
                     class="w-16 h-16 object-contain self-center mb-2" />
                
                <p class="text-gray-700">
                    <span class="font-semibold">Categoría:</span> ${item.category || 'N/A'}
                </p>
                
                <p class="text-gray-700">
                    <span class="font-semibold">Descripción:</span> 
                    ${item.description || 'Sin descripción.'}
                </p>
            `;
            container.appendChild(el);
        });
    };

    if (filterInput) {
        filterInput.disabled = true;
    }

    try {

        const listRes = await fetch(ELDENRING_API_URL);
        
        if (!listRes.ok) {
            throw new Error(`Error HTTP: ${listRes.status}`);
        }
        
        const listData = await listRes.json();
        

        ALL_ITEMS = listData.data.map(item => ({
            name: item.name,
            image: item.image,
            description: item.description,
            category: item.category

        }));
        

        renderItems(ALL_ITEMS);


        if (filterInput) {
            filterInput.disabled = false;
        }

    } catch (e) {
        console.error("Error al cargar ítems de Elden Ring:", e);
        container.innerHTML = '<span class="text-red-400">Error al cargar los datos de ítems de Elden Ring.</span>';
        return; 
    }


    if (filterInput) {
        filterInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            
            if (!searchTerm) {
   
                renderItems(ALL_ITEMS);
                return;
            }


            const filteredItems = ALL_ITEMS.filter(item => {
                const name = item.name ? item.name.toLowerCase() : '';
                const description = item.description ? item.description.toLowerCase() : '';
                
                const nameMatch = name.includes(searchTerm);
                const descriptionMatch = description.includes(searchTerm);
                
                return nameMatch || descriptionMatch;
            });

            renderItems(filteredItems);
        });
    }
});