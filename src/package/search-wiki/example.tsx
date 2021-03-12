import * as React from 'react';
import { SearchWiki } from 'search-wiki//SearchWiki';
import { panelOrientations } from 'search-wiki//SearchWikiProps';

export const Example: React.FunctionComponent = () => {
  let styleSW: React.CSSProperties = { border: '1px solid gray', boxShadow: '5px 5px 5px gray', margin: '10px', }
  let styleLabel: React.CSSProperties = { margin: '10px 0 0 0', fontSize: 'medium', fontWeight: 'bolder', }
  let styleRoot: React.CSSProperties = { padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', }
  return (
    <div style={styleRoot}>
      <label style={styleLabel}>Con parámetros por defecto</label>
      <SearchWiki
        textToSearch='Belgrado'
        rootStyle={styleSW}
      />
      <label style={styleLabel}>2 Páginas en Vertical en Inglés</label>
      <SearchWiki
        textToSearch='Picasso'
        rootUrl='https://en.wikipedia.org'
        fixedSize={200}
        numChars={150}
        numPagesToSearch={2}
        imageSize={150}
        panelOrientation={panelOrientations.portrait}
        textLinkWiki='Go to Wikipedia'
        rootStyle={styleSW}
      />
    </div>
  );
};
