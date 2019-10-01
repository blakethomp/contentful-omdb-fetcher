import React from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';

import { Note } from '@contentful/forma-36-react-components';

init(sdk => {
  const root = document.getElementById('root');
  
  if (sdk.location.is(locations.LOCATION_APP)) {
    render(<AppConfig sdk={sdk} />, root);
  }
  
  if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    render(<AppSidebar sdk={sdk} />, root);
  }
});

class AppConfig extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      parameters: { animal: 'cat', size: '500' },
      ready: false
    };
  }
  
  async componentDidMount () {
    const { app } = this.sdk.platformAlpha;

    app.onConfigure(this.onConfigure.bind(this));
    
    this.setState({
      parameters: await app.getParameters(),
      ready: true
    });    
  }
  
  render () {
    if (!this.state.ready) {
      return null
    }
    
    return (
      <Typography>
        <Heading>Unsplash app</Heading>
      </Typography>
    );
  }
  
  onConfigure () {
    
  }
}

class AppSidebar extends React.Component {
  
}
