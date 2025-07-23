export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied: no user or role" });
    }

    // ✅ Check if the user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied: role '${req.user.role}' not authorized` });
    }

    next();
  };
};
