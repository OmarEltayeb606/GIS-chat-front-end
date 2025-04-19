const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const admZip = require('adm-zip');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'src/components/server/Uploads/' });

app.use(cors({
  origin: 'http://localhost:3000',
}));

// إعدادات GeoServer
const GEOSERVER_URL = 'http://localhost:8080/geoserver/rest';
const GEOSERVER_USER = 'admin';
const GEOSERVER_PASS = 'geoserver';
const WORKSPACE = 'my_raster_workspace';

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error('لم يتم رفع أي ملفات');
    }

    const layerNames = [];
    let responseType = '';
    let geojsonData = null;

    for (const file of req.files) {
      const filePath = file.path;
      const fileName = file.originalname.replace(/\.[^/.]+$/, '');
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.tif' || ext === '.tiff') {
        responseType = 'geotiff';
        const storeName = `raster_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        console.log(`جارٍ إنشاء المخزن: ${storeName}`);

        const createStoreUrl = `${GEOSERVER_URL}/workspaces/${WORKSPACE}/coveragestores`;
        const storeXml = `
          <coverageStore>
            <name>${storeName}</name>
            <workspace>${WORKSPACE}</workspace>
            <enabled>true</enabled>
            <type>GeoTIFF</type>
          </coverageStore>
        `;

        const createResponse = await axios({
          method: 'POST',
          url: createStoreUrl,
          data: storeXml,
          auth: { username: GEOSERVER_USER, password: GEOSERVER_PASS },
          headers: { 'Content-Type': 'text/xml' },
        });

        if (createResponse.status !== 201) {
          throw new Error(`فشل إنشاء المخزن: Status ${createResponse.status}, ${createResponse.data}`);
        }

        console.log(`تم إنشاء المخزن: ${storeName}`);

        const uploadUrl = `${GEOSERVER_URL}/workspaces/${WORKSPACE}/coveragestores/${storeName}/file.geotiff?configure=all`;
        const fileContent = fs.readFileSync(filePath);

        const uploadResponse = await axios({
          method: 'PUT',
          url: uploadUrl,
          data: fileContent,
          auth: { username: GEOSERVER_USER, password: GEOSERVER_PASS },
          headers: { 'Content-Type': 'image/tiff' },
        });

        if (uploadResponse.status !== 200 && uploadResponse.status !== 201) {
          throw new Error(`فشل رفع الملف: Status ${uploadResponse.status}, ${uploadResponse.data}`);
        }

        console.log(`تم رفع الملف: ${fileName}`);
        layerNames.push(storeName);
      } else if (ext === '.shp') {
        responseType = 'shapefile';

        const relatedFiles = req.files.filter(f => f.originalname.startsWith(fileName));
        if (!relatedFiles.some(f => f.originalname.endsWith('.shx')) ||
            !relatedFiles.some(f => f.originalname.endsWith('.dbf'))) {
          throw new Error('ملفات Shapefile غير مكتملة: يجب رفع .shp و.shx و.dbf');
        }

        // استخراج الملفات إلى مجلد مؤقت
        const tempDir = path.join(__dirname, 'uploads', `temp_${Date.now()}`);
        fs.mkdirSync(tempDir);
        relatedFiles.forEach(f => {
          const destPath = path.join(tempDir, f.originalname);
          fs.copyFileSync(f.path, destPath);
        });

        const shpPath = path.join(tempDir, `${fileName}.shp`);
        const geojsonPath = path.join(tempDir, `${fileName}.json`);

        // تحويل Shapefile إلى GeoJSON باستخدام ogr2ogr مع نظام إحداثيات افتراضي
        await new Promise((resolve, reject) => {
          exec(`ogr2ogr -f GeoJSON -t_srs EPSG:4326 -s_srs EPSG:4326 -skipfailures ${geojsonPath} ${shpPath}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`فشل التحويل باستخدام ogr2ogr: ${stderr}`);
              // محاولة تحميل بدون تحويل إذا فشل
              geojsonData = { type: 'FeatureCollection', features: [] };
              resolve();
              return;
            }
            console.log(`تم تحويل ${fileName} إلى GeoJSON`);
            geojsonData = JSON.parse(fs.readFileSync(geojsonPath));
            resolve();
          });
        });

        if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
          console.warn('GeoJSON فارغ أو غير صالح، سيتم إرجاع مجموعة فارغة');
          geojsonData = { type: 'FeatureCollection', features: [] };
        }

        // إنشاء DataStore في GeoServer (اختياري)
        const storeName = `shp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const createStoreUrl = `${GEOSERVER_URL}/workspaces/${WORKSPACE}/datastores`;
        const zip = new admZip();
        relatedFiles.forEach(f => {
          zip.addLocalFile(path.join(tempDir, f.originalname));
        });
        const zipPath = path.join(tempDir, `${fileName}.zip`);
        zip.writeZip(zipPath);

        const storeXml = `
          <dataStore>
            <name>${storeName}</name>
            <workspace>${WORKSPACE}</workspace>
            <enabled>true</enabled>
            <connectionParameters>
              <entry key="url">file://${zipPath}</entry>
              <entry key="filetype">shapefile</entry>
            </connectionParameters>
          </dataStore>
        `;

        const createResponse = await axios({
          method: 'POST',
          url: createStoreUrl,
          data: storeXml,
          auth: { username: GEOSERVER_USER, password: GEOSERVER_PASS },
          headers: { 'Content-Type': 'text/xml' },
        });

        if (createResponse.status !== 201) {
          console.warn('فشل إنشاء DataStore، لكن GeoJSON جاهز');
        } else {
          console.log(`تم إنشاء DataStore: ${storeName}`);
          layerNames.push(storeName);
        }

        // تنظيف الملفات المؤقتة
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    res.json({ success: true, type: responseType, wmsUrl: responseType === 'geotiff' ? `${GEOSERVER_URL.replace('/rest', '')}/${WORKSPACE}/wms` : undefined, layerName: layerNames, geojson: geojsonData });
  } catch (error) {
    const errorMessage = error.response
      ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
      : error.message;
    console.error('خطأ أثناء الرفع:', errorMessage);
    res.status(500).json({ success: false, message: errorMessage });
  } finally {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});