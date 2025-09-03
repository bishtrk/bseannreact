import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography, Container, Alert } from '@mui/material';
import FilterForm from './components/FilterForm';
import AnnouncementsTable from './components/AnnouncementsTable';
import { fetchAnnouncements } from './services/bseApi';
import type { Announcement } from './services/bseApi';
import type { FilterData } from './components/FilterForm';

const theme = createTheme();

function App() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);

  const handleSubmit = async (data: FilterData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnnouncements(
        data.scrip,
        data.category,
        data.fromDate,
        data.toDate,
        data.strSearch,
        data.strType,
        data.subcategory,
        data.pageno
      );
      if (result.error) {
        setError(result.error);
        setAnnouncements([]);
        setRowCount(0);
      } else {
        setAnnouncements(result.table || []);
        setRowCount(result.meta?.ROWCNT ? parseInt(result.meta.ROWCNT) : 0);
      }
    } catch (e) {
      setError('Failed to fetch announcements');
      setAnnouncements([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          BSE Announcements Explorer
        </Typography>
        <FilterForm onSubmit={handleSubmit} loading={loading} />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <AnnouncementsTable announcements={announcements} rowCount={rowCount} loading={loading} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
