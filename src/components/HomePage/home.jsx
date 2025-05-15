// home.jsx - Professionally redesigned

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import HomePage from './welcomeScreen';
// import ExploreWithUsVector from './exploreWithUsVector';
// import ExploreWithUsRaster from './exploreWithUsRaster';
import './home.css';

function Home() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="home-container">
      <HomePage />
      
      {/* <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="explore-sections"
      >
        <motion.div variants={childVariants} className="section-wrapper">
          <ExploreWithUsVector />
        </motion.div>
        
        <motion.div variants={childVariants} className="section-wrapper">
          <ExploreWithUsRaster />
        </motion.div>
        
        <motion.div variants={childVariants} className="cta-section">
          <h2>Ready to Transform Your Geospatial Data?</h2>
          <p>Our platform provides the tools you need to analyze, visualize, and extract insights from your geographic data.</p>
          <div className="cta-buttons">
            <motion.button 
              className="cta-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try It Now
            </motion.button>
            <motion.button 
              className="cta-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </motion.div> */}
    </section>
  );
}

export default Home;