export function authorize(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) return response.status(403).json({ success: false, message: 'You do not have permission to access this resource' });
    return next();
  };
}
