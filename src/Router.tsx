import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { ClosureNotice } from './App';
import Admin from './Admin';
import ConsentInformation from './Consent';
import MoreInfo from './MoreInfo';
import Heatmap from './Heatmap';
import './App.css';

export const AppRouting = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <ClosureNotice></ClosureNotice>
          </Route>
          <Route path="/admin/heatmap">
            <Heatmap
            ></Heatmap>
          </Route>
          <Route path="/admin">
            <Admin></Admin>
          </Route>
          <Route path="/terms">
            <ConsentInformation/>
          </Route>
          <Route path="/more">
            <MoreInfo/>
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default AppRouting;