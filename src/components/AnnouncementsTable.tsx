import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Link, Button } from '@mui/material';
import type { Announcement } from '../services/bseApi';
import { buildPdfUrl } from '../services/bseApi';
import { format } from 'date-fns';

interface Props {
  announcements: Announcement[];
  rowCount: number;
  loading: boolean;
}

const columns = [
  {
    field: 'SLONGNAME',
    headerName: 'Company Name',
    width: 200,
  },
  {
    field: 'DT_TM',
    headerName: 'Date & Time',
    width: 180,
    valueGetter: (params: any) => {
      try {
        const date = new Date(params.value);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
      } catch {
        return params.value;
      }
    },
    sortable: true,
  },
  {
    field: 'HEADLINE',
    headerName: 'Headline',
    width: 300,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: (params.row.CRITICALNEWS === 1 || params.row.CRITICALNEWS === '1') ? 'bold' : 'normal' }}>
          {params.value || params.row.NEWSSUB || 'N/A'}
        </Typography>
        {(params.row.CRITICALNEWS === 1 || params.row.CRITICALNEWS === '1') && (
          <Typography variant="caption" color="error">Critical</Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'NEWSSUB',
    headerName: 'News Subject',
    width: 200,
  },
  {
    field: 'CATEGORYNAME',
    headerName: 'Category',
    width: 150,
  },
  {
    field: 'SUBCATNAME',
    headerName: 'Subcategory',
    width: 150,
  },
  {
    field: 'SCRIP_CD',
    headerName: 'Scrip Code',
    width: 100,
    renderCell: (params: any) => params.value?.toString() || '',
  },
  {
    field: 'ATTACHMENTNAME',
    headerName: 'Attachment',
    width: 200,
    renderCell: (params: any) => {
      const attachment = params.value || '';
      if (!attachment || attachment.trim() === '') return 'No attachment';
      const url = buildPdfUrl(attachment);
      return (
        <Box>
          <Link href={url || '#'} target="_blank" rel="noopener">
            {attachment}
          </Link>
          {params.row.Fld_Attachsize && parseInt(params.row.Fld_Attachsize) > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({(parseInt(params.row.Fld_Attachsize) / 1024).toFixed(0)} KB)
            </Typography>
          )}
        </Box>
      );
    },
  },
  {
    field: 'DOWNLOAD',
    headerName: 'Download PDF',
    width: 100,
    renderCell: (params: any) => {
      const attachment = params.value?.ATTACHMENTNAME || '';
      if (!attachment || attachment.trim() === '') return 'N/A';
      const pdfUrl = `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${attachment}`;
      return (
        <Box>
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            size="small"
            variant="outlined"
          >
            Download
          </Button>
        </Box>
      );
    },
  },
  {
    field: 'PDF_URL',
    headerName: 'PDF Link',
    width: 300,
    renderCell: (params: any) => {
      const attachment = params.value?.ATTACHMENTNAME || '';
      if (!attachment || attachment.trim() === '') return 'N/A';
      const pdfUrl = `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${attachment}`;
      return (
        <Link href={pdfUrl} target="_blank" rel="noopener" sx={{ wordBreak: 'break-all' }}>
          {pdfUrl}
        </Link>
      );
    },
  },
  {
    field: 'PDFFLAG',
    headerName: 'PDF Available',
    width: 100,
    renderCell: (params: any) => (
      <Typography variant="body2">
        {(params.value === 1 || params.value === '1') ? '✓' : '✗'}
      </Typography>
    ),
  },
  {
    field: 'ANNOUNCEMENT_TYPE',
    headerName: 'Type',
    width: 80,
  },
  {
    field: 'OLD',
    headerName: 'Old',
    width: 60,
    renderCell: (params: any) => (
      <Typography variant="body2">
        {(params.value === 1 || params.value === '1') ? 'Yes' : 'No'}
      </Typography>
    ),
  },
  {
    field: 'News_submission_dt',
    headerName: 'Submission Date',
    width: 180,
    valueGetter: (params: any) => {
      try {
        const date = new Date(params.value);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
      } catch {
        return params.value;
      }
    },
  },
  {
    field: 'NSURL',
    headerName: 'Company URL',
    width: 200,
    renderCell: (params: any) => {
      const url = params.value || '';
      return url ? (
        <Link href={url} target="_blank" rel="noopener">
          View on BSE
        </Link>
      ) : 'N/A';
    },
  },
];

const AnnouncementsTable: React.FC<Props> = ({ announcements, rowCount, loading }) => {
  const rows = announcements.map((ann, index) => ({
    id: index,
    ...ann,
  }));

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Results ({rowCount})
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
      />
    </Box>
  );
};

export default AnnouncementsTable;
