import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './about.css';
import logo from './../../imgs/Create_a_professional_logo_for_a_GIS_Chat_applicat-1747661200450.png';
// استيراد الصور الخاصة بالفريق
import omarAbdullahImg from './../../imgs/me.png';
import badriImg from './../../imgs/me.png';
import abdelrahmanImg from './../../imgs/me.png';
import omarKhaledImg from './../../imgs/me.png';
import bolaImg from './../../imgs/me.png';
import omarMohammedImg from './../../imgs/me.png';

// استيراد الصور الأخرى
const images = {
  company: logo,
  technology: "https://storage.googleapis.com/gweb-research2023-media/original_images/GeospatialReasoning1_OverviewHERO.png",
  satellite: "https://s3.amazonaws.com/content.satimagingcorp.com/static/galleryimages/pleiades-neo-3-satellite-image.jpg",
  earthView: "https://www.abiresearch.com/hubfs/Imported_Blog_Media/image-20241030114703-1-1-1.jpeg",
};

const AboutPage = () => {
  // استخدام Context للغة والمود
  const { lang } = useLanguage();
  const { isDark } = useTheme();

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
          name: 'عمر عبدالله',
          position: 'قائد الفريق و مطور واجهات أمامية و خلفية',
          bio: 'متخصص في تطوير واجهات المستخدم وتصميم تجربة المستخدم، مهتم بتطبيقات الجيوماتكس في التخطيط الحضري.'
        },
        {
          name: 'بدري علي',
          position: 'مطور قواعد البيانات',
          bio: 'مهتم بتصميم وإدارة قواعد البيانات، ولديها خبرة في تحليل البيانات الجغرافية.'
        },
        {
          name: 'عبدالرحمن إمبابي',
          position: 'مطور خوارزميات تحليل الصور',
          bio: 'متخصص في تطبيق تقنيات الذكاء الاصطناعي والرؤية الحاسوبية على الصور الفضائية.'
        },
        {
          name: 'عمر خالد',
          position: 'مصمم واجهات خلفية',
          bio: 'مصمم واجهة خلفية و مهتم بمجال نظم المعلومات الجغرافية'
        },
        {
          name: 'بولا حربي',
          position: 'مطور نظم المعلومات الجغرافية',
          bio: 'متخصص في تطوير تطبيقات نظم المعلومات الجغرافية، ولديه خبرة في التحليل المكاني.'
        },
        {
          name: 'عمر محمد',
          position: 'باحث ومحلل بيانات جغرافية',
          bio: 'متخصصة في تحليل البيانات وإعداد التقارير، ولديها اهتمام بالتطبيقات البيئية للجيوماتكس.'
        }
      ],
      technology: 'التقنيات المستخدمة',
      technologyIntro: 'استخدمنا في مشروعنا مجموعة من التقنيات الحديثة لتحليل البيانات المكانية:',
      technologyList: [
        'React.js لتطوير واجهة المستخدم التفاعلية',
        'ArcGIS API for JavaScript لعرض وتحليل البيانات المكانية',
        'Python مع مكتبات GeoPandas وRasterIO لمعالجة البيانات الجغرافية',
        'TensorFlow وPyTorch لتطوير نماذج الذكاء الاصطناعي',
        'PostgreSQL مع امتداد PostGIS لتخزين وإدارة البيانات المكانية'
      ],
      contactUs: 'تواصل معنا',
      contactText: 'إذا كان لديك أي استفسارات أو اقتراحات حول مشروعنا، يرجى التواصل معنا عبر البريد الإلكتروني omar.eltayeb.w@gmail.com',
      joinUs: 'المشرف الأكاديمي',
      joinUsText: 'نتقدم بالشكر للدكتور محمود خضر من قسم الجيوماتكس على إرشاده ودعمه المستمر خلال مراحل تطوير المشروع.',
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
          name: 'Omar Abdullah',
          position: 'Team Leader and Front-End/Back-End Developer',
          bio: 'Specialized in user interface development and user experience design, interested in Geomatics applications in urban planning.'
        },
        {
          name: 'Badri Ali',
          position: 'Database Developer',
          bio: 'Interested in designing and managing databases, with experience in geographic data analysis.'
        },
        {
          name: 'Abdelrahman Imbaby',
          position: 'Image Analysis Algorithm Developer',
          bio: 'Specialized in applying AI and computer vision techniques to satellite imagery.'
        },
        {
          name: 'Omar Khaled',
          position: 'Back-End Interface Designer',
          bio: 'Back-end interface designer, interested in the field of Geographic Information Systems.'
        },
        {
          name: 'Bola Harbi',
          position: 'GIS Developer',
          bio: 'Specialized in developing Geographic Information Systems applications, with experience in spatial analysis.'
        },
        {
          name: 'Omar Mohammed',
          position: 'Researcher and Geographic Data Analyst',
          bio: 'Specialized in data analysis and report preparation, with an interest in environmental applications of Geomatics.'
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
      startExploring: 'Explore Project',
    }
  };

  return (
    <div className={`about-container ${lang}`} data-theme={isDark ? 'dark' : 'light'}>
      <header className="about-header">
        <div className="logo-container">
          {/* <img src={logo} alt="GIS Chat Logo" className="header-logo" /> */}
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
            <img src={images.company} alt={text[lang].ourStory} className="about-image" />
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
            <img src={images.satellite} alt={text[lang].vision} className="about-image" />
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
                  src={
                    index === 0 ? omarAbdullahImg :
                    index === 1 ? badriImg :
                    index === 2 ? abdelrahmanImg :
                    index === 3 ? omarKhaledImg :
                    index === 4 ? bolaImg :
                    omarMohammedImg
                  } 
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
            <img src={images.technology} alt={text[lang].technology} className="about-image" />
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
            <span>GIS Chat</span>
            <p>© 2025 Geomatics Student Project. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;