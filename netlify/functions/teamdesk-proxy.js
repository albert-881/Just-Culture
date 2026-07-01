exports.handler = async (event) => {
    const API_KEY = '71BD2A8197EB4DA9A5E93734545D4974';
    const BASE    = 'https://truebooks.teamdesk.net/secure/api/v2/93348';
  
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
      };
    }
  
    // Get query params passed from the HTML form
    const params = new URLSearchParams(event.queryStringParameters || {});
    params.set('token', API_KEY);
  
    const url = `${BASE}/select.json?${params.toString()}`;
  
    try {
      // TeamDesk API requires POST
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
  
      if (!response.ok) {
        const errText = await response.text();
        return {
          statusCode: response.status,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `TeamDesk returned ${response.status}`, detail: errText })
        };
      }
  
      const data = await response.json();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Proxy error', detail: err.message })
      };
    }
  };