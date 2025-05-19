const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: "Токен не предоставлен" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ msg: "Токен отсутствует" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // теперь в req.user будет id и роль пользователя
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Неверный токен" });
  }
}

module.exports = authMiddleware;
