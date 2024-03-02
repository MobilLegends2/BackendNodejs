import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
const CLIENT_ID = '754330445896-dfa97rp7o6u0l2aqoue3ajiq71spukvo.apps.googleusercontent.com'; // Replace with your actual Google Client ID

import nodemailer from 'nodemailer';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';

export const generateAccessToken = (user, refreshToken, res) => {
  try {
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1m' });
      const userWithoutSensitiveData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status

      };
      res.json({ accessToken, user: userWithoutSensitiveData });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating access token.' });
  }
};
export const signInUsingToken = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      throw new Error('No access token provided');
    }

    // Verify the access token
    const decoded = await jwt.decode(accessToken, JWT_SECRET);
    const userId = decoded.userId;

    // Proceed with normal flow
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if access token is expired
    if (isAccessTokenExpired(accessToken)) {
      // If access token is expired, check refresh token
      if (isRefreshTokenExpired(user.refreshToken)) {
        return res.status(401).json({ message: 'Refresh token expired.' });
      } else {
        // If refresh token is not expired, generate a new access token
        generateAccessToken(user, user.refreshToken, res);
      }
    } else {
      // If access token is not expired, return the user
      res.json({ user });
    }

  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid access token.' });
    } else {
      res.status(500).json({ message: 'Error refreshing access token.' });
    }
  }
};

// Function to check if refresh token is expired
function isRefreshTokenExpired(refreshToken) {
  const decoded = jwt.decode(refreshToken);
  if (!decoded || Date.now() >= decoded.exp * 1000) {
    return true;
  }
  return false;
}

// Function to check if access token is expired
function isAccessTokenExpired(accessToken) {
  const decoded = jwt.decode(accessToken);
  return !decoded || Date.now() >= decoded.exp * 1000;
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aymen.zouaoui@esprit.tn',
    pass: '223AMT0874a',
  },
});// Endpoint to activate the user's account
export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify and decode the activation token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract the user's email from the token
    const { email } = decoded;

    // Update the user's status to "active" in the database
    await User.findOneAndUpdate({ email }, { $set: { status: 'active' } });

    // Redirect to the appropriate page after activation
    res.redirect('http://localhost:4200/'); // Redirect to a confirmation page on the frontend
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

// Endpoint to register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Generate an activation token
    const activationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '10m' });

    // Send activation email
    const activationLink = `http://localhost:9090/api/auth/activate/${activationToken}`;
    const mailOptions = {
      from: 'your-email@gmail.com', // L'expéditeur
      to: email, // Le destinataire, 'email' doit être défini ailleurs dans votre code
      subject: 'Activate your account', // Le sujet de l'email
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
          <div style="background-color: #007bff; color: #ffffff; padding: 10px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2>Bienvenue sur CrossChat, ${name} !</h2>
          </div>
          <div style="padding: 20px; text-align: left; line-height: 1.5;">
            <p>Votre compte développeur a été créé avec succès !</p>
            <p>Votre accès à notre ensemble complet d'outils et de documentation est maintenant activé. Vous pouvez commencer à explorer les ressources et intégrer notre SDK de messagerie dans vos projets.</p>
            <p>Le SDK CrossChat vous permet d'ajouter facilement des fonctionnalités de messagerie en temps réel à votre application. Avec une intégration simple, vous pouvez offrir à vos utilisateurs des fonctionnalités de discussion instantanée, de notifications push et bien plus encore.</p>
            <p>Pour commencer, consultez notre <a href="https://crosschat.com/documentation" style="color: #007bff; text-decoration: none;">documentation</a> et téléchargez le SDK.</p>
            <a href="${activationLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Activer Mon Compte</a>
          </div>
          <div style="font-size: 12px; text-align: center; padding: 15px; background-color: #f4f4f4; border-radius: 0 0 5px 5px;">
            © ${new Date().getFullYear()} CrossChat. Tous droits réservés.
          </div>
        </div>
      `, // Le corps de l'email en HTML
    };

    transporter.sendMail(mailOptions, (emailError, info) => {
      if (emailError) {
        console.error(emailError);
      } else {
        console.log('Activation email sent: ' + info.response);
      }
    });

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, status: 'busy', avatar: 'brian-hughes.jpg', role: 'user' });
    await user.save();

    res.status(201).json({ message: 'User registered successfully. Please check your email to activate your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user.' });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '10m' });
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1m' });


    const userWithoutSensitiveData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status

    };
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user: userWithoutSensitiveData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in user.' });
  }
};

<<<<<<< Updated upstream
export const generateAccessToken = (user, refreshToken, res) => {
  try {
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '30m' });
      const userWithoutSensitiveData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status

      };
      res.json({ accessToken, user: userWithoutSensitiveData });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating access token.' });
  }
};
export const signInUsingToken = async (req, res) => {
  try {
    const { accessToken } = req.body;
    console.log(accessToken);
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    // Verify the access token
    const decoded = await jwt.verify(accessToken, JWT_SECRET);
    const userId = decoded.userId;

    // Proceed with normal flow
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (isRefreshTokenExpired(user.refreshToken)) {
      return res.status(401).json({ message: 'Refresh token expired.' });
    }


    generateAccessToken(user, user.refreshToken, res);

  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid access token.' });
    } else {
      res.status(500).json({ message: 'Error refreshing access token.' });
    }
  }
};

// Function to check if refresh token is expired
function isRefreshTokenExpired(refreshToken) {
  const decoded = jwt.decode(refreshToken);
  if (!decoded || Date.now() >= decoded.exp * 1000) {
    return true;
  }
  return false;
}

=======
>>>>>>> Stashed changes

//////////////////////
export const genarate = async (req, res) => {
  console.log(generateRandomPassword());
  res.status(200).json({ message: generateRandomPassword() });
}
///////////////////////////

export const unlockSession = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(500).json({ message: 'Incorrect password.' });
    }



    res.json({ message: 'Unlock session email sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unlocking session.' });
  }
};

function generateRandomPassword() {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let pass = '';
  // Concatenate all possible characters
  const allCharacters = lowercaseLetters + uppercaseLetters + numbers;


  // Ensure at least one lowercase letter, one uppercase letter, and one number
  pass += getRandomCharacter(lowercaseLetters); // One lowercase letter
  pass += getRandomCharacter(uppercaseLetters); // One uppercase letter
  pass += getRandomCharacter(numbers); // One number

  // Generate the remaining characters
  for (let i = pass.length; i < 8; i++) {
    pass += getRandomCharacter(allCharacters);
  }

  return pass;
}

function getRandomCharacter(characters) {
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters.charAt(randomIndex);
}


export const forgotPassword = async (req, res) => {
  try {
    const { name } = req.body;

    // Vérifiez si l'e-mail existe déjà dans la base de données
    const existingUser = await User.findOne({ name });
    const email = existingUser.email;
    const newpassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newpassword, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();
    // Send welcome email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password changed',
      text: `your password have been changed , u can access to your account using this password ${newpassword} and u can changed later`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333333;
          }
          .wrapper {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 5px;
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            text-align: left;
            line-height: 1.5;
          }
          .footer {
            font-size: 12px;
            text-align: center;
            padding: 15px;
            background-color: #f4f4f4;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h2>Password Changed for ${name}</h2>
          </div>
          <div class="content">
            <p>Your password has been changed successfully!</p>
            <p>You can now access your account using the new password: <strong>${newpassword}</strong>.</p>
            <p>You can change your password later.</p>
          </div>
          <div class="footer">
            © 2024 Your App. All rights reserved.
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
        console.log('Forget Password email sent: ' + info.response);
      }
    });

    res.status(201).json({ message: 'Passward changed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error changin user password.' });
  }
};



const client = new OAuth2Client(CLIENT_ID);
export const loginGoogle = async (req, res) => {
  const { credential } = req.body;

  // Verify the Google ID token
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract user information from the payload
    const { email, sub, picture, given_name, family_name } = payload;

    console.log('User email:', email);
    console.log('User ID:', sub);
    console.log('User pic:', picture);
    console.log('User given_name:', given_name);
    console.log('User family_name:', family_name);

    // Check if the user already exists in the database
    let existingUser = await User.findByEmail(email);

    if (!existingUser) {
      // If the user doesn't exist, create a new user
      existingUser = new User({
        userID: sub,
        name: given_name,
        email,
        password: sub, // You may need to handle the password differently for Google sign-in
        status: 'busy',
        avatar: picture,
      });

      // Save the new user to the database
      await existingUser.save();
    }

    // Generate JWT tokens for authentication
    const refreshToken = jwt.sign({ userId: existingUser._id }, JWT_REFRESH_SECRET, { expiresIn: '1d' });
    const accessToken = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '10m' });

    // Prepare user data to send back to the client
    const userWithoutSensitiveData = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      status: existingUser.status,
    };

    // Update user's refresh token and save it
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    // Send response with authentication tokens and user data
    res.json({ accessToken, refreshToken, user: userWithoutSensitiveData });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(400).json({ error: 'Failed to verify Google ID token.' });
  }
};


export const loginWithOutlook = async (req, res) => {
  try {
    const { credential } = req.body; // Le jeton JWT récupéré de Outlook
    console.log(credential);

    // Décoder le jeton JWT pour obtenir les données qu'il contient
    const decodedToken = jwt.decode(credential);
    console.log(decodedToken);

    // En fonction de l'identifiant de l'utilisateur, récupérez ou créez l'utilisateur dans votre base de données
    let existingUser = await User.findByEmail(decodedToken.email); // Recherchez l'utilisateur dans la base de données

    // Si l'utilisateur n'existe pas, vous pouvez le créer
    if (!existingUser) {
      // Créez l'utilisateur avec les informations disponibles dans le jeton JWT ou demandez plus d'informations à l'utilisateur
      // Par exemple, vous pouvez obtenir l'email à partir du jeton JWT et demander un nom d'utilisateur supplémentaire
      existingUser = new User({
        userID: decodedToken.sub,
        name: decodedToken.preferred_username,
        email: decodedToken.email,
        password: decodedToken.sub, // You may need to handle the password differently for Google sign-in
        status: 'busy',
        avatar: 'brian-hughes.jpg',
      }); // Assurez-vous que l'identifiant de l'utilisateur est correctement défini
      // Ajoutez d'autres champs utilisateur nécessaires


      // Enregistrez le nouvel utilisateur dans la base de données
      await existingUser.save();

      // Attribuez le nouvel utilisateur à existingUser pour la suite du processus

    }


    const refreshToken = jwt.sign({ userId: existingUser._id }, JWT_REFRESH_SECRET, { expiresIn: '10d' });
    const accessToken = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '10m' });

    // Préparez les données de l'utilisateur à renvoyer au client
    const userWithoutSensitiveData = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      status: existingUser.status,
      // Ajoutez d'autres champs utilisateur que vous souhaitez envoyer au client
    };

    // Mettre à jour le jeton de rafraîchissement de l'utilisateur et l'enregistrer (si nécessaire)
    existingUser.refreshToken = refreshToken;
    await existingUser.save();
    console.log(userWithoutSensitiveData);
    // Envoyer une réponse avec les jetons d'authentification et les données de l'utilisateur
    res.json({ accessToken, refreshToken, user: userWithoutSensitiveData });
  } catch (error) {
    console.error('Error during Outlook sign-in:', error);
    res.status(400).json({ error: 'Failed to sign in with Outlook.' });
  }
};



export const signout = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const decodedToken = jwt.decode(accessToken);
    console.log(decodedToken);

    // Recherchez l'utilisateur dans la base de données en utilisant l'ID de l'utilisateur du jeton d'accès
    let user = await User.findById(decodedToken.userId);

    // Si l'utilisateur n'existe pas, vous devez le créer
    if (!user) {
      // Créer une nouvelle instance d'utilisateur
      user = new User({
        // Vous devrez remplir les détails de l'utilisateur en fonction de votre modèle d'utilisateur
      });
    }

    // Effacer le jeton d'accès de l'utilisateur (utilisez la bonne propriété ici)
    user.accessToken = null;

    // Enregistrer les modifications de l'utilisateur dans la base de données
    await user.save();

    // Répondre avec un succès
    return res.status(200).json(true);
  } catch (error) {
    // Gérer les erreurs
    console.error("Error signing out:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
