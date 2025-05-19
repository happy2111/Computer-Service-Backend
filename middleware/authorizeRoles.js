const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Неавторизованный доступ" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Доступ запрещён: недостаточно прав" });
    }
    next();
  };
};

module.exports = authorizeRoles;
