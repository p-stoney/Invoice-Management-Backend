import 'dotenv/config';
import createApp from './app';

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});