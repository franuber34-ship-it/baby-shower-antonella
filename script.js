// ⚠️ CONFIGURACIÓN IMPORTANTE ⚠️
// Cambia el número de teléfono en la línea 164 de este archivo
// Formato: código de país + número (sin +, sin espacios, sin guiones)
// Ejemplos:
//   México: 521234567890
//   España: 34612345678
//   Colombia: 573001234567
//   Argentina: 541112345678

// Array para almacenar los regalos seleccionados
let selectedGifts = [];

// Contador de asistentes confirmados
let totalAttendees = 0;

// Simulación de contador de regalos (en producción vendría de una base de datos)
let giftCounts = {
    // Transportación
    'Cambiador pegable': 0,
    'Silla de auto': 0,
    'Cochecito': 0,
    'Cuna de viaje': 0,
    'Sábanas de viaje': 0,
    'Mochila portabebe': 0,
    // Higiene y Cuidado
    'Pañales': 0,
    'Toallitas': 0,
    'Crema para sarpullido': 0,
    'Cubrepañal': 0,
    // Muebles y Descanso
    'Sillón de lactancia': 0,
    'Cuna Moisés': 0,
    'Mantas de bebes': 0,
    // Alimentación y Lactancia
    'Almohada de lactancia': 0,
    'Sostén de lactancia': 0,
    'Biberones': 0,
    'Esterilizador de biberón': 0,
    'Cepillo de biberón': 0,
    'Extractora': 0,
    // Ropa
    'Bodys': 0,
    'Pijama 1 pieza': 0,
    'Sueteres': 0,
    'Pantalones': 0,
    'Gorros': 0,
    'Conjuntos': 0,
    'Baberos': 0
};

// Actualizar contadores al cargar la página
window.addEventListener('load', function() {
    // Inicializar Firebase y sincronizar datos en tiempo real
    if (typeof firebase !== 'undefined') {
        syncGiftCounts();
        syncAttendeeCount();
    } else {
        // Fallback si Firebase no está disponible
        updateAllCounters();
        updateAttendeeCounter();
    }
});

// Función para actualizar todos los contadores
function updateAllCounters() {
    document.querySelectorAll('.gift-counter').forEach(counter => {
        const giftItem = counter.closest('.gift-item');
        const giftName = giftItem.dataset.gift;
        const count = giftCounts[giftName] || 0;
        
        counter.textContent = `(${count} ${count === 1 ? 'invitado' : 'invitados'})`;
        counter.classList.add('show');
    });
}

// Función para actualizar el contador de asistentes
function updateAttendeeCounter() {
    const counterElement = document.getElementById('attendeeCount');
    if (counterElement) {
        counterElement.textContent = totalAttendees;
    }
}

// Función para cambiar entre secciones
function showSection(sectionId, btnElem) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remover clase active de todos los botones
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Mostrar la sección seleccionada (si existe)
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Activar el botón pasado desde el onclick o buscar uno que coincida
    if (btnElem) {
        btnElem.classList.add('active');
    } else {
        // Fallback: buscar botón cuya llamada inline contiene el id (por compatibilidad)
        const fallbackBtn = document.querySelector(`.nav-btn[onclick*="'${sectionId}'"]`);
        if (fallbackBtn) fallbackBtn.classList.add('active');
    }

    // Si es la sección de confirmar, actualizar los regalos seleccionados
    if (sectionId === 'confirmar') {
        updateSelectedGiftsDisplay();
    }
}

// Función para alternar (toggle) categorías de regalos
function toggleCategory(button) {
    const giftsGrid = button.nextElementSibling;
    const arrow = button.querySelector('.toggle-arrow');
    
    if (giftsGrid.style.display === 'none') {
        giftsGrid.style.display = 'grid';
        arrow.textContent = '▲';
        button.classList.add('active');
    } else {
        giftsGrid.style.display = 'none';
        arrow.textContent = '▼';
        button.classList.remove('active');
    }
}

// Función para seleccionar/deseleccionar regalos
function toggleGift(button) {
    const giftItem = button.closest('.gift-item');
    const giftName = giftItem.dataset.gift;
    
    // Toggle la clase selected
    giftItem.classList.toggle('selected');
    
    // Agregar o quitar del array de regalos seleccionados
    if (giftItem.classList.contains('selected')) {
        if (!selectedGifts.includes(giftName)) {
            selectedGifts.push(giftName);
            // Incrementar contador en Firebase
            if (typeof incrementGiftCount === 'function') {
                incrementGiftCount(giftName);
            } else {
                giftCounts[giftName] = (giftCounts[giftName] || 0) + 1;
                updateAllCounters();
            }
        }
        button.textContent = '✓ Seleccionado';
    } else {
        selectedGifts = selectedGifts.filter(gift => gift !== giftName);
        // Decrementar contador en Firebase
        if (typeof decrementGiftCount === 'function') {
            decrementGiftCount(giftName);
        } else {
            if (giftCounts[giftName] > 0) {
                giftCounts[giftName]--;
            }
            updateAllCounters();
        }
        button.textContent = 'Seleccionar';
    }
    
    // Actualizar la vista de regalos seleccionados
    
    // Actualizar el display si estamos en la sección de confirmar
    updateSelectedGiftsDisplay();
}

// Función para actualizar el display de regalos seleccionados
function updateSelectedGiftsDisplay() {
    const displayDiv = document.getElementById('selectedGifts');
    
    if (selectedGifts.length > 0) {
        displayDiv.classList.add('show');
        displayDiv.innerHTML = `
            <h4>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff69b4" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                </svg>
                Regalos que traerás:
            </h4>
            <p>${selectedGifts.join(', ')}</p>
        `;
    } else {
        displayDiv.classList.remove('show');
        displayDiv.innerHTML = '';
    }
}

// Función para abrir Waze
function openWaze() {
    // Preferencia: abrir en Google Maps con la ubicación configurada
    const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=-11.968124,-77.095377";
    window.open(mapsUrl, '_blank');
}

// Manejo del formulario de confirmación
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtener los datos del formulario
    const nombre = (document.getElementById('nombre') || {}).value?.trim() || '';
    const telefono = (document.getElementById('telefono') || {}).value?.trim() || '';
    const mensaje = (document.getElementById('mensaje') || {}).value?.trim() || '';

    // Ya no pedimos número de asistentes: asumimos 1 por confirmación
    const asistentesCount = 1;

    // Validación mínima
    if (!nombre || !telefono) {
        const confirmationDiv = document.getElementById('confirmationMessage');
        confirmationDiv.innerHTML = '<strong>Por favor completa los campos obligatorios.</strong>';
        confirmationDiv.classList.add('show');
        setTimeout(() => confirmationDiv.classList.remove('show'), 4000);
        return;
    }

    const confirmationData = {
        nombre: nombre,
        telefono: telefono,
        asistentes: asistentesCount,
        mensaje: mensaje,
        regalos: selectedGifts.length > 0 ? selectedGifts : [],
        timestamp: new Date().toISOString()
    };

    // Guardar confirmación en Firebase si está disponible
    if (typeof saveConfirmation === 'function') {
        saveConfirmation(confirmationData);
    } else {
        // Fallback local si Firebase no está disponible
        totalAttendees += asistentesCount;
        updateAttendeeCounter();
    }

    // Crear el mensaje detallado de WhatsApp
    let whatsappMessage = `*CONFIRMACIÓN BABY SHOWER*\n━━━━━━━━━━━━━━━━━━━━━\n\n*Nombre:* ${nombre}\n*Teléfono:* ${telefono}\n*Papás:* Kelvin & Cristel\n*Fecha:* Viernes, 12 de Diciembre 2025\n*Hora:* 7:30 PM\n*Lugar:* Urb. La Planicie, Naranjal Mz "G" lote 7, San Martín de Porres\n`;

    // Agregar regalos seleccionados SOLO si hay
    if (selectedGifts.length > 0) {
        whatsappMessage += `\n*Regalos que llevaré:*\n`;
        selectedGifts.forEach((gift, index) => {
            whatsappMessage += `   ${index + 1}. ${gift}\n`;
        });
    }

    // Agregar mensaje personalizado si existe
    if (mensaje) {
        whatsappMessage += `\n*Mensaje para los papás:*\n"${mensaje}"\n`;
    }

    whatsappMessage += `\n━━━━━━━━━━━━━━━━━━━━━\n¡Confirmo mi asistencia!\n¡Nos vemos pronto!`;

    // Número de WhatsApp de la mamá (Cristel)
    const phoneNumber = '51980000493';

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Mostrar mensaje de confirmación en la página
    const confirmationDiv = document.getElementById('confirmationMessage');
    confirmationDiv.innerHTML = `
        <div style="text-align: center;">
            <strong style="font-size: 1.2em; color: #ff69b4;">✅ ¡Confirmación enviada!</strong><br><br>
            <p style="font-size: 1.05em; color: #333; margin: 10px 0;">Muchas gracias por confirmar tu asistencia, <strong>${nombre}</strong>.</p>
            <p style="font-size: 0.95em; color: #666;">Se ha abierto WhatsApp con tu confirmación.<br>Por favor envía el mensaje para completar tu registro.</p><br>
            <p style="font-size: 0.9em; color: #ff9ed8; font-style: italic;">¡Te esperamos el 12 de Diciembre! 🎉</p>
        </div>
    `;
    confirmationDiv.classList.add('show');

    // Ocultar el mensaje después de 10 segundos
    setTimeout(() => {
        confirmationDiv.classList.remove('show');
    }, 10000);
});

// Animación inicial
window.addEventListener('load', function() {
    updateAllCounters();
});
