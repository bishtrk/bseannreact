import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface FilterData {
  scrip: string;
  category: string;
  fromDate: Date;
  toDate: Date;
  strSearch: 'P' | 'S' | 'All';
  strType: string;
  subcategory: string;
  pageno: number;
}

interface Props {
  onSubmit: (data: FilterData) => void;
  loading: boolean;
}

const FilterForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [scrip, setScrip] = React.useState('543985');
  const [category, setCategory] = React.useState('Company Update');
  const [fromDate, setFromDate] = React.useState<Date>(new Date(2025, 7, 1)); // August
  const [toDate, setToDate] = React.useState<Date>(new Date(2025, 8, 1)); // September
  const [strSearch, setStrSearch] = React.useState<'P' | 'S' | 'All'>('P');
  const [strType, setStrType] = React.useState('C');
  const [subcategory, setSubcategory] = React.useState('-1');
  const [pageno, setPageno] = React.useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      scrip,
      category,
      fromDate,
      toDate,
      strSearch,
      strType,
      subcategory,
      pageno,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        <TextField
          label="Scrip code"
          value={scrip}
          onChange={(e) => setScrip(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="Category (strCat)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
        />
        <DatePicker
          label="From Date"
          value={fromDate}
          onChange={(date: Date | null) => date && setFromDate(date)}
          slotProps={{ textField: { variant: 'outlined' } }}
        />
        <DatePicker
          label="To Date"
          value={toDate}
          onChange={(date: Date | null) => date && setToDate(date)}
          slotProps={{ textField: { variant: 'outlined' } }}
        />
        <FormControl variant="outlined">
          <InputLabel>strSearch</InputLabel>
          <Select
            value={strSearch}
            onChange={(e) => setStrSearch(e.target.value as 'P' | 'S' | 'All')}
            label="strSearch"
          >
            <MenuItem value="P">P</MenuItem>
            <MenuItem value="S">S</MenuItem>
            <MenuItem value="All">All</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="strType"
          value={strType}
          onChange={(e) => setStrType(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="Subcategory"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="Page number"
          type="number"
          value={pageno}
          onChange={(e) => setPageno(Number(e.target.value))}
          variant="outlined"
          inputProps={{ min: 1 }}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Announcements'}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default FilterForm;
