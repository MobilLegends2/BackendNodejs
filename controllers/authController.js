import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aymen.zouaoui@esprit.tn',
    pass: '223AMT0874a',
  },
});
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifiez si l'e-mail existe déjà dans la base de données
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, status: 'busy', avatar: 'brian-hughes.jpg', role: 'user' });

    // Send welcome email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Welcome to your application',
      text: 'Thank you for registering on our application. Welcome!',
      html: `
      <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur CrossChat, Développeur !</title>
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
        @media screen and (max-width: 600px) {
            .wrapper {
                width: 95%;
                margin: 20px auto;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h2>Bienvenue sur CrossChat, ${name} !</h2>
        </div>
        <div class="content">
            <p>Votre compte développeur a été créé avec succès !</p>
            <p>Votre accès à notre ensemble complet d'outils et de documentation est maintenant activé. Vous pouvez commencer à explorer les ressources et intégrer nos solutions dans vos projets.</p>
            <p>Pour toute question ou support, veuillez consulter notre <a href="#" style="color: #007bff; text-decoration: none;">centre d'aide</a>.</p>
            <a href="#" class="button" onclick="activateAccount()">Activer Mon Compte</a>
        </div>
        <div class="footer">
            © 2024 CrossChat. Tous droits réservés.
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
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
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
      res.json({ accessToken, user:userWithoutSensitiveData });
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


export const forgotPassword  = async (req, res) => {
  try {
    const { name } = req.body;

    // Vérifiez si l'e-mail existe déjà dans la base de données
    const existingUser = await User.findOne({ name });
    const email = existingUser.email;
const newpassword =generateRandomPassword();
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
