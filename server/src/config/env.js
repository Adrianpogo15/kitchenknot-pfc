const dotenv = require("dotenv");

dotenv.config();

const requiredVariables = [
  "PORT",
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EDAMAM_APP_ID",
  "EDAMAM_APP_KEY",
  "EDAMAM_ACCOUNT_USER"
];

requiredVariables.forEach((variableName) => {
  if (!process.env[variableName]) {
    throw new Error(`Falta la variable de entorno obligatoria: ${variableName}`);
  }
});

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseRecipeImagesBucket: process.env.SUPABASE_RECIPE_IMAGES_BUCKET || "recipe-images",
  jwtSecret: process.env.JWT_SECRET || null,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  edamamAppId: process.env.EDAMAM_APP_ID,
  edamamAppKey: process.env.EDAMAM_APP_KEY,
  edamamAccountUser: process.env.EDAMAM_ACCOUNT_USER
};
