
import logo from '../assets/componentsRes/hkotiskLogo.png';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'black'}}>
      <h1>Gutom na? Order ba!</h1>
      <a href="/auth"><img src={logo} alt="Logo" style={{marginTop:'25px', marginBottom:'25px', width: '500px', height: 'auto' , backgroundColor:'white', borderRadius: '10px'}} /><br></br>
      <h1 style={{color: 'yellow'}}>Get Started</h1></a>
    </div>
  );
};

export default LandingPage;
