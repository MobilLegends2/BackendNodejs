// config.js

// Configuration des secrets JWT
export const JWT_SECRET = 'votre_secret_pour_les_tokens_d_acces';
export const JWT_REFRESH_SECRET = 'votre_secret_pour_les_tokens_de_refresh';

// Configuration de la base de données
export const MONGODB_URI = 'votre_uri_mongodb';

// Autres configurations
export const PORT = process.env.PORT || 3000; // Utilisation du port par défaut 3000 ou du port fourni dans les variables d'environnement
