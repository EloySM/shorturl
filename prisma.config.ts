import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Esto obliga a cargar las variables del archivo .env
dotenv.config();

export default defineConfig({
  datasource: {
    // Usamos el operador "!" para asegurar que no sea undefined
    url: process.env.DATABASE_URL!,
  },
});