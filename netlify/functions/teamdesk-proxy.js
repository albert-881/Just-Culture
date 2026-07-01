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
  
    // Build field list from raw query string
    const allParams    = event.rawQuery || '';
    const fieldMatches = [...allParams.matchAll(/field=([^&]+)/g)];
    const fieldList    = fieldMatches.map(m => decodeURIComponent(m[1]));
  
    // TeamDesk API — token in Authorization header, POST with JSON body
    const url = `https://truebooks.teamdesk.net/secure/api/v2/${APP_ID}/select.json`;
  
    const bodyObj = { table };
    if (filter)           bodyObj.filter    = filter;
    if (fieldList.length) bodyObj.field     = fieldList;
    if (params.sortby)    bodyObj.sortby    = params.sortby;
    if (params.sortorder) bodyObj.sortorder = params.sortorder;
    if (params.top)       bodyObj.top       = parseInt(params.top);
  
    try {
      // Try with Authorization header instead of token param
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Token ${API_KEY}`
        },
        body: JSON.stringify(bodyObj)
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
        body: JSON.stringify({ debug_url: url, debug_body: bodyObj, debug_status: response.status, data })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Proxy error', detail: err.message })
      };
    }
  };