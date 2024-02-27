import Token from '../models/token.jsoken.js';

export async function createToken(req, res) {
    try {
      const { user, application, expirationDate, subscriptionType } = req.body;
      
      // Génération d'une clé unique pour le token (à utiliser comme secret key pour le JWT)
      const secretKey = uuidv4();
      
      // Création du JWT payload (contenant les informations que vous souhaitez inclure dans le token)
      const jwtPayload = {
        userId: user,
        applicationId: application,
        subscriptionType,
        // Autres données si nécessaire
      };
  
      // Génération du JSON Web Token (JWT) à partir du payload et de la clé secrète unique
      const jwtToken = jwt.sign(jwtPayload, secretKey, { expiresIn: '1h' }); // Exemple : expiration dans 1 heure
  
      // Création du token dans la base de données avec la clé secrète unique et le JWT
      const token = await Token.create({ user, application, secretKey, jwtToken, expirationDate, subscriptionType });
  
      res.status(201).json(token);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du token' });
    }
  }

export async function getAllTokens(req, res) {
  try {
    const tokens = await Token.find();
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tokens' });
  }
}

export async function getTokenById(req, res) {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      return res.status(404).json({ error: 'Token non trouvé' });
    }
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du token' });
  }
}

export async function updateToken(req, res) {
  try {
    const { user, application, value, expirationDate } = req.body;
    const token = await Token.findByIdAndUpdate(req.params.id, { user, application, value, expirationDate }, { new: true });
    if (!token) {
      return res.status(404).json({ error: 'Token non trouvé' });
    }
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du token' });
  }
}

export async function deleteToken(req, res) {
  try {
    const token = await Token.findByIdAndDelete(req.params.id);
    if (!token) {
      return res.status(404).json({ error: 'Token non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du token' });
  }
}
export async function getTokensByUserId(req, res) {
    try {
      const { userId } = req.user;
      const tokens = await Token.find({ user: userId });
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des tokens de l\'utilisateur' });
    }
  }