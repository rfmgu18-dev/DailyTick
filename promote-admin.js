const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGODB_URI = 'mongodb+srv://rfmgu18_db_user:AiWgYXoPFxjBsY5t@cluster0.jjf025i.mongodb.net/DailyTick?appName=Cluster0';

async function promoteToAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    const user = await User.findOne({ email: 'admin@dailytick.com' });

    if (!user) {
      console.log('Usuario no encontrado');
      process.exit(1);
    }

    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    console.log('Usuario promovido a admin exitosamente:', user.email);
    console.log('isAdmin:', user.isAdmin);
    console.log('role:', user.role);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

promoteToAdmin();
