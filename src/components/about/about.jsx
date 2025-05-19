import React, { useState, useEffect } from 'react';
import './about.css';
import logo from './../../imgs/Create_a_professional_logo_for_a_GIS_Chat_applicat-1747661200450.png'

// استيراد الصور (الصور الأصلية كما في الملف المرفوع)
const images = {
  team1: "https://www.xyht.com/wp-content/uploads/2023/10/34-AI-Diagram.jpg",
  team2: "https://www.esri.com/content/dam/esrisites/en-us/arcgis/capabilities/capabilities-redesign-2022/imagery-remote-sensing/imagery-update-09-22/assets/imagery-sensing-content-switcher-geoai.jpg",
  company: logo,
  technology: "https://storage.googleapis.com/gweb-research2023-media/original_images/GeospatialReasoning1_OverviewHERO.png",
  satellite: "https://s3.amazonaws.com/content.satimagingcorp.com/static/galleryimages/pleiades-neo-3-satellite-image.jpg",
  earthView: "https://www.abiresearch.com/hubfs/Imported_Blog_Media/image-20241030114703-1-1-1.jpeg",
};

const AboutPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('ar'); // افتراضي باللغة العربية
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // تحقق من التفضيلات المحفوظة
    const savedMode = localStorage.getItem('darkMode');
    const savedLang = localStorage.getItem('language');
    
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
      // التحقق من تفضيل النظام
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
    
    if (savedLang) {
      setLang(savedLang);
    }
    
    // تفعيل الحركات بعد تحميل الصفحة
    setTimeout(() => {
      setAnimated(true);
    }, 100);
  }, []);

  useEffect(() => {
    // حفظ التفضيلات في التخزين المحلي
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('language', lang);
    
    // تطبيق الوضع على العنصر الأساسي (html)
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode, lang]);

  // تبديل الوضع المظلم/الفاتح
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // تبديل اللغة
  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  // نصوص الصفحة بناءً على اللغة المختارة
  const text = {
    ar: {
      title: 'عن مشروعنا',
      subtitle: 'مشروع تخرج طلاب قسم الجيوماتكس',
      ourStory: 'فكرة المشروع',
      storyContent: 'بدأت فكرة مشروعنا عندما لاحظنا التحديات التي يواجهها الطلاب والباحثون عند التعامل مع البيانات المكانية والصور الفضائية. قررنا كفريق من طلاب السنة الرابعة في قسم الجيوماتكس بكلية الآداب إنشاء منصة سهلة الاستخدام تجمع بين تقنيات الذكاء الاصطناعي وتحليل البيانات المكانية لتسهيل استخلاص المعلومات المفيدة من هذه البيانات.',
      storyContent2: 'خلال العمل على هذا المشروع، طورنا مهاراتنا في برمجة تطبيقات الويب، ومعالجة البيانات الجغرافية، وتطبيق خوارزميات الذكاء الاصطناعي على الصور الفضائية. كفريق مكون من ستة طلاب، واجهنا العديد من التحديات وتعلمنا الكثير من الدروس القيمة خلال هذه الرحلة.',
      vision: 'هدفنا',
      visionContent: 'نهدف إلى تطوير منصة تعليمية تفاعلية تساعد الطلاب والباحثين على فهم وتحليل البيانات المكانية بسهولة ويسر، وتوفير أدوات مبسطة لاستخلاص المعلومات القيمة من الصور الفضائية وبيانات نظم المعلومات الجغرافية. يمثل هذا المشروع تتويجاً لدراستنا في قسم الجيوماتكس وتطبيقاً عملياً للمعارف التي اكتسبناها على مدار سنوات دراستنا.',
      mission: 'رسالتنا',
      missionContent: 'تقديم حل مبتكر وسهل الاستخدام يمكّن المستخدمين من تحليل البيانات المكانية واستخراج المعلومات المفيدة منها، مع التركيز على التطبيقات التعليمية والبحثية في مجال الجيوماتكس ونظم المعلومات الجغرافية.',
      values: 'قيمنا',
      valuesList: [
        {
          title: 'الابتكار والإبداع',
          description: 'نسعى دائمًا لإيجاد حلول مبتكرة للتحديات التي تواجهنا في مشروعنا.'
        },
        {
          title: 'التعاون والعمل الجماعي',
          description: 'نؤمن بأن العمل الجماعي هو أساس النجاح، ونحرص على تبادل المعرفة والخبرات بين أعضاء الفريق.'
        },
        {
          title: 'سهولة الاستخدام',
          description: 'نصمم واجهات سهلة الاستخدام حتى يتمكن المستخدمون من جميع المستويات من الاستفادة من مشروعنا.'
        },
        {
          title: 'التعلم المستمر',
          description: 'نلتزم بالتعلم المستمر وتطوير مهاراتنا في مجالات البرمجة ونظم المعلومات الجغرافية والذكاء الاصطناعي.'
        }
      ],
      team: 'فريقنا',
      teamIntro: 'نحن مجموعة من ستة طلاب في السنة الرابعة من كلية الآداب، قسم الجيوماتكس، متحمسون لتطبيق ما تعلمناه خلال دراستنا الجامعية في مشروع عملي يحل مشكلة حقيقية.',
      teamMembers: [
        {
          name: 'أحمد العتيبي',
          position: 'قائد الفريق',
          bio: 'متخصص في تطوير واجهات المستخدم وتصميم تجربة المستخدم، مهتم بتطبيقات الجيوماتكس في التخطيط الحضري.'
        },
        {
          name: 'سارة الغامدي',
          position: 'مطورة قواعد البيانات المكانية',
          bio: 'مهتمة بتصميم وإدارة قواعد البيانات المكانية، ولديها خبرة في تحليل البيانات الجغرافية.'
        },
        {
          name: 'محمد القحطاني',
          position: 'مطور خوارزميات تحليل الصور',
          bio: 'متخصص في تطبيق تقنيات الذكاء الاصطناعي والرؤية الحاسوبية على الصور الفضائية.'
        },
        {
          name: 'نورة السلمي',
          position: 'مصممة واجهات المستخدم',
          bio: 'موهوبة في تصميم واجهات المستخدم وجعل التطبيقات المعقدة سهلة الاستخدام وجذابة بصريًا.'
        },
        {
          name: 'فهد الدوسري',
          position: 'مطور نظم المعلومات الجغرافية',
          bio: 'متخصص في تطوير تطبيقات نظم المعلومات الجغرافية، ولديه خبرة في التحليل المكاني.'
        },
        {
          name: 'عبير الشهري',
          position: 'باحثة ومحللة بيانات',
          bio: 'متخصصة في تحليل البيانات وإعداد التقارير، ولديها اهتمام بالتطبيقات البيئية للجيوماتكس.'
        }
      ],
      technology: 'التقنيات المستخدمة',
      technologyIntro: 'استخدمنا في مشروعنا مجموعة من التقنيات الحديثة لتحليل البيانات المكانية:',
      technologyList: [
        'React.js لتطوير واجهة المستخدم التفاعلية',
        'ArcGIS API for JavaScript لعرض وتحليل البيانات المكانية',
        'Python مع مكتبات GeoPandas وRasterIO لمعالجة البيانات الجغرافية',
        'PostgreSQL مع امتداد PostGIS لتخزين وإدارة البيانات المكانية'
      ],
      contactUs: 'تواصل معنا',
      contactText: 'إذا كان لديك أي استفسارات أو اقتراحات حول مشروعنا، يرجى التواصل معنا عبر البريد الإلكتروني omar.eltayeb.w@gmail.com',
      joinUs: 'المشرف الأكاديمي',
      joinUsText: 'نتقدم بالشكر للدكتور محمود خضر من قسم الجيوماتكس على إرشاده ودعمه المستمر خلال مراحل تطوير المشروع.',
      theme: 'السمة:',
      light: 'فاتح',
      dark: 'داكن',
      language: 'اللغة:',
      startExploring: 'استكشف المشروع',
    },
    en: {
      title: 'About Our Project',
      subtitle: 'Graduation Project for Geomatics Students',
      ourStory: 'Project Idea',
      storyContent: 'Our project idea began when we noticed the challenges students and researchers face when dealing with spatial data and satellite imagery. As a team of fourth-year students in the Geomatics Department at the Faculty of Arts, we decided to create a user-friendly platform that combines AI techniques and spatial data analysis to facilitate extracting useful information from this data.',
      storyContent2: 'While working on this project, we developed our skills in web application programming, geographic data processing, and applying AI algorithms to satellite imagery. As a team of six students, we faced many challenges and learned valuable lessons during this journey.',
      vision: 'Our Goal',
      visionContent: 'We aim to develop an interactive educational platform that helps students and researchers understand and analyze spatial data easily, and provide simplified tools for extracting valuable information from satellite imagery and GIS data. This project represents the culmination of our studies in the Geomatics Department and a practical application of the knowledge we\'ve acquired over the years.',
      mission: 'Our Mission',
      missionContent: 'To provide an innovative and user-friendly solution that enables users to analyze spatial data and extract useful information, with a focus on educational and research applications in the field of Geomatics and Geographic Information Systems.',
      values: 'Our Values',
      valuesList: [
        {
          title: 'Innovation and Creativity',
          description: 'We always strive to find innovative solutions to the challenges we face in our project.'
        },
        {
          title: 'Collaboration and Teamwork',
          description: 'We believe that teamwork is the foundation of success, and we are keen to share knowledge and experiences among team members.'
        },
        {
          title: 'Ease of Use',
          description: 'We design user-friendly interfaces so that users of all levels can benefit from our project.'
        },
        {
          title: 'Continuous Learning',
          description: 'We are committed to continuous learning and developing our skills in programming, geographic information systems, and artificial intelligence.'
        }
      ],
      team: 'Our Team',
      teamIntro: 'We are a group of six fourth-year students from the Faculty of Arts, Geomatics Department, excited to apply what we have learned during our university studies in a practical project that solves a real problem.',
      teamMembers: [
        {
          name: 'Ahmed Al-Otaibi',
          position: 'Team Leader',
          bio: 'Specialized in UI development and user experience design, interested in Geomatics applications in urban planning.'
        },
        {
          name: 'Sarah Al-Ghamdi',
          position: 'Spatial Database Developer',
          bio: 'Interested in designing and managing spatial databases, with experience in geographical data analysis.'
        },
        {
          name: 'Mohammed Al-Qahtani',
          position: 'Image Analysis Algorithm Developer',
          bio: 'Specialized in applying AI and computer vision techniques to satellite imagery.'
        },
        {
          name: 'Noura Al-Salmi',
          position: 'UI Designer',
          bio: 'Talented in designing user interfaces and making complex applications easy to use and visually appealing.'
        },
        {
          name: 'Fahad Al-Dosari',
          position: 'GIS Developer',
          bio: 'Specialized in developing GIS applications, with experience in spatial analysis.'
        },
        {
          name: 'Abeer Al-Shehri',
          position: 'Researcher and Data Analyst',
          bio: 'Specialized in data analysis and reporting, with interest in environmental applications of Geomatics.'
        }
      ],
      technology: 'Technologies Used',
      technologyIntro: 'We used a range of modern technologies for spatial data analysis in our project:',
      technologyList: [
        'React.js for developing the interactive user interface',
        'ArcGIS API for JavaScript for displaying and analyzing spatial data',
        'Python with GeoPandas and RasterIO libraries for processing geographic data',
        'TensorFlow and PyTorch for developing AI models',
        'PostgreSQL with PostGIS extension for storing and managing spatial data'
      ],
      contactUs: 'Contact Us',
      contactText: 'If you have any questions or suggestions about our project, please contact us via email at omar.eltayeb.w@gmail.com',
      joinUs: 'Academic Supervisor',
      joinUsText: 'We would like to thank Dr. Mahmoud Khader from the Geomatics Department for his guidance and continuous support during the project development stages.',
      theme: 'Theme:',
      light: 'Light',
      dark: 'Dark',
      language: 'Language:',
      startExploring: 'Explore Project',
    }
  };

  return (
    <div className={`about-container ${darkMode ? 'dark-mode' : 'light-mode'} ${lang === 'ar' ? 'rtl' : 'ltr'} ${animated ? 'animated' : ''}`}>
      <div className="settings-bar">
        {/* زر تغيير اللغة */}
        <div className="toggle-group">
          <span>{text[lang].language}</span>
          <button 
            className="toggle-button language-toggle" 
            onClick={toggleLanguage}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
        
        {/* زر تغيير المظهر */}
        <div className="toggle-group">
          <span>{text[lang].theme}</span>
          <button 
            className={`toggle-button mode-toggle ${darkMode ? 'dark' : 'light'}`} 
            onClick={toggleDarkMode}
            aria-label={darkMode ? text[lang].light : text[lang].dark}
          >
            <span className="toggle-slider"></span>
            <span className="toggle-icon">{darkMode ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>

      <header className="about-header">
        <div className="logo-container">
          <div className="logo">GIS chat</div>
        </div>
        <h1 className="main-title">{text[lang].title}</h1>
        <p className="subtitle">{text[lang].subtitle}</p>
      </header>

      <section className="about-section story-section">
        <div className="section-content">
          <div className="text-content">
            <h2>{text[lang].ourStory}</h2>
            <p>{text[lang].storyContent}</p>
            <p>{text[lang].storyContent2}</p>
          </div>
          <div className="image-content">
            <img src={images.company} alt="Project Story" className="about-image" />
          </div>
        </div>
      </section>

      <section className="about-section vision-mission-section">
        <div className="section-content reversed">
          <div className="text-content">
            <h2>{text[lang].vision}</h2>
            <p>{text[lang].visionContent}</p>
            <h2>{text[lang].mission}</h2>
            <p>{text[lang].missionContent}</p>
          </div>
          <div className="image-content">
            <img src={images.satellite} alt="Project Vision" className="about-image" />
          </div>
        </div>
      </section>

      <section className="about-section values-section">
        <h2 className="section-title">{text[lang].values}</h2>
        <div className="values-grid">
          {text[lang].valuesList.map((value, index) => (
            <div className="value-card" key={index}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section team-section">
        <h2 className="section-title">{text[lang].team}</h2>
        <p className="team-intro">{text[lang].teamIntro}</p>
        
        <div className="team-grid">
          {text[lang].teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <div className="team-image-container">
                <img 
                  src={index % 2 === 0 ? images.team1 : images.team2} 
                  alt={member.name} 
                  className="team-image" 
                />
              </div>
              <div className="team-info">
                <h3>{member.name}</h3>
                <h4>{member.position}</h4>
                <p>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section technology-section">
        <div className="section-content">
          <div className="text-content">
            <h2>{text[lang].technology}</h2>
            <p>{text[lang].technologyIntro}</p>
            <ul className="technology-list">
              {text[lang].technologyList.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
          <div className="image-content">
            <img src={images.technology} alt="Project Technology" className="about-image" />
          </div>
        </div>
      </section>

      <section className="contact-join-section">
        <div className="contact-join-grid">
          <div className="contact-join-card">
            <h2>{text[lang].contactUs}</h2>
            <p>{text[lang].contactText}</p>
          </div>
          
          <div className="contact-join-card">
            <h2>{text[lang].joinUs}</h2>
            <p>{text[lang].joinUsText}</p>
            <button className="about-cta-button">{text[lang].startExploring}</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>GIS chat</span>
            <p>© 2025 Geomatics Student Project. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;