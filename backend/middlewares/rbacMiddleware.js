/**
 * Middleware to authorize access based on user roles.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required before authorization.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level.',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Middleware to enforce base-level data scoping.
 * - ADMIN: Can see all bases (no filter applied)
 * - BASE_COMMANDER: Automatically filtered to their assigned base
 * - LOGISTICS_OFFICER: Automatically filtered to their assigned base
 */
export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    // Admins can optionally filter by baseId via query params
    return next();
  }

  // Non-admin users are scoped to their assigned base
  if (req.user.baseId) {
    req.query.baseId = String(req.user.baseId);
    req.body.baseId = req.user.baseId;
  }

  next();
};
