import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Delete, Link as LinkIcon, BarChart } from '@mui/icons-material';
import logger from '../utils/logger';

const MAX_URLS = 5;

const UrlShortener = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([
    {
      longUrl: '',
      validity: '',
      shortcode: '',
      error: '',
    }
  ]);
  const [results, setResults] = useState([]);
  const [globalError, setGlobalError] = useState('');

  const handleInputChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    newUrls[index].error = '';
    setUrls(newUrls);
  };

  const addUrl = () => {
    if (urls.length < MAX_URLS) {
      setUrls([...urls, {
        longUrl: '',
        validity: '',
        shortcode: '',
        error: '',
      }]);
    }
  };

  const removeUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortcode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const isShortcodeUnique = (shortcode) => {
    const stored = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    return !stored[shortcode];
  };

  const handleSubmit = () => {
    setGlobalError('');
    setResults([]);
    const validUrls = urls.filter((url) => url.longUrl.trim() !== '');

    if (validUrls.length === 0) {
      setGlobalError('Please enter at least one URL.');
      return;
    }

    const newResults = [];
    const mappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');

    for (let i = 0; i < validUrls.length; i++) {
      const { longUrl, validity, shortcode } = validUrls[i];
      let error = '';

      if (!validateUrl(longUrl)) {
        error = 'Invalid URL format.';
      }

      const validMinutes = validity ? parseInt(validity, 10) : 30;
      if (validity && (isNaN(validMinutes) || validMinutes <= 0)) {
        error = 'Validity must be a positive integer.';
      }

      let finalShortcode = shortcode.trim();
      if (finalShortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(finalShortcode)) {
          error = 'Shortcode must be alphanumeric.';
        } else if (!isShortcodeUnique(finalShortcode)) {
          error = 'Shortcode already exists.';
        }
      } else {
        do {
          finalShortcode = generateShortcode();
        } while (!isShortcodeUnique(finalShortcode));
      }

      if (error) {
        const newUrls = [...urls];
        newUrls[i].error = error;
        setUrls(newUrls);
        logger.error(`Validation error for URL ${i + 1}: ${error}`);
        return;
      }

      const created = new Date().toISOString();
      const expiry = new Date(Date.now() + validMinutes * 60 * 1000).toISOString();
      mappings[finalShortcode] = { longUrl, expiry, created };
      newResults.push({
        original: longUrl,
        short: `${window.location.origin}/${finalShortcode}`,
        expiry: new Date(expiry).toLocaleString(),
      });

      logger.info(`Shortened URL: ${longUrl} to ${finalShortcode}`);
    }

    localStorage.setItem('urlMappings', JSON.stringify(mappings));
    setResults(newResults);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <LinkIcon sx={{ mr: 1, fontSize: '2rem' }} />
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Create short, shareable links with custom validity periods
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BarChart />}
          onClick={() => navigate('/statistics')}
          sx={{ mb: 2 }}
        >
          View Statistics
        </Button>
      </Box>

      {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            URLs to Shorten
            <Chip
              label={`${urls.length}/${MAX_URLS}`}
              size="small"
              color={urls.length === MAX_URLS ? 'warning' : 'default'}
              sx={{ ml: 1 }}
            />
          </Typography>

          {urls.map((url, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  URL {index + 1}
                </Typography>
                {urls.length > 1 && (
                  <IconButton
                    onClick={() => removeUrl(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Long URL"
                    placeholder="https://example.com/very-long-url"
                    value={url.longUrl}
                    onChange={(e) => handleInputChange(index, 'longUrl', e.target.value)}
                    error={!!url.error}
                    helperText={url.error}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    placeholder="30"
                    value={url.validity}
                    onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode"
                    placeholder="abc123"
                    value={url.shortcode}
                    onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                    variant="outlined"
                    helperText="Optional - alphanumeric only"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          {urls.length < MAX_URLS && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addUrl}
              sx={{ mt: 1 }}
            >
              Add Another URL
            </Button>
          )}
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Shorten URLs
        </Button>
      </Box>

      {results.length > 0 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
              Shortened URLs
            </Typography>
            {results.map((result, index) => (
              <Paper key={index} sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Original:</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {result.original}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Short Link:</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      <a
                        href={result.short}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none' }}
                      >
                        {result.short}
                      </a>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Expires:</Typography>
                    <Typography variant="body1">{result.expiry}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default UrlShortener;