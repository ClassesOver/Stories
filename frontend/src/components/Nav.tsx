import React, { useContext, useState , useEffect} from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import Search from './Search';
import AuthButton from './AuthButton';
import SignupButton from './SignUpButton';
import AppContext from '../context';
let greetingTimer : NodeJS.Timer | null; 
export default () => {
  const {isAuthenticated} = useContext(AppContext);
  const [greeting, setGreeting] = useState('');
  const sayGreeting = () => {
      let now = new Date();
      let  hour = now.getHours();
      if (hour < 12) {
          setGreeting('Good morning')
      } else if (hour < 18) {
          setGreeting('Good afternoon')
      } else {
          setGreeting('Good evening')
      }
      
  }
  useEffect(() => {
      sayGreeting();
  }, [])
  if (greetingTimer) {
      clearInterval(greetingTimer);
  }
  greetingTimer = setInterval(() => {
      sayGreeting();
  }, 1000 * 3600);
  return <Navbar id="tm-navbar" variant="dark"  sticky="top" expand="sm"  >
    <Navbar.Brand className="tm-nav-brand" as={Link} to="/">
        <span>I'm troubled</span>
        <span className="greeting">
            {greeting}
        </span>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="tm-nav">
        <Nav.Link className="tm-nav-link" as={Link} to="/expore" >Expore</Nav.Link>
        {isAuthenticated ? <Nav.Link className="tm-nav-link" as={Link} to="/expore/me/stories" >Stories</Nav.Link>: ''}
      </Nav>
      <Search className="tm-search" placeholder="Search" />
      <AuthButton />
      <SignupButton />
    </Navbar.Collapse>
  </Navbar>
}