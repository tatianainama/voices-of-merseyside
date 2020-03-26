import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import App from './App';
import './App.css';

export const AppRouting = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <App></App>
          </Route>
          <Route path="/admin">
            <div>
              <h1>Admin time</h1>
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default AppRouting;