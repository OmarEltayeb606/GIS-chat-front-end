import streamlit as st
import geopandas as gpd
import rasterio
from rasterio.warp import transform_bounds
import folium
from streamlit_folium import st_folium
import os
import zipfile
import io
from pyproj import Transformer
import shapely.geometry

# إعداد واجهة Streamlit
st.title("عرض بيانات Raster وVector")
st.write("قم برفع ملفات SHP (مع DBF، SHX، واختياريًا PRJ) أو TIFF لعرضها على الخريطة.")

# رفع الملفات
uploaded_files = st.file_uploader("اختر الملفات", accept_multiple_files=True, type=['shp', 'dbf', 'shx', 'prj', 'tif', 'tiff'])

# تخزين الملفات المرفوعة مؤقتًا
if uploaded_files:
    file_groups = {}
    for uploaded_file in uploaded_files:
        file_name = uploaded_file.name
        base_name, ext = os.path.splitext(file_name)
        ext = ext.lower()[1:]  # إزالة النقطة
        if base_name not in file_groups:
            file_groups[base_name] = {}
        file_groups[base_name][ext] = uploaded_file

    # إنشاء الخريطة
    m = folium.Map(location=[24.7136, 46.6753], zoom_start=10, tiles="OpenStreetMap")

    # معالجة كل مجموعة ملفات
    for base_name, group in file_groups.items():
        try:
            if 'shp' in group and 'dbf' in group:
                # معالجة Vector (SHP)
                with open(f"temp_{base_name}.shp", "wb") as f:
                    f.write(group['shp'].read())
                with open(f"temp_{base_name}.dbf", "wb") as f:
                    f.write(group['dbf'].read())
                if 'shx' in group:
                    with open(f"temp_{base_name}.shx", "wb") as f:
                        f.write(group['shx'].read())
                if 'prj' in group:
                    with open(f"temp_{base_name}.prj", "wb") as f:
                        f.write(group['prj'].read())

                # قراءة ملف SHP باستخدام GeoPandas
                gdf = gpd.read_file(f"temp_{base_name}.shp")

                # إعادة الإسقاط إلى EPSG:4326 إذا كان هناك PRJ
                if 'prj' in group and gdf.crs:
                    transformer = Transformer.from_crs(gdf.crs, "EPSG:4326", always_xy=True)
                    gdf['geometry'] = gdf['geometry'].apply(
                        lambda geom: shapely.geometry.mapping(
                            shapely.geometry.shape(geom).map_coordinates(
                                lambda x, y: transformer.transform(x, y)
                            )
                        )
                    )
                    gdf = gpd.GeoDataFrame(gdf, geometry=gpd.GeoSeries.from_wkb(gdf['geometry']))
                elif not gdf.crs:
                    # افتراض EPSG:4326 إذا لم يكن هناك PRJ
                    gdf.set_crs("EPSG:4326", inplace=True)

                # تحويل إلى GeoJSON وإضافتها إلى الخريطة
                geojson = gdf.__geo_interface__
                folium.GeoJson(
                    geojson,
                    name=base_name,
                    style_function=lambda x: {
                        'fillColor': 'orange',
                        'color': 'black',
                        'weight': 2,
                        'fillOpacity': 0.5,
                    }
                ).add_to(m)

                # تنظيف الملفات المؤقتة
                for ext in ['shp', 'dbf', 'shx', 'prj']:
                    temp_file = f"temp_{base_name}.{ext}"
                    if os.path.exists(temp_file):
                        os.remove(temp_file)

            elif 'tif' in group or 'tiff' in group:
                # معالجة Raster (TIFF)
                tiff_file = group['tif'] if 'tif' in group else group['tiff']
                with open(f"temp_{base_name}.tif", "wb") as f:
                    f.write(tiff_file.read())

                # قراءة ملف TIFF
                with rasterio.open(f"temp_{base_name}.tif") as src:
                    bounds = src.bounds
                    crs = src.crs if src.crs else "EPSG:4326"
                    # تحويل الحدود إلى EPSG:4326
                    bounds_4326 = transform_bounds(crs, "EPSG:4326", *bounds) if crs != "EPSG:4326" else bounds
                    # إنشاء صورة للعرض
                    img = src.read([1])  # قراءة القناة الأولى فقط
                    img = (img - img.min()) / (img.max() - img.min()) * 255  # تطبيع القيم
                    img = img.astype('uint8')

                # تحويل الصورة إلى base64 لعرضها في Folium
                from PIL import Image
                import base64
                img_pil = Image.fromarray(img)
                buffered = io.BytesIO()
                img_pil.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()

                # إضافة طبقة Raster إلى الخريطة
                folium.raster_layers.ImageOverlay(
                    image=f"data:image/png;base64,{img_str}",
                    bounds=[[bounds_4326[1], bounds_4326[0]], [bounds_4326[3], bounds_4326[2]]],
                    opacity=0.6,
                    name=base_name
                ).add_to(m)

                # تنظيف الملف المؤقت
                os.remove(f"temp_{base_name}.tif")

        except Exception as e:
            st.error(f"خطأ في معالجة {base_name}: {str(e)}")

    # إضافة التحكم في الطبقات
    folium.LayerControl().add_to(m)

    # عرض الخريطة
    st_folium(m, width=700, height=500)