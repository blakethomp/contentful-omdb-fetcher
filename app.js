import React from 'react';
import { render } from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import { Spinner, Heading, Note, Form, SelectField, Option } from '@contentful/forma-36-react-components';

const DEFAULT_ANIMAL = 'cat';

init(sdk => {
  const Component = sdk.location.is(locations.LOCATION_APP) ? Config : AnimalPicture;
  render(<Component sdk={sdk} />, document.getElementById('root'));
});

class Config extends React.Component {
  constructor (props) {
    super(props);
    this.state = { parameters: {} };
    this.app = this.props.sdk.platformAlpha.app;
  }
  
  async componentDidMount () {
    this.app.onConfigure(() => this.onConfigure());
    this.setState({ parameters: await this.app.getParameters() });
  }
  
  render () {
    return (
      <Form>
        <Heading>Daily Animal app</Heading>
        <Note noteType="primary" title="About the app">
          Make editors in this space a little bit happier with a cute animal picture in the entry editor sidebar.
        </Note>
        <SelectField
          required
          name="animal-selection"
          id="animal-selection"
          labelText="Animal"
          value={this.state.parameters.animal || DEFAULT_ANIMAL}
          onChange={e => this.setState({ parameters: { animal: e.target.value } })}
        >
          <Option value={DEFAULT_ANIMAL}>Cat</Option>
          <Option value="dog">Dog</Option>
          <Option value="owl">Owl</Option>
        </SelectField>
      </Form>
    );
  }
  
  async onConfigure () {
    const { items: contentTypes } = await this.props.sdk.space.getContentTypes()
    const contentTypeIds = contentTypes.map(ct => ct.sys.id)

    return {
      parameters: this.state.parameters,
      targetState: {
        EditorInterface: {}
      }
    };
  }
}

function AnimalPicture ({ sdk }) {
  const animal = sdk.parameters.installation.animal || DEFAULT_ANIMAL;
        
  return <img src={`https://source.unsplash.com/300/300/?${animal}`} />
}
