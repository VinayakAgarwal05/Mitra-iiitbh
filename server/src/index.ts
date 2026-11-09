import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { initializeSchema } from './db/schema';
import { seedDatabase } from './db/seed';
import { initSocketIO } from './sockets/chatHandler';

async function bootstrap() {
  try {
    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('Database schema verified.');

    // Seed database if required
    await seedDatabase();

    const server = http.createServer(app);
    initSocketIO(server);

    server.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 College Connect Backend API Server Running`);
      console.log(`📡 URL: http://localhost:${ENV.PORT}`);
      console.log(`⏱️ Timezone: ${ENV.TIMEZONE}`);
      console.log(`🔒 Allowed Domains: ${ENV.WHITELISTED_DOMAINS.join(', ')}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error during server bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
