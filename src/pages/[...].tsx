import React from 'react';
import { Router } from '@reach/router';

const Test = () => <div>Test</div>;

const App = () => (
  <Router basepath="/">
    <Test path="profile" />
  </Router>
);
// eslint-disable-next-line import/no-default-export
export default App;
