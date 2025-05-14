import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../common/Header';
import './About.css';

const About = () => {
  const { language } = useLanguage();

  const content = {
    ar: {
      title: 'من نحن',
      description: 'نحن فريق متخصص في نظم المعلومات الجغرافية (GIS) نقدم حلولاً مبتكرة في مجال رسم الخرائط وتحليل البيانات المكانية.',
      features: [
        {
          title: 'تحليل البيانات',
          description: 'نقدم أدوات متقدمة لتحليل البيانات المكانية واتخاذ القرارات المدروسة.'
        },
        {
          title: 'رسم الخرائط',
          description: 'نقوم بإنشاء خرائط تفاعلية دقيقة وعالية الجودة.'
        },
        {
          title: 'حلول مخصصة',
          description: 'نطور حلولاً مخصصة تناسب احتياجات عملائنا المختلفة.'
        }
      ]
    },
    en: {
      title: 'About Us',
      description: 'We are a team of GIS specialists providing innovative solutions in mapping and spatial data analysis.',
      features: [
        {
          title: 'Data Analysis',
          description: 'We provide advanced tools for spatial data analysis and informed decision-making.'
        },
        {
          title: 'Mapping',
          description: 'We create accurate, high-quality interactive maps.'
        },
        {
          title: 'Custom Solutions',
          description: 'We develop tailored solutions to meet our clients\' diverse needs.'
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="about-page">
      <Header />
      <div className="about-content">
        <div className="about-hero">
          <h1>{currentContent.title}</h1>
          <p>{currentContent.description}</p>
        </div>
        <div className="features-grid">
          {currentContent.features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <i className={`fas fa-${getFeatureIcon(index)}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getFeatureIcon = (index) => {
  const icons = ['chart-line', 'map-marked-alt', 'cogs'];
  return icons[index];
};

export default About; 