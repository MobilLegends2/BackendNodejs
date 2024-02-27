import Application from '../models/application.js';
import { authenticateUser, authorizeAdmin } from '../middlewares/authMiddleware.js';
export async function createApplication(req, res) {
  try {
    const { name, description } = req.body;
    const application = await Application.create({ name, description });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'application' });
  }
}

export async function getAllApplications(req, res) {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des applications' });
  }
}

export async function getApplicationById(req, res) {
  
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application non trouvée' });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'application' });
  }
}

export async function updateApplication(req, res) {
  try {
    const { name, description } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!application) {
      return res.status(404).json({ error: 'Application non trouvée' });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'application' });
  }
}

export async function deleteApplication(req, res) {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application non trouvée' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'application' });
  }
}
export async function getApplicationsByUserId(req, res) {
  authenticateUser(req, res, async () => {

    try {
      const { userId } = req.user;
      const applications = await Application.find({ user: userId });
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des applications de l\'utilisateur' });
    }
  });
  }