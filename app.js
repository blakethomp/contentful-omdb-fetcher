import React from 'react';
import ReactDOM from 'react-dom';

import { init, locations } from 'contentful-ui-extensions-sdk';

import '@contentful/forma-36-fcss/dist/styles.css'
import '@contentful/forma-36-react-components/dist/styles.css'


import { Button } from '@contentful/forma-36-react-components';

const root = document.getElementById('root');

const HelloWorld = () => <Button buttonType="primary" onClick={() => alert('test')}>Hello world!</Button>;

ReactDOM.render(<HelloWorld />, root);
