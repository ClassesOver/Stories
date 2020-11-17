import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import Search from './Search'
import AuthButton from './AuthButton'
import AppContext from '../context';

export default () => {
  const {authenticated, setAuthenticated, isAuthenticated} = useContext(AppContext);
  return <Navbar id="tm-navbar" variant="dark"  sticky="top" expand="sm"  >
    <Navbar.Brand className="tm-nav-brand" as={Link} to="/">I'm troubled</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="tm-nav">
        <Nav.Link className="tm-nav-link" as={Link} to="/expore" >Expore</Nav.Link>
        {isAuthenticated ? <Nav.Link className="tm-nav-link" as={Link} to="/expore/me/stories" >Stories</Nav.Link>: ''}
        <Nav.Link className="tm-nav-link" target="black" href="http://resume.troubled-me.com" >Hire me</Nav.Link>
      </Nav>
      <Search className="tm-search" placeholder="Search" />
      <AuthButton />
    </Navbar.Collapse>
  </Navbar>
}