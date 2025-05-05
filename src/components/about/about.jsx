// about.jsx - Professionally redesigned

import React from 'react';
import { motion } from 'framer-motion';
import './about.css';

function About() {
  return (
    <motion.div 
      className="about-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="about-header">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          About GeoVision
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="about-subtitle"
        >
          Our mission is to make geospatial data processing accessible to everyone
        </motion.p>
      </div>

      <div className="about-content">
        <motion.div 
          className="about-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h2>Our Vision</h2>
          <p>
            GeoVision is dedicated to revolutionizing how professionals interact with geospatial data. 
            By leveraging modern web technologies, we've created a platform that eliminates the need 
            for complex server setups and proprietary software, putting the power of GIS directly 
            in your browser.
          </p>
          <p>
            Our client-side processing approach ensures your data remains secure while providing 
            the performance and flexibility needed for professional geospatial analysis.
          </p>
        </motion.div>

        <motion.div 
          className="about-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Client-Side Processing</h3>
              <p>All data processing happens in your browser, eliminating server dependencies</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Multilingual Support</h3>
              <p>Use our platform in your preferred language with our comprehensive localization</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>High Performance</h3>
              <p>Optimized code ensures smooth performance even with large datasets</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Data Privacy</h3>
              <p>Your data never leaves your computer, ensuring maximum security</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="about-section technologies"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <h2>Technologies</h2>
          <p>
            Our platform is built using the latest web technologies to ensure optimal performance and user experience:
          </p>
          <div className="tech-stack">
            <div className="tech-item">
              <span className="tech-logo">⚛️</span>
              <span className="tech-name">React</span>
            </div>
            <div className="tech-item">
              <span className="tech-logo">🍃</span>
              <span className="tech-name">Leaflet</span>
            </div>
            <div className="tech-item">
              <span className="tech-logo">🗺️</span>
              <span className="tech-name">Turf.js</span>
            </div>
            <div className="tech-item">
              <span className="tech-logo">📊</span>
              <span className="tech-name">GeoRaster</span>
            </div>
            <div className="tech-item">
              <span className="tech-logo">📁</span>
              <span className="tech-name">ShpJS</span>
            </div>
            <div className="tech-item">
              <span className="tech-logo">🎭</span>
              <span className="tech-name">Framer Motion</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="about-section contact"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h2>Contact Us</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you. Reach out to our team 
            to learn more about our platform or to discuss your specific GIS needs.
          </p>
          <motion.button 
            className="contact-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get in Touch
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default About;