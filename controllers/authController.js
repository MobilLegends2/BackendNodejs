
/*import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Assuming you are using bcrypt for password hashing
import User from '../models/user.js'; // Import your user model
import { authenticateUser, authorizeAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials email' });
    }

    // Check if the user is banned and if banExpirationDate is passed
    if (user.isBannedTemp && user.banExpirationDate && new Date() > user.banExpirationDate) {
      // If banExpirationDate is passed, unban the user
      user.isBannedTemp = false;
      user.banExpirationDate = null;
      await user.save();
    }

    // Check if the user is banned after potential unban
    if (user.isBanned) {
      return res.status(401).json({ message: 'User is banned' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials password' });
    }

    // Generate JWT token
    const token = jwt.sign({ user: { id: user._id, role: user.role } }, 'your-secret-key', { expiresIn: '1h' });

    // Update user with JWT token
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      token: token,
    
    });

  
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Logout route
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    if (user && user.lastLoginTimestamp) {
      const lastLogoutTimestamp = new Date();
      const timeSpent = lastLogoutTimestamp - user.lastLoginTimestamp;

      await User.findByIdAndUpdate(userID, {
        token: null,
    
      });

      res.json({ message: 'Logout successful' });
    } else {
      res.status(400).json({ message: 'User not logged in or login timestamp missing' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/loginiios', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials email' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials password' });
    }

    // Generate JWT token
    const token = jwt.sign({ user: { id: user._id, role: user.role } }, 'your-secret-key', { expiresIn: '1h' });

    // Update user with JWT token
    await User.findByIdAndUpdate(user._id, {
      token: token,
    
    });

    // Send the token in the response along with user details
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        // Include other user details as needed
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/loggeduser', authenticateUser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send only necessary user data, not the entire user object
    const userData = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      imageRes: user.imageRes,
      userName: user.userName
      // Add other necessary fields
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});



export default router;


*/import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import DailyStats from '../models/DailyStats.js'; // Import the DailyStats model
import { authenticateUser } from '../middlewares/authMiddleware.js';
import user from '../models/user.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBannedTemp && user.banExpirationDate && new Date() > user.banExpirationDate) {
      user.isBannedTemp = false;
      user.banExpirationDate = null;
      await user.save();
    }

    if (user.isBanned) {
      return res.status(401).json({ message: 'User is banned' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const loginDate = new Date();
    
    await DailyStats.findOneAndUpdate(
      {
        userId: user._id,
        date: {
          $gte: new Date(loginDate.getFullYear(), loginDate.getMonth(), loginDate.getDate()),
          $lt: new Date(loginDate.getFullYear(), loginDate.getMonth(), loginDate.getDate() + 1),
        },
      },
      {
        $inc: { loginCount: 1 },
        $set: { date: loginDate },
      },
      { upsert: true }
    );

    user.lastLoginTimestamp = loginDate;
    await user.save();

    user.loginCount += 1;

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { token, loginCount: user.loginCount },
      { new: true } // Return the updated user document
    );

    // Do not expose sensitive information in the response
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Logout route
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    if (user && user.lastLoginTimestamp) {
      // Calculate the time spent during this session
      const lastLogoutTimestamp = new Date();
      const timeSpent = lastLogoutTimestamp - user.lastLoginTimestamp;

      // Record the time spent and logout timestamp in DailyStats collection
      const logoutDate = new Date();
      await DailyStats.findOneAndUpdate(
        {
          userId: user._id,
          date: {
            $gte: new Date(logoutDate.getFullYear(), logoutDate.getMonth(), logoutDate.getDate()),
            $lt: new Date(logoutDate.getFullYear(), logoutDate.getMonth(), logoutDate.getDate() + 1),
          },
        },
        {
          $inc: { timeSpent: timeSpent },
          $set: { date: logoutDate },
        },
        { upsert: true }
      );

      // Increment totalTimeSpent for the user
      user.totalTimeSpent += timeSpent;

      // Clear the user's token (log them out)
      await User.findByIdAndUpdate(userID, { token: null, totalTimeSpent: user.totalTimeSpent });

      res.json({ message: 'Logout successful' });
    } else {
      res.status(401).json({ message: 'User not logged in or login timestamp missing' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Get logged-in user route
router.get('/loggeduser', authenticateUser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send only necessary user data, not the entire user object
    const userData = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      imageRes: user.imageRes,
      userName: user.userName,
      // Add other necessary fields
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.post('/loginiios', async (req, res) => {
  const { email, password } = req.body;
  // Check if the request body is null
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required in the request body' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials email' });
    }
    // Check if the user is banned and if banExpirationDate is passed
    if (user.isBannedTemp && user.banExpirationDate && new Date() > user.banExpirationDate) {
      // If banExpirationDate is passed, unban the user
      user.isBannedTemp = false;
      user.banExpirationDate = null;
      await user.save();
    }

    // Check if the user is banned after potential unban
    if (user.isBanned) {
      return res.status(401).json({ message: 'User is banned' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials password' });
    }

    // Record login information in DailyStats collection
    const loginDate = new Date();
    await DailyStats.findOneAndUpdate(
      {
        userId: user._id,
        date: {
          $gte: new Date(loginDate.getFullYear(), loginDate.getMonth(), loginDate.getDate()),
          $lt: new Date(loginDate.getFullYear(), loginDate.getMonth(), loginDate.getDate() + 1),
        },
      },
      {
        $inc: { loginCount: 1 },
        $set: { date: loginDate },
      },
      { upsert: true }
    );
    user.lastLoginTimestamp = loginDate;
    await user.save();
    // Increment loginCount for the updatedUser
    user.loginCount += 1;

    // Generate JWT token
    const token = jwt.sign({ user: { id: user._id, role: user.role } }, 'your-secret-key', { expiresIn: '1h' });

    // Update user with JWT token
    await User.findByIdAndUpdate(user._id, {
      token: token,
      loginCount: user.loginCount,
    });

    // Send the token in the response along with user details
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role:user.role,
        // Include other user details as needed
      },
      token: token,
      role:user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});






async function getUserDailyStats(userId, date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const userStats = await DailyStats.findOne({
    userId: userId,
    date: { $gte: startOfDay, $lt: endOfDay },
  });

  return userStats || { loginCount: 0, timeSpent: 0 };
}

async function getUserGlobalStatsuser(userId) {
  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      // Handle the case where the user is not found
      return { loginCount: 0, totalTimeSpent: 0 };
    }

    // Extract totalLoginCount and totalTimeSpent from the user model
    const { loginCount, totalTimeSpent } = user;

    // Create an object to hold the global stats
    const globalStats = {
      totalLoginCount: loginCount || 0, // Use 0 as the default value if undefined
      totalTimeSpent: totalTimeSpent || 0, // Use 0 as the default value if undefined
    };

    return globalStats;
  } catch (error) {
    console.error('Error fetching user global stats:', error);
    return { totalLoginCount: 0, totalTimeSpent: 0 };
  }
}
// Function to get user daily stats
router.get('/userdailystats/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const date = new Date();

    const userDailyStats = await getUserDailyStats(userId, date);
    res.json(userDailyStats);
  } catch (error) {
    console.error('Error fetching user daily stats:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Function to get user global stats
router.get('/userglobalstats/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const userGlobalStats = await getUserGlobalStatsuser(userId);
    res.json({ userGlobalStats });
  } catch (error) {
    console.error('Error fetching user global stats:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});



async function getAllUsersGlobalStats() {
  const globalStats = await DailyStats.aggregate([
    {
      $group: {
        _id: null,
        totalLoginCount: { $sum: '$loginCount' },
        totalTimeSpent: { $sum: '$timeSpent' },
      },
    },
  ]);

  if (globalStats.length > 0) {
    return globalStats[0];
  } else {
    return { totalLoginCount: 0, totalTimeSpent: 0 };
  }
}
// Route to get global stats for all users
router.get('/allusersstats', async (req, res) => {
  try {
    const globalStats = await getAllUsersGlobalStats();

    res.json({ globalStats });
  } catch (error) {
    console.error('Error fetching all users stats:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});



router.post('/loginfb', async (req, res) => {
  const { email, tokenfb, nom, prenom } = req.body;

  try {
    // Validate and sanitize user inputs
    // (e.g., using a library like validator or a custom function)

    // Check if user with the given email and matching tokenfb exists
    let existingUser = await User.findOne({ email, tokenfb });

    // If the user doesn't exist, create a new user
    if (!existingUser) {
      // Create a new user
      const newUser = new User({
        email,
        tokenfb,
        nom,
        prenom,
        password: tokenfb,
        // Other user properties
      });

      console.log("User facebook Created");

      await newUser.save();
      existingUser = newUser; // Set existingUser to the new user
    }

    const token = jwt.sign(
      { user: { id: existingUser._id, role: existingUser.role } },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    // Update the existing user with the new token and increment loginCount
    existingUser = await User.findByIdAndUpdate(
      existingUser._id,
      { token, $inc: { loginCount: 1 } }, // Increment loginCount by 1
      { new: true }
    );

    // Return user details with the existing user's tokenfb
    return res.status(200).json({
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        tokenfb: existingUser.tokenfb,
        // Other user properties you want to include in the response
      },
      token,
    });
  } catch (error) {
    console.error('Error in loginfb:', error);

    // Log detailed error information in your development environment
    // logger.error('Error in loginfb:', error);

    // Return an appropriate status code for the error
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/connectedusers/:day', async (req, res) => {
  try {
    const day = req.params.day;
    const currentDate = new Date(day);

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // Query for the total count of users
    const totalCount = await DailyStats.countDocuments({
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
      },
      loginCount: { $gt: 0 },
    });

    // Query for paginated list of users
    const loggedInUsers = await DailyStats.find({
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
      },
      loginCount: { $gt: 0 },
    })
    .populate('userId')
    .skip(skip)
    .limit(pageSize);

    const connectedUsersInfo = loggedInUsers.map((dailyStats) => ({
      userId: dailyStats.userId._id,
      email: dailyStats.userId.email,
      timeConnected: dailyStats.timeSpent, // Assuming timeSpent is the time connected for the day
      loginCount: dailyStats.loginCount, // Number of logins for the day
    }));

    // Respond with both the paginated list and the total count
    res.json({ connectedUsers: connectedUsersInfo, total: totalCount });
  } catch (error) {
    console.error('Error fetching connected users:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

export default router;

