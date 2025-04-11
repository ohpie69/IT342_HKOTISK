// components/OAuthSignIn.jsx
const OAuthSignIn = () => {
  return (
    <div className="oauth-login">
      <a href="http://localhost:8080/oauth2/authorization/google" className="google-btn">
        Sign in with Google
      </a><br></br>
      {/* <a href="http://localhost:8080/oauth2/authorization/microsoft" className="microsoft-btn">
        Sign in with Microsoft
      </a> */}
    </div>
  );
};

export default OAuthSignIn;
