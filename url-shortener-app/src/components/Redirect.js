import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { Container, Typography, Alert } from '@mui/material';
import logger from '../utils/logger';

const Redirect = () => {
  const { shortcode } = useParams();

  useEffect(() => {
    const mappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    const mapping = mappings[shortcode];

    if (mapping) {
      const now = new Date();
      const expiry = new Date(mapping.expiry);
      if (now < expiry) {
        // Log the click
        const clickData = {
          timestamp: new Date().toISOString(),
          shortcode: shortcode,
          source: document.referrer || 'Direct',
          location: 'Unknown', // In a real app, you'd use geolocation API
        };

        // Get approximate location if possible
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clickData.location = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
              saveClickData(clickData);
            },
            () => {
              // Fallback to mock location
              clickData.location = getMockLocation();
              saveClickData(clickData);
            }
          );
        } else {
          clickData.location = getMockLocation();
          saveClickData(clickData);
        }

        function saveClickData(data) {
          const clicks = JSON.parse(localStorage.getItem('clickData') || '[]');
          clicks.push(data);
          localStorage.setItem('clickData', JSON.stringify(clicks));
          logger.info(`Click logged for ${shortcode}`);
        }

        function getMockLocation() {
          // Mock locations for demo
          const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia', 'Berlin, Germany'];
          return locations[Math.floor(Math.random() * locations.length)];
        }

        // Small delay to ensure click is logged
        setTimeout(() => {
          logger.info(`Redirecting ${shortcode} to ${mapping.longUrl}`);
          window.location.href = mapping.longUrl;
        }, 100);
      } else {
        logger.warn(`Expired shortcode: ${shortcode}`);
      }
    } else {
      logger.error(`Shortcode not found: ${shortcode}`);
    }
  }, [shortcode]);

  // Since we're redirecting immediately, we don't need to render anything
  // But we can show a brief loading message
  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography>Redirecting...</Typography>
    </Container>
  );
};

export default Redirect;