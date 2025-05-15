import React, { useState, useEffect } from 'react';
import './welcomeScreen.css';
import { useLanguage } from './../../context/LanguageContext';
import { useTheme } from './../../context/ThemeContext';

// استيراد الصور
const images = {
  satelliteAnalysis: "https://www.esri.com/content/dam/esrisites/en-us/arcgis/capabilities/capabilities-redesign-2022/imagery-remote-sensing/imagery-update-09-22/assets/imagery-sensing-analysis-banner-fg.png",
  vectorAnalysis: "https://mfarooqui.com/wp-content/uploads/2023/03/AI-in-GIS-Vector-Data-Automation_TinyPNG.png",
  aiProcessing: "https://www.esri.com/content/dam/esrisites/en-us/arcgis/capabilities/capabilities-redesign-2022/imagery-remote-sensing/imagery-update-09-22/assets/imagery-sensing-content-switcher-geoai.jpg",
  dataVisualization: "https://www.xyht.com/wp-content/uploads/2023/10/34-AI-Diagram.jpg",
  satImagery: "https://s3.amazonaws.com/content.satimagingcorp.com/static/galleryimages/pleiades-neo-3-satellite-image.jpg",
};

const HomePage = () => {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // تفعيل الحركات بعد تحميل الصفحة
    setTimeout(() => {
      setAnimated(true);
    }, 100);
  }, []);

  // نصوص الموقع بناءً على اللغة المختارة
  const text = {
    ar: {
      title: 'GIS Chat',
      subtitle: 'تحليل الصور الفضائية وملفات الفيكتور والراستر باستخدام الذكاء الاصطناعي',
      description: 'منصة متطورة تجمع بين قوة الذكاء الاصطناعي وتقنيات نظم المعلومات الجغرافية لتحليل البيانات المكانية بكفاءة عالية ودقة متناهية.',
      whatWeOffer: 'ماذا يقدم GIS Chat؟',
      features: {
        satelliteAnalysis: {
          title: 'تحليل الصور الفضائية',
          description: 'استخراج البيانات والمعلومات القيمة من الصور الفضائية عالية الدقة باستخدام خوارزميات الذكاء الاصطناعي المتطورة.'
        },
        vectorAnalysis: {
          title: 'معالجة ملفات الفيكتور',
          description: 'تحليل وتحسين بيانات الفيكتور الجغرافية مع دعم كامل لمختلف الصيغ واستخراج الأنماط المكانية.'
        },
        rasterAnalysis: {
          title: 'تحليل بيانات الراستر',
          description: 'معالجة صور الراستر بتقنيات متقدمة للكشف عن التغيرات والتنبؤ بالاتجاهات المستقبلية للظواهر الجغرافية.'
        },
        ai: {
          title: 'الذكاء الاصطناعي',
          description: 'استخدام أحدث تقنيات التعلم العميق والتعلم الآلي لاستخلاص المعلومات وتفسير البيانات المكانية بدقة عالية.'
        },
        dataVisualization: {
          title: 'تصور البيانات',
          description: 'عرض النتائج بطريقة سهلة الفهم مع رسوم بيانية تفاعلية وخرائط حرارية توضح العلاقات المكانية.'
        },
        cloudSolutions: {
          title: 'حلول سحابية',
          description: 'الوصول إلى قوة المعالجة العالية من أي مكان دون الحاجة لأجهزة متطورة، مع تخزين آمن للبيانات.'
        }
      },
      whyNeedUs: 'لماذا قد تحتاج GIS Chat؟',
      userGroups: {
        researchers: {
          title: 'للباحثين والأكاديميين',
          items: [
            'تحليل التغيرات البيئية على مدى فترات زمنية',
            'دراسة التوسع العمراني وتأثيره على البيئة',
            'رصد الظواهر الطبيعية ومراقبة تغيراتها',
            'تحديد أنماط استخدام الأراضي'
          ]
        },
        government: {
          title: 'للمؤسسات الحكومية',
          items: [
            'التخطيط العمراني والحضري المستدام',
            'إدارة الموارد الطبيعية والبنية التحتية',
            'الاستجابة للكوارث وإدارة الأزمات',
            'مراقبة المناطق الحدودية والأمن القومي'
          ]
        },
        agriculture: {
          title: 'للقطاع الزراعي',
          items: [
            'مراقبة صحة المحاصيل وتقدير الإنتاج',
            'تحديد مناطق الجفاف والتصحر',
            'تحسين إدارة الري واستخدام المياه',
            'تخطيط استخدام الأراضي الزراعية'
          ]
        },
        companies: {
          title: 'للشركات والمؤسسات',
          items: [
            'تحليل السوق والتوزيع الجغرافي للعملاء',
            'اختيار المواقع المثالية للمشاريع التجارية',
            'تحسين سلاسل التوريد واللوجستيات',
            'دراسة تأثير المشاريع على البيئة المحيطة'
          ]
        }
      },
      callToAction: 'ابدأ رحلتك مع GIS Chat الآن',
      startNow: 'استكشف المنصة'
    },
    en: {
      title: 'GIS Chat',
      subtitle: 'Satellite Imagery, Vector & Raster Files Analysis Using Artificial Intelligence',
      description: 'An advanced platform that combines the power of artificial intelligence and GIS technologies to analyze spatial data with high efficiency and precision.',
      whatWeOffer: 'What does GIS Chat offer?',
      features: {
        satelliteAnalysis: {
          title: 'Satellite Imagery Analysis',
          description: 'Extract valuable data and information from high-resolution satellite images using advanced AI algorithms.'
        },
        vectorAnalysis: {
          title: 'Vector File Processing',
          description: 'Analyze and enhance geographic vector data with full support for various formats and spatial pattern extraction.'
        },
        rasterAnalysis: {
          title: 'Raster Data Analysis',
          description: 'Process raster images with advanced techniques to detect changes and predict future trends of geographic phenomena.'
        },
        ai: {
          title: 'Artificial Intelligence',
          description: 'Use the latest deep learning and machine learning techniques to extract information and interpret spatial data with high accuracy.'
        },
        dataVisualization: {
          title: 'Data Visualization',
          description: 'Present results in an easy-to-understand way with interactive graphics and heat maps showing spatial relationships.'
        },
        cloudSolutions: {
          title: 'Cloud Solutions',
          description: 'Access high processing power from anywhere without the need for advanced hardware, with secure data storage.'
        }
      },
      whyNeedUs: 'Why might you need GIS Chat?',
      userGroups: {
        researchers: {
          title: 'For Researchers and Academics',
          items: [
            'Analyze environmental changes over time periods',
            'Study urban expansion and its impact on the environment',
            'Monitor natural phenomena and track their changes',
            'Identify land use patterns'
          ]
        },
        government: {
          title: 'For Government Institutions',
          items: [
            'Sustainable urban planning',
            'Management of natural resources and infrastructure',
            'Disaster response and crisis management',
            'Monitoring border areas and national security'
          ]
        },
        agriculture: {
          title: 'For the Agricultural Sector',
          items: [
            'Monitor crop health and estimate production',
            'Identify drought and desertification areas',
            'Improve irrigation management and water use',
            'Plan agricultural land use'
          ]
        },
        companies: {
          title: 'For Companies and Institutions',
          items: [
            'Market analysis and geographic distribution of customers',
            'Selecting optimal locations for commercial projects',
            'Improving supply chains and logistics',
            'Studying the impact of projects on the surrounding environment'
          ]
        }
      },
      callToAction: 'Start your journey with GIS Chat now',
      startNow: 'Explore the Platform'
    }
  };

  return (
    <div className={`home-container ${isDark ? 'dark-mode' : 'light-mode'} ${lang === 'ar' ? 'rtl' : 'ltr'} ${animated ? 'animated' : ''}`}>
      <header className="home-header">
        <div id='filler'></div>
        <h1 className="main-title">{text[lang].title}</h1>
        <h2 className="subtitle">{text[lang].subtitle}</h2>
        <p className="description">{text[lang].description}</p>
      </header>

      <section className="features-section">
        <h2 className="section-title">{text[lang].whatWeOffer}</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image-container">
              <img src={images.satelliteAnalysis} alt="تحليل الصور الفضائية" className="feature-image" />
            </div>
            <h3>{text[lang].features.satelliteAnalysis.title}</h3>
            <p>{text[lang].features.satelliteAnalysis.description}</p>
          </div>

          <div className="feature-card">
            <div className="feature-image-container">
              <img src={images.vectorAnalysis} alt="معالجة ملفات الفيكتور" className="feature-image" />
            </div>
            <h3>{text[lang].features.vectorAnalysis.title}</h3>
            <p>{text[lang].features.vectorAnalysis.description}</p>
          </div>

          <div className="feature-card">
            <div className="feature-image-container">
              <img src={images.satImagery} alt="تحليل بيانات الراستر" className="feature-image" />
            </div>
            <h3>{text[lang].features.rasterAnalysis.title}</h3>
            <p>{text[lang].features.rasterAnalysis.description}</p>
          </div>

          <div className="feature-card">
            <div className="feature-image-container">
              <img src={images.aiProcessing} alt="الذكاء الاصطناعي" className="feature-image" />
            </div>
            <h3>{text[lang].features.ai.title}</h3>
            <p>{text[lang].features.ai.description}</p>
          </div>

          <div className="feature-card">
            <div className="feature-image-container">
              <img src={images.dataVisualization} alt="تصور البيانات" className="feature-image" />
            </div>
            <h3>{text[lang].features.dataVisualization.title}</h3>
            <p>{text[lang].features.dataVisualization.description}</p>
          </div>

          <div className="feature-card">
            <div className="feature-image-container">
              <img src="https://storage.googleapis.com/gweb-research2023-media/original_images/GeospatialReasoning1_OverviewHERO.png" alt="حلول سحابية" className="feature-image" />
            </div>
            <h3>{text[lang].features.cloudSolutions.title}</h3>
            <p>{text[lang].features.cloudSolutions.description}</p>
          </div>
        </div>
      </section>

      <section className="use-cases-section">
        <h2 className="section-title">{text[lang].whyNeedUs}</h2>

        <div className="use-cases-grid">
          <div className="use-case-card">
            <h3>{text[lang].userGroups.researchers.title}</h3>
            <ul>
              {text[lang].userGroups.researchers.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="use-case-card">
            <h3>{text[lang].userGroups.government.title}</h3>
            <ul>
              {text[lang].userGroups.government.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="use-case-card">
            <h3>{text[lang].userGroups.agriculture.title}</h3>
            <ul>
              {text[lang].userGroups.agriculture.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="use-case-card">
            <h3>{text[lang].userGroups.companies.title}</h3>
            <ul>
              {text[lang].userGroups.companies.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>GIS Chat</span>
            <p>© 2025 GIS Chat. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;