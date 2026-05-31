// Simple Vercel Serverless Health Endpoint
// This runs as a serverless function and reports basic deployment status.
// Note: It cannot access in-memory server state from the long-running Socket.IO server.

module.exports = (req, res) => {
  try {
    const now = new Date().toISOString();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: now,
      note: 'Serverless health endpoint (no in-memory room data).'
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ status: 'error', error: String(err) }));
  }
};
