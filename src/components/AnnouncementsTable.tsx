import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Link } from '@mui/material';
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
    field: 'SLONGNAME',
    headerName: 'Company Name',
    width: 200,
  },
  {
    field: 'HEADLINE',
    headerName: 'Headline',
    width: 300,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: (params.row.CRITICALNEWS === 1 || params.row.CRITICALNEWS === '1') ? 'bold' : 'normal' }}>
          {params.value || params.row.NEWSSUB}
        </Typography>
        {(params.row.CRITICALNEWS === 1 || params.row.CRITICALNEWS === '1') && (
          <Typography variant="caption" color="error">Critical</Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'SUBCATNAME',
    headerName: 'Subcategory',
    width: 150,
  },
  {
    field: 'ATTACHMENTNAME',
    headerName: 'Attachment',
    width: 200,
    renderCell: (params: any) => {
      const attachment = params.value || '';
      if (!attachment) return 'No attachment';
      const url = buildPdfUrl(attachment);
      return (
        <Box>
          <Link href={url || ''} target="_blank" rel="noopener">
            {attachment}
          </Link>
          {params.row.Fld_Attachsize && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({(parseInt(params.row.Fld_Attachsize) / 1024).toFixed(0)} KB)
            </Typography>
          )}
        </Box>
      );
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
