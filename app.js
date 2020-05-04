import React, { Component, useState, useEffect } from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import { Heading, Note, Form, TextField, Textarea, Button } from '@contentful/forma-36-react-components';

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
    fetchMovie(sdk);
  }, [sdk]);
  
  const validateAndSave = debounce(function(data) {
    console.log(data, 'validateAndSave data');
    console.log(isValidJson(data), 'validateAndSave valid');
    if (data === '') {
      sdk.field.setInvalid(false);
      sdk.field.removeValue();
    } else if (isValidJson(data)) {
      const val = typeof data === 'string' ? JSON.parse(data) : data;
      sdk.field.setInvalid(false);
      sdk.field.setValue(val);
    } else {
      sdk.field.setInvalid(true)
    }
  }, 150);
  
  async function fetchMovie(sdk) {      
    const apiKey = sdk.parameters.installation.omdbApiKey || null;
    const imdbUrl = sdk.entry.fields['imdb'].getValue();
    const fieldData = sdk.field.getValue();
    const input = document.getElementById('omdbData');
    console.log(sdk.field);
    if (!fieldData && imdbUrl) {
      const [url, imdbId] = imdbUrl.match(/imdb\.com\/title\/(tt[^/]*)/);
      if (imdbId) {
        const data = await getMovie(apiKey, imdbId);
        if (typeof data === 'object' && data.Response.toLowerCase() === 'true') {
          validateAndSave(data);
          input.value = JSON.stringify(data);
        } else {
          sdk.notifier.error(`Error fetching data. ${data.Error || ''}`);
        }
      }
    }
  }
  
  return (
    <>
      <Textarea
        name="omdbData"
        id="omdbData"
        value={JSON.stringify(sdk.field.getValue())}
        readOnly={false}
        onChange={e => validateAndSave(e.target.value)}
      />
      <Button
        buttonType="primary"
        onClick={() => {
          this.loading = true;
          fetchMovie();
        }}
        text="Fetch Movie Data"
      />
    </>
  )
}

async function getMovie(apiKey, imdbId) {
  if (apiKey && imdbId) {
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return error;
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
  // An object or array is valid JSON
  if (typeof str === 'object') {
     return true;
  }
  
  try {
     const parsed = JSON.parse(str)
  } catch (e) {
     return false;
  }
  
  return true;
};