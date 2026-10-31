/**
 * Script de prueba para el Job Scheduler de Deadlines
 * Este script permite probar manualmente la verificación de deadlines
 */
require('dotenv').config();
const connectDB = require('./backend/config/database');
const { testDeadlineCheck } = require('./backend/services/deadlineNotifier');

async function runTest() {
  console.log('🧪 Iniciando prueba del Job Scheduler de Deadlines...\n');

  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Ejecutar la verificación de deadlines
    await testDeadlineCheck();

    console.log('\n✅ Prueba completada');
    console.log('\n💡 Notas:');
    console.log('- Verifica las notificaciones en la aplicación (campanita 🔔)');
    console.log('- El scheduler se ejecuta automáticamente cada 15 minutos');
    console.log('- Los logs del scheduler aparecen en la consola del servidor');
    console.log('\n📝 Para probar con hábitos específicos:');
    console.log('1. Crea un hábito con un deadline cercano (ej: en 30 min)');
    console.log('2. Asegúrate de tener notificationsEnabled: true');
    console.log('3. Espera a que el scheduler se ejecute o ejecuta este script');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

runTest();
