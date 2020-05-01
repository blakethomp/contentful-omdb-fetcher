import React, { Component } from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import { Heading, Note, Form, TextField, Textarea } from '@contentful/forma-36-react-components';

init(sdk => {
  const Component = sdk.location.is(locations.LOCATION_APP_CONFIG) ? Config : ObjectField;

  render(<Component sdk={sdk} />, document.getElementById('root'));
  sdk.window.startAutoResizer();
});

class Config extends Component {
  constructor (props) {
    super(props);
    this.state = { parameters: {} };
    this.app = this.props.sdk.app;
    this.app.onConfigure(() => this.onConfigure());
  }
  
  async componentDidMount () {
    const parameters = await this.app.getParameters();
    this.setState(
      { parameters: parameters || {} },
      () => this.app.setReady()
    );
  }
  
  render () {
    return (
      <Form id="app-config">
        <Heading>OMDB Configuration</Heading>
        <Note noteType="primary" title="About the app">
          Enter your OMDB API key.
        </Note>
        <TextField
          required
          name="omdb-api-key"
          id="omdb-api-key"
          labelText="OMDB API Key"
          value={this.state.parameters.omdbApiKey || null}
          onChange={e => this.setState({ parameters: { omdbApiKey: e.target.value } })}
        >
        </TextField>
      </Form>
    );
  }

  async onConfigure () {
    return {
      parameters: this.state.parameters
    };
  }
}

function ObjectField ({ sdk }) {
  let data = sdk.field.getValue();
  console.log(data);
  console.log(sdk.entry.fields['imdb']);
  if (!data) {
    data = getMovie('tt8368406', sdk)
  }
  
  return (
    <Textarea
      value={data}
      readonly
    />
  )
}

async function getMovie(imdbId, sdk) {
  const apiKey = sdk.parameters.installation.omdbApiKey || null;
  if (apiKey) {
    try {
      const response = await fetch(`https://www.omdbapi.com?apikey=${apiKey}&id=${imdbId}`);
      console.log(response.body.url);
      console.log(response.body.explanation);
      return response;
    } catch (error) {
      console.log(error.response.body);
      return error.response.body;
    }
  }
  return '';
}