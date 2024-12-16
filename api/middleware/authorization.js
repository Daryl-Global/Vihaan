require("dotenv").config();

const UserModel = require("../models/userModel");

const jwt = require("jsonwebtoken");

// Middleware function to authenticate the token
const authenticateToken = (req, res, next) => {
  try {
    // Retrieve the token from the request headers
    const token = req.cookies["access_token"];
    // console.log("Token is ", token); // debug

    if (!token) {
      // Token not provided, return unauthorized
      return res.sendStatus(401);
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        // Token verification failed, return forbidden

        return res.sendStatus(403);
      }
      // console.log("Password verified!"); //debug
      // Token is valid, set the userId on the request object, this ayload userId is being signed while login
      req.userId = payload.userId;
      req.role = payload.userRole;
      next();
    });
  } catch (error) {
    // Error occurred, return internal server error
    res.sendStatus(403);
  }
};

// New middleware for gate pass authorization with permission check
const gatePassAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies["access_token"];
    if (!token) {
      return res.sendStatus(401); // Unauthorized
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      req.userId = payload.userId;
      req.role = payload.userRole;

      // Fetch the user and check for 'delivery_report' permission.
      const user = await UserModel.findOne({userId: req.userId});
      if (!user) {
        return res.sendStatus(404); // User not found
      }

      if (!user.permissions.includes('delivery_report') && !user.permissions.includes('all_access')) {
        return res.status(403).json({ message: "Permission denied: 'delivery_report' access required" });
      }

      next();
    });
  } catch (error) {
    res.sendStatus(403); // Error occurred, forbidden
  }
};

// Export the middleware function
module.exports = { 
  authenticateToken, 
  gatePassAuthorization 
};