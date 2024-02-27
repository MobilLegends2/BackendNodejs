import Token from '../models/token.jsoken.js';

export async function createToken(req, res) {
  try {
    const { user, application, value, expirationDate } = req.body;
    const token = await Token.create({ user, application, value, expirationDate });
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
      const { userId } = req.params;
      const tokens = await Token.find({ user: userId });
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des tokens de l\'utilisateur' });
    }
  }