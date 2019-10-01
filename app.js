import React from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';

import { Note } from '@contentful/forma-36-react-components';

const root = document.getElementById('root');


init(sdk => {
  if (sdk.location.is(locations.LOCATION_AP)) {
    render(<AppConfig sdk={sdk} />, root);
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    render(<AppSidebar sdk={sdk} />, root);
  }
})

class AppConfig extends React.Component {
  
  async componentDidMount () {
    const parameters = await this.sdk.platformAlpha.app.getParameters();
    
    this.setState({ parameters })
  }
  
  onConfigure () {
    
  }
  
}

class AppSidebar extends React.Component {
  
}
