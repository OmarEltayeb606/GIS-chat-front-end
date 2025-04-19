import WelcomeScreen from './welcomeScreen'
import ExploreWithUsVector from './exploreWithUsVector.jsx';
import ExploreWithUsRaster from './exploreWithUsRaster';
function Home(){
    return (
        <div >
            <WelcomeScreen/>
            <ExploreWithUsVector/>
            <ExploreWithUsRaster/>
        </div>
    )
}
export default Home;