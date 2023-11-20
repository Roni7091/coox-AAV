const jwt = require('jsonwebtoken');
const verifyJWT = (req, res, next) => {
    const authToken = req.headers['authorization'];
    console.log('nameOfUser authtoken', authToken);
    if (!authToken ||!authToken.startsWith('Bearer ')) return res.status(401).send({
        message: 'Unauthorized access'
    })

    const token = authToken.split(' ')[1];
    console.log('nameOfUser token', token)
    const decodedData = jwt.verify(token, "shdfhksesfsetffsf");
    req.user = decodedData;
    next();
}

module.exports = { verifyJWT };