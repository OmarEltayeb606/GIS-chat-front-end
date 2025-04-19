import './navbar.css'
function Navbar (){
    return (
        <div className='barContainer'>
<ul className='bar'>
    <li ><a className='bar-link' href='/'>Home</a></li>
    <li ><a className='bar-link' href='/mapView'>Map view</a></li>
    <li ><a className='bar-link' href='/imgView'>Img view</a></li>
    <li ><a className='bar-link' href='/ai'>AI</a></li>
    <li ><a className='bar-link' href='/about'>About</a></li>
</ul>
</div>
    )
}
export default Navbar