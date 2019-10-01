import React from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';

import { Typography, Heading, Note, Form, SelectField, Option } from '@contentful/forma-36-react-components';

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
      parameters: { animal: 'cat' },
      ready: false
    };
  }
  
  async componentDidMount () {
    const { app } = this.props.sdk.platformAlpha;

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
        <Heading>Daily Animal app</Heading>
        <Note noteType="primary" title="About the app">
          Make life of your editors a little bit better with a cute animal picture in the entry editor sidebar.
        </Note>
        <Form>
          <SelectField
            required
            name="animal-selection"
            id="animal-selection"
            labelText="Animal"
            helpText="Pick the best kind of animal!"
            value={this.state.parameters.animal}
            onChange={e => this.setState({ parameters: { animal: e.target.value } })}
          >
            <Option value="cat">Cat</Option>
            <Option value="dog">Dog</Option>
            <Option value="owl">Owl</Option>
          </SelectField>
        </Form>
        <pre>{JSON.stringify(this.state, null ,2)}</pre>
      </Typography>
    );
  }
  
  onConfigure () {
    const contentTypes = this.props.sdk.space.getContentTypes()
    console.log(contentTypes)
    return {
      parameters: this.state.parameters,
      targetState: {
        EditorInterface: {}
      }
    };
  }
}

function AppSidebar () {
  const animal = sdk.parameters.inanimal || 
        
  return <img src={`https://source.unsplash.com/300/300/?${animal}`} />
}
