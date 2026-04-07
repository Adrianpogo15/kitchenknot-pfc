const app = require("./app");
const env = require("./config/env");
const { testDatabaseConnection } = require("./config/db");

async function bootstrap() {
  try {
    await testDatabaseConnection();

    app.listen(env.port, () => {
      console.log(`Servidor API escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar la API:", error.message);
    process.exit(1);
  }
}

bootstrap();
