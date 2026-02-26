module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.userRole;

    if (!role) {
      return res.status(403).json({ message: "No role assigned" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};