import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import settingsRoutes from './routes/settings';
import emailTemplatesRoutes from './routes/emailTemplates';

// Verificar variáveis de ambiente necessárias
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erro: Variável de ambiente ${envVar} não definida`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/settings', settingsRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
