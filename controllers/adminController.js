import { validationResult } from 'express-validator';
import User from '../models/user.js';
import { authenticateUser, authorizeAdmin } from '../middlewares/authMiddleware.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { uploadImage } from '../middlewares/mm.js';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import e from 'cors';
import openai from 'openai';
// Make sure you have configured your openai API key
const openaiApiKey = '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';
openai.apiKey = openaiApiKey;
console.log(openai.apiKey); 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aymen.zouaoui@esprit.tn',
    pass: '223AMT0874a',
  },
});
export async function newPassword(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, newPassword, password} = req.body;
 const pass=newPassword||password;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = await await bcrypt.hash(pass, 10);

    await user.save();
/*
    // Send a thank-you email using ChatGPT
    const thankYouEmailPrompt = `Dear ${user.username},\n\nWe would like to thank you for updating your password. If you have any questions or concerns, please feel free to contact us.`;

    console.log(openai); // Check the value of openai

    const response = await openai.Completion.create({
      engine: 'text-davinci-003',
      prompt: thankYouEmailPrompt,
      max_tokens: 200,
    });

    const thankYouEmailContent = response.choices[0].text;

    const mailOptions = {
      from: 'your-email@example.com',
      to: user.email,
      subject: 'Thank You for Updating Your Password',
      text: thankYouEmailContent,
    };

    await transporter.sendMail(mailOptions);
*/
    res.json({ message: 'Password updated successfully. Thank you email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



export async function newPasswordu(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password} = req.body;
 
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = await await bcrypt.hash(pass, 10);

    await user.save();
/*
    // Send a thank-you email using ChatGPT
    const thankYouEmailPrompt = `Dear ${user.username},\n\nWe would like to thank you for updating your password. If you have any questions or concerns, please feel free to contact us.`;

    console.log(openai); // Check the value of openai

    const response = await openai.Completion.create({
      engine: 'text-davinci-003',
      prompt: thankYouEmailPrompt,
      max_tokens: 200,
    });

    const thankYouEmailContent = response.choices[0].text;

    const mailOptions = {
      from: 'your-email@example.com',
      to: user.email,
      subject: 'Thank You for Updating Your Password',
      text: thankYouEmailContent,
    };

    await transporter.sendMail(mailOptions);
*/
    res.json({ message: 'Password updated successfully. Thank you email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
export async function banUser(req, res) {
    const userId = req.params.id; // ou tout autre moyen d'obtenir l'ID de l'utilisateur à bannir
  
    try {
      // Recherchez l'utilisateur dans la base de données
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
  
      // Vérifiez si l'utilisateur est déjà banni
      if (user.isBanned) {
        return res.status(400).json({ message: 'Utilisateur déjà banni' });
      }
  
      // Marquez l'utilisateur comme banni
      user.isBanned = true;
      
      // Sauvegardez les modifications dans la base de données
      await user.save();
  
      res.status(200).json({ message: 'Utilisateur banni avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  export async function unbanUser(req, res) {
    const userId = req.params.id; // ou tout autre moyen d'obtenir l'ID de l'utilisateur à débannir
  
    try {
      // Recherchez l'utilisateur dans la base de données
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
  
      // Vérifiez si l'utilisateur est déjà débanni
      if (!user.isBanned) {
        return res.status(400).json({ message: 'Utilisateur n\'est pas banni' });
      }
  
      // Marquez l'utilisateur comme débanni
      user.isBanned = false;
      
      // Sauvegardez les modifications dans la base de données
      await user.save();
  
      res.status(200).json({ message: 'Utilisateur débanni avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  // Fonction pour bannir un utilisateur pour une durée définie
export async function banUserWithDuration(req, res) {
    const userId = req.params.id; // ou tout autre moyen d'obtenir l'ID de l'utilisateur à bannir
    const banDurationInMinutes = req.body.durationInMinutes; // La durée du bannissement en minutes
  
    try {
      // Recherchez l'utilisateur dans la base de données
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
  
      // Vérifiez si l'utilisateur est déjà banni
      if (user.isBanned) {
        return res.status(400).json({ message: 'Utilisateur déjà banni' });
      }
  
      // Obtenez la date actuelle
      const currentDate = new Date();
  
      // Calculez la date d'expiration du bannissement en ajoutant la durée à la date actuelle
      const banExpirationDate = new Date(currentDate.getTime() + banDurationInMinutes * 60000);
  
      // Marquez l'utilisateur comme banni avec la date d'expiration
      user. isBannedTemp = true;
      user.banExpirationDate = banExpirationDate;
  
      // Sauvegardez les modifications dans la base de données
      await user.save();
  
      res.status(200).json({
        message: 'Utilisateur banni avec succès pour une durée définie',
        banExpirationDate: banExpirationDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  export async function getBannedUsers(req, res) {
    console.log("getBannedUsers")
    try {
      // Find all users that are currently banned
      const bannedUsers = await User.find({ isBanned: true });
  
      res.status(200).json(bannedUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  export async function resetPassword(req, res, next) {
    console.log(req.body);
  
    const token = req.body.email;
    try {
      const decoded = jwt.verify(token, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
      req.user = decoded.user;
  
      // Hacher le mot de passe avec le sel
      const hash = await bcrypt.hash(req.body.password, 10);
  
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { password: hash },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json({ message: 'Password changed!', user });
    } catch (error) {
      console.error('Error resetting password:', error);
  
      // Check the type of error thrown by jwt.verify
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      // Handle other types of errors as needed
      res.status(500).json({ error: 'Internal Server Error' });
    }
  
  }
  // Export the sendResetCodeByTel function
  export async function sendResetCodeByTel(req, res) {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email } = req.body;
    console.log(email)
    try {
      const user = await User.findOne({ email });
      console.log(user)
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const resetCode = generateResetCode();
  
      // Send SMS using Twilio
      client.messages.create({
        body: `Your password reset code is: ${resetCode}`,
        from: '+18638247637',
        to: user.numTel, // Assuming you have a phone field in your user model
      });
  
      // Save the reset code in the user document
      user.resetCode = resetCode;
      user.save();
  
      // Create and sign a JWT token
      const token = jwt.sign({ user: { id: user._id, role: user.role, resetCode } }, 'your-secret-key', { expiresIn: '1h' });
  
      // Return the user along with the reset code
      res.json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  function generateResetCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }
  

  export async function verifyResetCode(req, res) {
   console.log(req.body)
   console.log("eeeeeeeeeeeeee")
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, resetCode } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.resetCode !== resetCode) {
        return res.status(400).json({ message: 'Invalid reset code' });
      }
  
     
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }



