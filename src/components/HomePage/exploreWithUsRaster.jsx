import './exploreWithUsRaster.css'
import rasterImg from'./../../imgs/rasterImg.png'
function ExploreWithUsRaster(){
    return(
        <div className="component3">
            <div className='textContainer'>
                <h1 className='titleOfSection3'>Explore raster features</h1>    
                <p className='supTitleOfSection3'>Process your raster data</p>   
            </div>
            <img className="rasterImg"src={rasterImg} alt="" />
        </div>
    )
}
export default ExploreWithUsRaster