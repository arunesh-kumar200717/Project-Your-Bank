
import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { setSocketServer } from './services/notificationService.js';
import { setRecordingSocketServer } from './services/recordingService.js';
import { setSecuritySocketServer } from './services/securityEngine.js';

// Trust the Render reverse proxy.
// This must be configured before handling incoming requests.
app.set('trust proxy', 1);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URLS,
    credentials: true
  }
});

// Initialize Socket.IO services
setSocketServer(io);
setRecordingSocketServer(io);
setSecuritySocketServer(io);

// Start the application
try {
  await connectDatabase();

  if (!process.env.VERCEL) {
    httpServer.listen(env.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  }
} catch (error) {
  console.error('Application startup failed:', error);
  process.exit(1);
}

export default httpServer;
