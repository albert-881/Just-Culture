exports.handler = async (event) => {
    const API_KEY = '71BD2A8197EB4DA9A5E93734545D4974';
    const APP_ID  = '93348';
    const BASE    = `https://truebooks.teamdesk.net/secure/api/v2/${APP_ID}/${API_KEY}`;
  
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
  
    // Correct TeamDesk URL: /api/v2/{appId}/{token}/{table}/select.json
    const qs = new URLSearchParams();
    if (filter) qs.set('filter', filter);
    fieldList.forEach(f => qs.append('field', f));
    if (params.sortby)    qs.set('sortby',    params.sortby);
    if (params.sortorder) qs.set('sortorder', params.sortorder);
    if (params.top)       qs.set('top',       params.top);
  
    const url = `${BASE}/${encodeURIComponent(table)}/select.json?${qs.toString()}`;
  
    try {
      const response = await fetch(url, { method: 'GET' });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
  
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