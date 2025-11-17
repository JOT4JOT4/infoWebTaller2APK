document.addEventListener('DOMContentLoaded', async () => {
    const DND_API_BASE_URL = "https://www.dnd5eapi.co";
    const container = document.getElementById('item-list');
    const filterInput = document.getElementById('monsterFilter'); 
    
    let ALL_MONSTERS = []; 

    container.innerHTML = '<span class="text-white">Cargando la lista de monstruos de D&D...</span>';
    
    const renderMonsters = (monstersToRender) => {
        container.innerHTML = ''; 

        if (monstersToRender.length === 0) {
            container.innerHTML = '<span class="text-red-400">No se encontraron monstruos con ese filtro.</span>';
            return;
        }

        monstersToRender.forEach(monster => {
            const el = document.createElement('div');
            el.className = 'bg-white/80 rounded-lg shadow-lg p-4 w-80 flex flex-col gap-2';
            
            const formattedName = monster.name;
            
            el.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900">${formattedName}</h3>
                
                <img src="${monster.image}" alt="Imagen de ${formattedName}" class="w-16 h-16 object-contain self-center mb-2" />
                
                <p class="text-gray-700"><span class="font-semibold">Tamaño:</span> ${monster.size || 'N/A'}</p>
                <p class="text-gray-700"><span class="font-semibold">Tipo:</span> ${monster.type || 'N/A'}</p>
                <p class="text-gray-700"><span class="font-semibold">Clase Armadura (AC):</span> ${monster.armorClass || 'N/A'}</p>
                <p class="text-gray-700"><span class="font-semibold">Puntos de Golpe (HP):</span> ${monster.hitPoints || 'N/A'}</p>
                <p class="text-gray-700"><span class="font-semibold">Velocidad:</span> ${monster.speed || 'N/A'}</p>
            `;
            container.appendChild(el);
        });
    };

    filterInput.disabled = true;

    try {
        const listUrl = `${DND_API_BASE_URL}/api/monsters`;
        const listRes = await fetch(listUrl);

        if (!listRes.ok) {
            throw new Error(`Error al obtener la lista (HTTP ${listRes.status}).`);
        }
        
        const listData = await listRes.json();
        
        const detailPromises = listData.results.map(async (monster) => {
            
            const detailUrl = `${DND_API_BASE_URL}${monster.url}`; 
            
            try {
                const detailRes = await fetch(detailUrl);
                if (!detailRes.ok) {
                    console.warn(`Advertencia: No se pudieron obtener los detalles de ${monster.name} (HTTP ${detailRes.status}).`);
                    return null;
                }

                const detailData = await detailRes.json();
                
                let armorClassValue = 'N/A';
                if (detailData.armor_class && detailData.armor_class.length > 0) {
                    armorClassValue = detailData.armor_class[0].value;
                }
                
                const imagenUrl = detailData.image 
                    ? `${DND_API_BASE_URL}${detailData.image}` 
                    : 'https://via.placeholder.com/64x64?text=No+Img';

                const speedString = Object.entries(detailData.speed)
                    .map(([type, value]) => `${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`)
                    .join(', ');
                
                return {
                    name: detailData.name,
                    image: imagenUrl, 
                    size: detailData.size,
                    type: detailData.type,
                    armorClass: armorClassValue,
                    hitPoints: detailData.hit_points,
                    speed: speedString
                };

            } catch (err) {
                console.warn(`Advertencia: Fallo de red/parseo para ${monster.name}.`, err);
                return null;
            }
        });
        

        let monsters = await Promise.all(detailPromises);
        ALL_MONSTERS = monsters.filter(m => m !== null);
        

        renderMonsters(ALL_MONSTERS);
        

        filterInput.disabled = false;
        
    } catch (e) {
        console.error("Error grave al cargar la lista principal:", e);
        container.innerHTML = `<span class="text-red-400">Error: ${e.message}. Asegúrate de usar un servidor web local.</span>`;
        return;
    }
    

    filterInput.addEventListener('keyup', (event) => {

        const searchTerm = event.target.value.toLowerCase().trim();
        
        if (!searchTerm) {

            renderMonsters(ALL_MONSTERS);
            return;
        }


        const filteredMonsters = ALL_MONSTERS.filter(monster => {

            const nameMatch = monster.name.toLowerCase().includes(searchTerm);
            const typeMatch = monster.type.toLowerCase().includes(searchTerm);
            
            return nameMatch || typeMatch;
        });


        renderMonsters(filteredMonsters);
    });
});