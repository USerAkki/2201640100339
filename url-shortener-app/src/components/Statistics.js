import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
} from '@mui/material';
import { ExpandMore, BarChart, AccessTime, LocationOn, Link as LinkIcon, Home } from '@mui/icons-material';

const Statistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [clickData, setClickData] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const mappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    const clicks = JSON.parse(localStorage.getItem('clickData') || '[]');

    const statsArray = Object.entries(mappings).map(([shortcode, data]) => {
      const urlClicks = clicks.filter(click => click.shortcode === shortcode);
      return {
        shortcode,
        longUrl: data.longUrl,
        created: data.created || new Date().toISOString(), // Fallback if not stored
        expiry: data.expiry,
        totalClicks: urlClicks.length,
        clicks: urlClicks,
      };
    });

    setStats(statsArray);
    setClickData(clicks);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalClicks = () => {
    return clickData.length;
  };

  const getUniqueUrls = () => {
    return stats.length;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <BarChart sx={{ mr: 1, fontSize: '2rem' }} />
          URL Statistics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Analytics for your shortened URLs
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Shortener
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {getTotalClicks()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {getUniqueUrls()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Shortened URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {stats.filter(s => new Date(s.expiry) > new Date()).length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URL Statistics */}
      {stats.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          No shortened URLs found. Create some URLs first to see statistics.
        </Alert>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            URL Performance
          </Typography>

          {stats.map((stat, index) => (
            <Accordion key={index} sx={{ mb: 2, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {window.location.origin}/{stat.shortcode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      {stat.longUrl}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Chip
                      label={`${stat.totalClicks} clicks`}
                      color={stat.totalClicks > 0 ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={new Date(stat.expiry) > new Date() ? 'Active' : 'Expired'}
                      color={new Date(stat.expiry) > new Date() ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      URL Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(stat.created)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {formatDate(stat.expiry)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Click Statistics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clicks: {stat.totalClicks}
                    </Typography>
                  </Grid>
                </Grid>

                {stat.clicks.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Click Details
                    </Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><AccessTime sx={{ fontSize: '1rem', mr: 0.5 }} />Timestamp</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell><LocationOn sx={{ fontSize: '1rem', mr: 0.5 }} />Location</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stat.clicks.map((click, clickIndex) => (
                            <TableRow key={clickIndex}>
                              <TableCell>{formatDate(click.timestamp)}</TableCell>
                              <TableCell>{click.source}</TableCell>
                              <TableCell>{click.location}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Statistics;