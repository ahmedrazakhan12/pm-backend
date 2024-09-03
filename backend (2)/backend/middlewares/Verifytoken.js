require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    // console.log("Verified Token: ",token);

    if (!token) {
        return res.status(401).json({ stauts: 401, error: 'Access denied. Please Login First.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Access denied. Please Login or Register.' });
    }
};

module.exports = verifyToken;
