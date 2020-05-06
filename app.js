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
  
  const input = document.getElementById('omdbData');
  console.log(input);
  if (input) {
      console.log('change change change');
    
    input.addEventListener('input', () => {
      console.log('change change change');
    });
  }    
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
  console.log('object field');
  const [buttonLoadingValue, buttonSetLoading] = useState(false);
  const apiKey = sdk.parameters.installation.omdbApiKey || null;
  const imdbUrl = sdk.entry.fields['imdb'].getValue();
  const fieldData = sdk.field.getValue();
  
  useEffect(() => {
    if (!fieldData && imdbUrl) {
      updateOmdbField(imdbUrl, apiKey);
    }    
  }, [imdbUrl]);
  
  useEffect(() => {
    const fieldValueChanged = sdk.field.onValueChanged(value => {
      console.log('what');
      const input = document.getElementById('omdbData');
      if (input) {
        if (typeof value === 'undefined') {
          input.value = '';
        } else {
          input.value = typeof value === 'object' ? JSON.stringify(value) : value;
        }
      }    
    });

    const imdbValueChanged = sdk.entry.fields['imdb'].onValueChanged(value => {
      if (value && value !== imdbUrl && !fieldData) {
        updateOmdbField(value, apiKey);
      }
    });
    
    return () => {
      fieldValueChanged();
      imdbValueChanged();
    }
  }, [imdbUrl]);
  
  const validateAndSave = debounce((data) => {
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
  
  async function updateOmdbField(imdbValue, apiKey) {  
    if (!imdbValue) {
      return;
    }
    const matches = imdbValue.match(/imdb\.com\/title\/(tt[^/]*)/);
    if (matches) {
      const data = await getMovie(apiKey, matches[1]);
      if (typeof data === 'object' && data.Response.toLowerCase() === 'true') {
        validateAndSave(data);
      } else {
        sdk.notifier.error(`Error fetching data. ${data.Error || ''}`);
      }
    }
  }
  
  return (
    <>
      <Textarea
        name="omdbData"
        id="omdbData"
        value={JSON.stringify(fieldData)}
        readOnly={false}
        onChange={e => validateAndSave(e.target.value)}
      />
      <Button
        buttonType="primary"
        onClick={async () => {
          const apiKey = sdk.parameters.installation.omdbApiKey || null;
          const imdbUrl = sdk.entry.fields['imdb'].getValue();
          buttonSetLoading(true);
          await updateOmdbField(imdbUrl, apiKey);
          buttonSetLoading(false);
        }}
        disabled={buttonLoadingValue}
        loading={buttonLoadingValue}
      >
        Fetch Movie
      </Button>
      <Button
        buttonType="negative"
        onClick={() => {
          validateAndSave('');
        }}
      >
        Clear Field
      </Button>
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