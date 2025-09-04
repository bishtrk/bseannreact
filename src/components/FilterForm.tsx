import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete,
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

interface CompanyOption {
  label: string;
  value: string;
}

const FilterForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [company, setCompany] = React.useState<CompanyOption | null>(null);
  const [scrip, setScrip] = React.useState('543985');
  const [category, setCategory] = React.useState('Company Update');
  const [fromDate, setFromDate] = React.useState<Date>(new Date()); // Today
  const [toDate, setToDate] = React.useState<Date>(new Date()); // Today
  const [strSearch, setStrSearch] = React.useState<'P' | 'S' | 'All'>('P');
  const [strType, setStrType] = React.useState('C');
  const [subcategory, setSubcategory] = React.useState('-1');
  const [pageno, setPageno] = React.useState(1);
  const [companyList, setCompanyList] = React.useState<CompanyOption[]>([]);

  React.useEffect(() => {
    fetch('/src/data/company_list.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const companies: CompanyOption[] = [];

        // Skip header row and parse CSV
        lines.slice(1).forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const scripCode = parts[0].trim();
            const companyName = parts.slice(1).join(',').trim().replace(/"/g, '');
            if (scripCode && companyName) {
              companies.push({
                label: companyName,
                value: scripCode
              });
            }
          }
        });

        setCompanyList(companies);

        // Set default company to first one if available
        if (companies.length > 0) {
          const defaultCompany = companies.find(c => c.value === '543985') || companies[0];
          setCompany(defaultCompany);
          setScrip(defaultCompany.value);
        }
      })
      .catch(error => {
        console.error('Error loading company list:', error);
        // Fallback to manual input if CSV fails to load
      });
  }, []);

  const handleCompanyChange = (event: any, newValue: CompanyOption | null) => {
    setCompany(newValue);
    setScrip(newValue?.value || '');
  };

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
        <Autocomplete
          options={companyList}
          value={company}
          onChange={handleCompanyChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Company" variant="outlined" />
          )}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 300 }}
        />
        <TextField
          label="Scrip Code (Selected)"
          value={scrip}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
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
