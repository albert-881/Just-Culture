exports.handler = async (event) => {
    const API_KEY = '71BD2A8197EB4DA9A5E93734545D4974';
    const APP_ID  = '93348';
  
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
  
    const params = event.queryStringParameters || {};
    const table  = params.table  || '';
    const filter = params.filter || '';
  
    // Build field list
    const fields = [];
    if (params.field) fields.push(params.field);
    // Netlify parses repeated params as a single string — collect all field params
    const allParams = event.rawQuery || '';
    const fieldMatches = [...allParams.matchAll(/field=([^&]+)/g)];
    const fieldList = fieldMatches.map(m => decodeURIComponent(m[1]));
  
    // TeamDesk REST API — correct endpoint format
    const url = `https://truebooks.teamdesk.net/secure/api/v2/${APP_ID}/${table}/select.json`;
  
    // Build POST body
    const body = new URLSearchParams();
    body.set('token', API_KEY);
    if (filter) body.set('filter', filter);
    fieldList.forEach(f => body.append('field', f));
    if (params.sortby)    body.set('sortby',    params.sortby);
    if (params.sortorder) body.set('sortorder', params.sortorder);
    if (params.top)       body.set('top',       params.top);
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
  
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ debug_url: url, debug_body: body.toString(), data })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Proxy error', detail: err.message })
      };
    }
  };