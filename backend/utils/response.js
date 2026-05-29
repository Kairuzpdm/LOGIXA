const sendSuccess = (res, statusCode, payload = {}) => {
  return res.status(statusCode).json({
    status: 'success',
    ...payload
  });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};

const sendNotFound = (res, message = 'Recurso no encontrado') => {
  return sendError(res, 404, message);
};

const sendConflict = (res, message) => {
  return sendError(res, 409, message);
};

const ensureRecordExists = (rows, res, message = 'Recurso no encontrado') => {
  if (!rows || rows.length === 0) {
    sendNotFound(res, message);
    return false;
  }

  return true;
};

const ensureAffectedRows = (result, res, message = 'Recurso no encontrado') => {
  if (!result || result.affectedRows === 0) {
    sendNotFound(res, message);
    return false;
  }

  return true;
};

module.exports = {
  sendSuccess,
  sendError,
  sendNotFound,
  sendConflict,
  ensureRecordExists,
  ensureAffectedRows
};
