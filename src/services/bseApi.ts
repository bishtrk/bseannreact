import axios from 'axios';

// Proxy URLs for CORS-free requests
const API_BASE = "/api/bse/w";
const BSE_ANN_PAGE = "/ann";
const PDF_VIEW_BASE = "/pdf/";

export interface Announcement {
  DT_TM: string;
  SLONGNAME: string;
  HEADLINE: string;
  SUBCATNAME: string;
  CRITICALNEWS: string;
  ATTACHMENTNAME: string;
  URL: string;
  SCRIP_CD: string;
  NEWSSUB: string;
  Fld_Attachsize: string | null;
  PDFFLAG: string;
}

export interface Meta {
  ROWCNT?: string;
  [key: string]: any;
}

export interface FetchResult {
  table: Announcement[] | null;
  meta: Meta | null;
  error: string | null;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function extractJsonFromHtml(text: string): { Table?: Announcement[]; Table1?: Meta[] } | null {
  // Try direct JSON object
  const match = text.match(/(\{[\s\S]*?"Table"\s*:\s*\[.*?\][\s\S]*?\})/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }
  // Try JS variable
  const jsMatch = text.match(/var\s+[A-Za-z0-9_]+\s*=\s*(\{[\s\S]*?"Table"\s*:\s*\[.*?\][\s\S]*?\});/);
  if (jsMatch) {
    try {
      return JSON.parse(jsMatch[1]);
    } catch {}
  }
  return null;
}

export async function fetchAnnouncements(
  scrip: string,
  category: string,
  fromDate: Date,
  toDate: Date,
  strSearch: 'P' | 'S' | 'All',
  strType: string,
  subcategory: string,
  pageno: number,
  timeout = 20000
): Promise<FetchResult> {
  const session = axios.create({
    withCredentials: false,
    validateStatus: function (status) {
      return true; // Accept all status codes so we can handle redirects manually
    },
    maxRedirects: 0 // Don't follow redirects
  }) as any;

  // Set headers
  session.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  session.defaults.headers.common['Accept'] = 'application/json, text/javascript, */*; q=0.01';
  session.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.9';
  session.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  session.defaults.headers.common['Referer'] = BSE_ANN_PAGE;

  try {
    console.log('🔌 Fetching BSE announcements with proxy...', { scrip, category, pageno });

    // Prime session by visiting page
    console.log('📡 Visiting BSE page for session setup...');
    await session.get(BSE_ANN_PAGE, { timeout });

    const params = {
      pageno,
      strCat: category,
      strPrevDate: formatDate(fromDate),
      strScrip: scrip,
      strSearch: strSearch === 'All' ? 'P' : strSearch,
      strToDate: formatDate(toDate),
      strType,
      subcategory
    };

    console.log('🚀 Making API request to:', API_BASE, 'with params:', params);

    const response = await session.get(API_BASE, { params, timeout });
    console.log('✅ Received response:', response.status, response.headers);

    // Log the response data for debugging
    if (response.status >= 300 && response.status < 400) {
      console.log('🔄 Redirect detected, checking headers for redirect target');
    }
    const contentType = response.headers['content-type'] || '';
    const text = response.data;

    // Case 1: JSON response
    if (contentType.includes('application/json') || text.trim().startsWith('{')) {
      try {
        const json = JSON.parse(text);
        const table = json.Table || [];
        const meta = json.Table1 ? json.Table1[0] : {};
        return { table, meta, error: null };
      } catch {}
    }

    // Case 2: Extract JSON from HTML
    const embedded = extractJsonFromHtml(text);
    if (embedded) {
      const table = embedded.Table || [];
      const meta = embedded.Table1 ? embedded.Table1[0] : {};
      return { table, meta, error: null };
    }

    // Case 3: Return HTML error
    return { table: null, meta: null, error: `Received HTML instead of JSON. Snippet: ${text.slice(0, 400)}` };
  } catch (e) {
    return { table: null, meta: null, error: `Network error: ${e}` };
  }
}

export function buildPdfUrl(attachment: string): string | null {
  if (!attachment) return null;
  if (attachment.endsWith('.pdf')) {
    return PDF_VIEW_BASE + attachment;
  } else {
    return PDF_VIEW_BASE + attachment + '.pdf';
  }
}
