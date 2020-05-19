import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import App, { ClosureNotice } from './App';
import Admin from './Admin';
import ConsentInformation from './Consent';
import MoreInfo from './MoreInfo';
import Heatmap from './Heatmap';
import './App.css';
import results from './results.json';

export const AppRouting = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <ClosureNotice></ClosureNotice>
          </Route>
          <Route sensitive path="/admin">
            <Admin></Admin>
          </Route>
          <Route path="/heatmap">
            <Heatmap
              data={results}
            ></Heatmap>
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