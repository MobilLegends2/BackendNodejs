import { validationResult } from 'express-validator';
import User from '../models/user.js';
import { authenticateUser, authorizeAdmin } from '../middlewares/authMiddleware.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { uploadImage } from '../middlewares/mm.js';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import e from 'cors';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aymen.zouaoui@esprit.tn',
    pass: '223AMT0874a',
  },
});

const accountSid = 'ACe97f325708d9f5079f44ba3cfca97f3d';
const authToken = '7a3001c6bf1c52995b3d22846d74f02c';
const client = twilio(accountSid, authToken);
//recover all users
export function getAllUsers(req, res) {

  //authenticateUser(req, res, () => {
    User.find({})
      .then((users) => {
        let userList = users.map((user) => {
          return {
            id: user._id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            dateNaissance: user.dateNaissance,
            adress: user.adress,
            cin: user.cin,
            userName: user.userName,
            lastPassword: user.lastPassword,
            isValid: user.isValid,
            imageRes: user.imageRes,
            role: user.role,
            numTel: user.numTel,
            isBanned: user.isBanned,
            totalTimeSpent: user.totalTimeSpent,
            banExpirationDate:user.banExpirationDate,
            loginCount:user.loginCount

          };
        });
        res.status(200).json(userList);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  //});

}
// add user

export async function addUser(req, res) {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      nom,
      prenom,
      dateNaissance,
      adress,
      cin,
      userName,
      lastPassword,
      isValid,
      numTel,
      role,
    } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists. Please choose another email.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("zzzzzzzzzzz")
    console.log(req.body)
    // Handle image upload
    const imageData = req.file ? req.file.path : 'https://th.bing.com/th/id/OIP.iAhcp6m_91O-ClK79h8EQQHaFj?w=221&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7';
    //const imageData = req.file.path || 'https://th.bing.com/th/id/OIP.iAhcp6m_91O-ClK79h8EQQHaFj?w=221&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7';
    const cloudinaryResponse = await uploadImage(imageData);

    // Assuming that the image URL is in the secure_url property of the Cloudinary response
    const imageUrl = cloudinaryResponse.secure_url;

    // Create user with Cloudinary image URL
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      dateNaissance,
      adress,
      cin,
      userName,
      lastPassword,
      isValid,
      numTel,
      imageRes: imageUrl,
      role,

    });

    // Send welcome email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: newUser.email,
      subject: 'Welcome to your application',
      text: 'Thank you for registering on our application. Welcome!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  background-color: #ffffff;
                  width: 100%;
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  text-align: center;
                  padding: 10px;
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .footer {
                  text-align: center;
                  padding: 10px;
                  font-size: 0.8em;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Green World!</h1>
              </div>
              <div class="content">
                  <h2>Hello ${userName},</h2>
                  <p>Thank you for joining Green World! We are thrilled to have you on board and are excited to help you get started on your journey towards a greener lifestyle.</p>
                  <p>You are now part of a community that values sustainability, environmental consciousness, and a healthier planet. Stay tuned for updates, tips, and exciting opportunities!</p>
                  <p>If you have any questions or need assistance, feel free to reach out to us.</p>
                  <p>Welcome aboard!</p>
                  <p>Best regards,</p>
                  <p>The Green World Team</p>
              </div>
              <div class="footer">
                  &copy; 2023 Green World. All rights reserved.
              </div>
          </div>
      </body>
      </html>
      
    `,
    };

    transporter.sendMail(mailOptions, (emailError, info) => {
      if (emailError) {
        console.error(emailError);
      } else {
        console.log('Welcome email sent: ' + info.response);
      }
    });

    res.status(200).json(newUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation Errors:', error.errors);
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export function getUserById(req, res) {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'Utilisateur introuvable' });
      } else {
        res.status(200).json(user);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}


export async function updateUserById(req, res) {
  console.log('eeeeeeeeeeeeeeeeeeeee');
  console.log(req.body);

  try {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ errors: validationResult(req).array() });
    }

    // Check for id in both request parameters and request body
    const userId = req.params.id || req.body.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updatedUserData = {};
    
    Object.keys(req.body).forEach((key) => {
      // Check for non-null, non-undefined, and non-empty string values
      if (key !== 'password' && req.body[key] != null && req.body[key] !== '') {
        updatedUserData[key] = req.body[key];
      }
    });

    // Handle image upload
    const imageData = req.file ? req.file.path : null;

    // Assuming the uploadImage function returns a response object with a secure_url property
    let imageUrl = '';

    if (imageData) {
      const cloudinaryResponse = await uploadImage(imageData);
      imageUrl = cloudinaryResponse.secure_url;
    }

    // If imageUrl is not empty, update user data including the image URL
    if (imageUrl !== '') {
      updatedUserData.imageRes = imageUrl;
    }

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.status(200).json({ data: updatedUser, message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}




export function deleteUserById(req, res) {
  authorizeAdmin(req, res, () => {
    User.findOneAndDelete({ _id: req.params.id })
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: 'Utilisateur introuvable' });
        } else {
          res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  });
}
// Import necessary modules and middleware

// ...


export function updateScoreById(req, res) {



  // Check if the request body contains the "score" attribute
  if (!req.body.score) {
    console.log(req.body.score)
    return res.status(400).json({ message: 'Bad Request - Score is required' });

  }

  if (!req.body.id) {
    console.log(req.body.id)

    return res.status(400).json({ message: 'Bad Request - id is required' });
  }

  const updatedUserData = {
    score: req.body.score,
  };

  User.findByIdAndUpdate(req.body.id, updatedUserData, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({ message: 'Utilisateur introuvable' });
        console.log("ccccc")
      } else {
        res.status(200).json(updatedUser);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
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




export async function sendResetCode(req, res) {
  const errors = validationResult(req);
  console.log(req.body)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = generateResetCode();

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset Code',
      html: `
     
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  background-color: #ffffff;
                  width: 100%;
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
              }
              .header {
                  background-color: #32a852;
                  color: white;
                  text-align: center;
                  padding: 10px;
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .footer {
                  text-align: center;
                  padding: 10px;
                  font-size: 0.8em;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Green World</h1>
              </div>
              <div class="content">
                  <h2>Password Reset Request</h2>
                  <p>You have requested to reset your password for your Green World account.</p>
                  <p>Your Password Reset Code is:</p>
                  <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; font-size: 1.5em;">
                      ${resetCode}
                  </div>
                  <p>Enter this code in the provided field to reset your password.</p>
              </div>
              <div class="footer">
                  &copy; 2023 Green World. All rights reserved.
              </div>
          </div>
      </body>
      </html>
      
      `
    };

    transporter.sendMail(mailOptions, (emailError, info) => {
      if (emailError) {
        console.error(emailError);
        return res.status(500).json({ error: 'Error sending reset code via email' });
      }

      console.log('Reset code sent via email:', resetCode);

      user.token = jwt.sign({ user: { id: user._id, role: user.role, resetCode: user.resetCode } }, 'your-secret-key', { expiresIn: '1h' });

      // Save the reset code in the user document
      user.resetCode = resetCode;
      user.save();

      // Return the user along with the reset code
      res.json(user);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



export async function updatePassword(req, res) {


  try {
    // Extraire les champs du corps de la requête
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    console.log(req.body)
    // Vérifier que tous les champs requis sont présents
    if (!req.params.id || !currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Veuillez fournir tous les champs requis' });
    }

    // Récupérer l'utilisateur de la base de données
    const user = await User.findById(req.params.id);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier si le mot de passe actuel correspond au mot de passe enregistré
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Vérifier si le nouveau mot de passe est différent de l'ancien et du dernier mot de passe
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password || '');
    const isSameAsLast = await bcrypt.compare(newPassword, user.lastPassword || '');

    if (isSameAsCurrent || isSameAsLast) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'ancien et du dernier mot de passe' });
    }

    // Vérifier si le nouveau mot de passe est égal à la confirmation du nouveau mot de passe
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'La confirmation du nouveau mot de passe ne correspond pas' });
    }

    // Mettre à jour le mot de passe dans la base de données
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.lastPassword = user.password || ''; // Mettre à jour le dernier mot de passe
    user.password = hashedPassword;
    await user.save();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
