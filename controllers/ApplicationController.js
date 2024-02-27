import Application from '../models/application.js';

const ApplicationController = {
  // Créer une nouvelle application
  async create(req, res) {
    try {
      const { name, description } = req.body;
      const application = await Application.create({ name, description });
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création de l\'application' });
    }
  },

  // Récupérer toutes les applications
  async getAll(req, res) {
    try {
      const applications = await Application.find();
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des applications' });
    }
  },

  // Récupérer une application par son ID
  async getById(req, res) {
    try {
      const application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ error: 'Application non trouvée' });
      }
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'application' });
    }
  },

  // Mettre à jour une application
  async update(req, res) {
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
  },

  // Supprimer une application
  async delete(req, res) {
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
};

export default ApplicationController;
