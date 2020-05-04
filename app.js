import React, { Component, useState, useEffect } from 'react';
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
  const [movieData, setValue] = useState(null);

  useEffect(() => {
    async function fetchMovie() {      
      const apiKey = sdk.parameters.installation.omdbApiKey || null;
      
      if (apiKey) {
        try {
          const response = await fetch(`https://www.omdbapi.com?apikey=${apiKey}&i=${imdbId}`);
          console.log(response.body);
          const data = await response.json();
          console.log(data, 'data')
          sdk.field.setValue(data);
        } catch (error) {
          console.log(error.response.body);
        }
      }
    }
    fetchMovie();
  }, [sdk]);
  
  let data = sdk.field.getValue();
  console.log(data);
  console.log(sdk.entry.fields['imdb']);
  if (!data || Object.keys(data).length === 0) {
    getMovie('tt8368406', sdk)
  }
  
  const validateAndSave = debounce(function(str) {
    console.log(str, 'str');
    if (str === '') {
      sdk.field.setInvalid(false);
      sdk.field.removeValue();
    } else if (isValidJson(str)) {
      const val = JSON.parse(str);
      sdk.field.setInvalid(false);
      sdk.field.setValue(val);
    } else {
      sdk.field.setInvalid(true)
    }
  }, 150);
  
  return (
    <Textarea
      value={JSON.stringify(data)}
      readOnly={false}
      onChange={e => {validateAndSave(e.target.value)}}
    />
  )
}

async function getMovie(imdbId, sdk) {
  const apiKey = sdk.parameters.installation.omdbApiKey || null;
  if (apiKey) {
    try {
      const response = await fetch(`https://www.omdbapi.com?apikey=${apiKey}&i=${imdbId}`);
      console.log(response.body);
      const data = await response.json();
      console.log(data, 'data')
      sdk.field.setValue(data);
    } catch (error) {
      console.log(error.response.body);
    }
  }
}

// http://davidwalsh.name/javascript-debounce-function
const debounce = (func, wait, immediate) => {
   let timeout;
   return function() {
     const context = this, args = arguments;
     const later = function() {
       timeout = null;
       if (!immediate) func.apply(context, args);
     };
     const callNow = immediate && !timeout;
     clearTimeout(timeout);
     timeout = setTimeout(later, wait);
     if (callNow) func.apply(context, args);
   };
};

const isValidJson = str => {
  let parsed;
  try {
     parsed = JSON.parse(str)
  } catch (e) {
     return false;
  }
  // An object or array is valid JSON
  if (typeof parsed !== 'object') {
     return false;
  }
  return true;
};