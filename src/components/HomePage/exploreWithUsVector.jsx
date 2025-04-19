import './exploreWithUs.css'
import vectorImg from'./../../imgs/img-for-vector-data.jpg'
function ExploreWithUsVector(){
    return(
        <div className="component2">
            <img className='vectorImg' src={vectorImg} alt="vectorImg" />
            <div className='textContainer'>
            <h1 className="titleOfSection2">Explore with us</h1>
            <p className='supTitleOfSection2'>Analyzing your Victor data</p>
            </div>
        </div>
    )
}

export default ExploreWithUsVector