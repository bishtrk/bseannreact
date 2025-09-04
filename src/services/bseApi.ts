import axios from 'axios';

// Reverse-proxy URL for CORS-free requests
const API_BASE = "http://localhost:3001/api/announcements";
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
  try {
    console.log('🔌 Fetching BSE announcements via reverse-proxy...', { scrip, category, pageno });

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

    const qs = new URLSearchParams(params);
    const url = `${API_BASE}?${qs.toString()}`;

    console.log('🚀 Making API request to:', url);

    const response = await axios.get(url, { timeout });
    console.log('✅ Received response:', response.status);

    const data = response.data;

    // Assume direct JSON response from reverse-proxy
    const table = data.Table || [];
    const meta = data.Table1 ? data.Table1[0] : {};
    return { table, meta, error: null };
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
