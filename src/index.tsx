import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {SearchWikiExample} from './SearchWikiExample';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <SearchWikiExample />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
