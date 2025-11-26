// Configuración de Firebase para Baby Shower Antonella
const firebaseConfig = {
    apiKey: "AIzaSyAYzRlemPM0lIjwdYsow3rUbxLzdAPU3HI",
    authDomain: "baby-shower-antonella.firebaseapp.com",
    databaseURL: "https://baby-shower-antonella-default-rtdb.firebaseio.com",
    projectId: "baby-shower-antonella",
    storageBucket: "baby-shower-antonella.firebasestorage.app",
    messagingSenderId: "433354784228",
    appId: "1:433354784228:web:f0b2e21a2f95de55509bf1"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencia a la base de datos
const confirmationsRef = database.ref('confirmations');
const giftsCountRef = database.ref('giftCounts');

// Función para sincronizar contadores de regalos
function syncGiftCounts() {
    giftsCountRef.on('value', (snapshot) => {
        const counts = snapshot.val();
        if (counts) {
            // Actualizar contadores locales
            giftCounts = counts;
            updateAllCounters();
        }
    });
}

// Función para incrementar contador de regalo
function incrementGiftCount(giftName) {
    const giftRef = giftsCountRef.child(giftName);
    giftRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    });
}

// Función para decrementar contador de regalo
function decrementGiftCount(giftName) {
    const giftRef = giftsCountRef.child(giftName);
    giftRef.transaction((currentCount) => {
        return Math.max((currentCount || 0) - 1, 0);
    });
}

// Función para guardar confirmación
function saveConfirmation(data) {
    // Si no hay teléfono, simplemente guardar (no podemos deduplicar)
    const telefono = data.telefono || '';

    // Construir objeto de confirmación seguro
    const confirmationObj = {
        nombre: data.nombre || '',
        telefono: telefono,
        asistentes: data.asistentes || 1,
        mensaje: data.mensaje || '',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    if (data.regalos !== undefined && data.regalos !== null) {
        confirmationObj.regalos = data.regalos;
    }

    if (!telefono) {
        // Sin teléfono, no podemos comprobar duplicados: simplemente guardar
        const newConfirmationRef = confirmationsRef.push();
        return newConfirmationRef.set(confirmationObj).then(() => ({ already: false, key: newConfirmationRef.key }));
    }

    // Comprobar si ya existe una confirmación con este teléfono
    return confirmationsRef.orderByChild('telefono').equalTo(telefono).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            // Devuelve que ya existe (no sobrescribimos)
            const val = snapshot.val();
            const existingKey = Object.keys(val)[0];
            return { already: true, key: existingKey };
        }
        // No existe: crear nueva confirmación
        const newConfirmationRef = confirmationsRef.push();
        return newConfirmationRef.set(confirmationObj).then(() => ({ already: false, key: newConfirmationRef.key }));
    });
}

// Función para obtener total de asistentes
function syncAttendeeCount() {
    confirmationsRef.on('value', (snapshot) => {
        let total = 0;
        snapshot.forEach((childSnapshot) => {
            const confirmation = childSnapshot.val();
            total += parseInt(confirmation.asistentes) || 0;
        });
        totalAttendees = total;
        updateAttendeeCounter();
    });
}

// Inicializar sincronización
window.addEventListener('load', function() {
    syncGiftCounts();
    syncAttendeeCount();
});
