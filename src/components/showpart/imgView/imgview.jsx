import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './imgview.css';

function ImgView() {
  const [imageUrl, setImageUrl] = useState(null);
  const transformComponentRef = useState(null); // مرجع للتحكم في التكبير

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      alert('يرجى اختيار صورة بصيغة JPEG أو PNG!');
      setImageUrl(null);
    }
  };

  const resetZoom = () => {
    if (transformComponentRef.current) {
      const { resetTransform } = transformComponentRef.current;
      resetTransform(); // إعادة الصورة إلى الحجم الافتراضي ومركزتها
    }
  };

  // تحرير العنوان المؤقت عند تغيير الصورة
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className='container'>
      <div className='controls'>
        <input
          type='file'
          accept='image/jpeg,image/png'
          onChange={handleImageChange}
        />
        <button onClick={resetZoom} disabled={!imageUrl}>
          إعادة التصغير
        </button>
      </div>

      <div className='imgview-border'>
        {imageUrl ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={10}
            centerOnInit={true}
            centerZoomedOut={true}
            ref={transformComponentRef}
          >
            <TransformComponent>
              <img src={imageUrl} alt='Uploaded' />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <p>لم يتم اختيار صورة</p>
        )}
      </div>
    </div>
  );
}

export default ImgView;