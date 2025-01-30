import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div>
      <h1>You are not authorized to access this page.</h1>
      <li>
        <Link to="/">Please go to logIn</Link>
      </li>
    </div>
  );
};

export default Unauthorized;
