import Application from '../models/application.js';
import { authenticateUser, authorizeAdmin } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import crypto from 'crypto';
// Function to generate a random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(20).toString('hex');
};
export async function createApplication(req, res) {

  authenticateUser(req, res, async () => {

    try {
      // Get user ID from authenticated request
      const user = req.user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { name, logo } = req.body;
      const secretKey = generateSecretKey();
      const application = await Application.create({ name, logo, user, secretKey,etat:true});;

      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'An error occurred while creating the application' });
    }
  });
}

export async function getAllApplications(req, res) {
authorizeAdmin(req, res, async () => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des applications' });
  }
});
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
    console.log('req', req.params.id);
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
  // Use authenticateUser middleware to ensure user is authenticated
  authenticateUser(req, res, async () => {
   
    try {
      console.log("Fetching applications by user ID");

      console.log(req);
      // Get user ID from authenticated request
      const applications = await Application.find({ user: req.user }); // Fetch applications for the user
      console.log(applications);
      res.status(200).json(applications); // Respond with fetched applications
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: 'Error fetching user applications' }); // Handle error
    }
  });
}