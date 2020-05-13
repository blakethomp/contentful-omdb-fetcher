import React, { Component, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
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

Config.propTypes = {
  sdk: PropTypes.object
};

function ObjectField ({ sdk }) {
  const [buttonLoadingValue, buttonSetLoading] = useState(false);
  const [omdbValue, omdbSetState] = useState(sdk.field.getValue());
  const [imdbFieldValue, imdbSetState] = useState(sdk.entry.fields['imdb'].getValue());
  const omdbField = sdk.field;
  const imdbField = sdk.entry.fields['imdb'];
  const inputEl = useRef();

  useEffect(() => {
    const imdbValueChanged = imdbField.onValueChanged(value => {
      imdbSetState(value);
    });

    return () => {
      imdbValueChanged();
    }
  }, [imdbField]);
  
  useEffect(() => {
    updateOmdbField(imdbFieldValue);
  }, [imdbFieldValue, updateOmdbField])

  useEffect(() => {
    const omdbValueChanged = omdbField.onValueChanged(value => {
      omdbSetState(value);
    });

    return () => {
      omdbValueChanged();
    }
  }, [omdbField]);

  const validateAndSave = debounce((data) => {
    omdbSetState(data);
    if (!data) {
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

  const updateOmdbField = useCallback(async (imdbValue) => {
    if (!imdbValue) {
      return;
    }
    const apiKey = sdk.parameters.installation.omdbApiKey || null;
    const matches = imdbValue.match(/imdb\.com\/title\/(tt[^/]*)/);
    if (matches) {
      const data = await getMovie(apiKey, matches[1]);
      if (typeof data === 'object' && data.Response.toLowerCase() === 'true') {
        validateAndSave(data);
      } else {
        sdk.notifier.error(`Error fetching data. ${data.Error || ''}`);
      }
    }
    
    return;
  }, [validateAndSave, sdk.parameters.installation.omdbApiKey, sdk.notifier]);

  return (
    <>
      <Textarea
        name="omdbData"
        id="omdbData"
        value={omdbValue ? JSON.stringify(omdbValue) : ''}
        readOnly={true}
        onChange={e => validateAndSave(e.target.value)}
        textareaRef={inputEl}
      />
      <Button
        buttonType="primary"
        onClick={async () => {
          const imdbUrl = sdk.entry.fields['imdb'].getValue();
          buttonSetLoading(true);
          await updateOmdbField(imdbUrl);
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
          sdk.field.removeValue();
        }}
      >
        Clear Field
      </Button>
    </>
  )
}

ObjectField.propTypes = {
  sdk: PropTypes.object
};

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
     JSON.parse(str)
  } catch (e) {
     return false;
  }

  return true;
};
