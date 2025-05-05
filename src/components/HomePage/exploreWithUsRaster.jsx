// exploreWithUsRaster.jsx - Professionally redesigned

import React from 'react';
import { motion } from 'framer-motion';
import rasterImg from './../../imgs/rasterImg.png';
import './exploreWithUsRaster.css';

function ExploreWithUsRaster() {
  return (
    <motion.div 
      className="explore-section raster-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="explore-content">
        <motion.div 
          className="explore-text"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h2 className="section-title">Explore Raster Features</h2>
          <p className="section-description">
            Unlock the power of raster data analysis directly in your browser. Our platform 
            enables efficient processing and visualization of GeoTIFF and other raster formats
            without relying on external services.
          </p>
          
          <ul className="feature-list">
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span className="feature-icon">✓</span>
              <span>Load and process GeoTIFF files</span>
            </motion.li>
            
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <span className="feature-icon">✓</span>
              <span>Advanced visualization with customizable renderers</span>
            </motion.li>
            
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <span className="feature-icon">✓</span>
              <span>Interactive pixel value inspection</span>
            </motion.li>
            
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <span className="feature-icon">✓</span>
              <span>Client-side raster operations and analysis</span>
            </motion.li>
          </ul>
          
          <motion.button 
            className="explore-button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Raster Tools
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="explore-image-container"
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <img className="raster-img" src={rasterImg} alt="Raster data visualization" />
          <div className="image-filter-effect"></div>
          <div className="data-points">
            <div className="data-point" style={{ top: '30%', left: '40%' }}></div>
            <div className="data-point" style={{ top: '50%', left: '60%' }}></div>
            <div className="data-point" style={{ top: '70%', left: '30%' }}></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ExploreWithUsRaster;