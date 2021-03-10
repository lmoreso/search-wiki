# SearchWiki

SearchWiki es un componente React escrito en Typescript, que es capaz de lanzar una consulta a cualquier Wiki (como Wikipedia), extraer un extracto del artículo(s) encontrado(s) (primeras frases y foto principal) y mostrarlos en el navegador.

## Table of Contents

- [Usage](#usage)
- [Implementation](#implementation)
  - [IExtractWikiProps interface](#IExtractWikiProps-interface)
  - [IWikiExtractPageImage interface](#IWikiExtractPageImage-interface)
  - [IWikiExtractPage interface](#IWikiExtractPage-interface)
  - [ExtractWiki async function](#ExtractWiki-async-function)
  - [panelOrientations enum](#panelOrientations-enum)
  - [ISearchWikiProps interface](#ISearchWikiProps-interface)

## Usage

```bash
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
```

## Implementation

### IExtractWikiProps interface

Objeto para la llamada a la Wiki:

| Name                   | Type        | Default Value |  Description  |
| -----------------------| ----------- | ------------- | ------------- |
| textToSearch _(required)_ | `string`  |  | Texto a buscar en la  Wiki.  |
| rootUrl                   | `string`  |  [https://es.wikipedia.org](https://es.wikipedia.org) | URL de la Wiki. |  
| numPagesToSearch          | `number`  | 1 | Nº de artículos a recuperar. |
| plainText                 | `boolean` | true | Si quieres la Respuesta en HTML o Texto Plano; Wikipedia desaconseja solicitar html. |
| numChars                  | `number`  | 300 | Nº de caracteres a recuperar. Es incompatible con la propiedad 'numSentences', sobre la cual tiene preferencia. |
| numSentences              | `number`  | 0 | Nº de sentencias o frases a recuperar. Es incompatible con la propiedad 'numChars' la cual tiene preferencia sobre esta. |
| imageSize                 | `number`  | 250 | Tamaño de la imagen. [Consulta la API de wikimedia para saber mas sobre este parámetro](https://www.mediawiki.org/wiki/API:Search). |
| debugMode                 | `boolean` | false | Vuelca trazas en la consola, como la URL final y los resultados de la llamada al API.  |

Los valores por defecto están disponibles en la constante EXTRACT_WIKI_DEFAULTS.

### IWikiExtractPageImage interface

Objeto con los resultados de la llamada a la Wiki relativos a la imágen descargada:

| Name                   | Type        | Required |  Description  |
| -----------------------| ----------- | ------------- | ------------- |
| url | `string`  | _Yes_ | Url de la imágen.  |
| width | `string`  | _Yes_ | Width de la imágen.  |
| height | `string`  | _Yes_ | Height de la imágen.  |

### IWikiExtractPage interface

Objeto con los resultados de la llamada a la Wiki.

| Name                   | Type        | Required |  Description  |
| -----------------------| ----------- | ------------- | ------------- |
| pageId | `string`  | _Yes_ | Id. de la página de Wikipedia. |
| index | `number`  | _Yes_ | Cuando se solicita mas de una página, refleja la relevancia del resultado. La ocurrencia mas parecida al texto buscado viene con index = 1.  |
| textOrHtml | `string`  | _Yes_ | Extracto del artículo devuelto por la API. Puede ser HTML si así se pidió en la llamada. |
| title | `string`  | _Yes_ | Título del artículo o página encontrado.  |
| link | `string`  | _Yes_ | Link para llamar a la página (es la URL raiz mas el título de la página o artículo)  |
| image | [`IWikiExtractPageImage`](#iwikiextractpageimage-interface)  | _No_ | Imagen devuelta. Puede ser undefined, ya que no todos los artículos o páginas devuelven una Foto principal. |

### ExtractWiki async function

Recupera el extracto de uno o mas artículos de Wikipedia:

- Parámetros:
  - props: [`IExtractWikiProps`](#IExtractWikiProps-interface): Objeto que sólo requiere el texto a buscar 'textToSearch'.
  - abortSignal: AbortSignal?: Aconsejable si se usa esta funcionalidad desde un Tooltip, por ejemplo, para evitar errores en la consola.
- Retorna:
  - Promise<IWikiExtractPage[]>: Promesa de un array de IWikiExtractPage.

- Usos:
  - Uso con `await`:

  ```bash
  let result: Array<IWikiExtractPage> = await ExtractWiki({textToSearch: 'Belgrado'} );
  ```

  - Uso con `.then`:

  ```bash
  ExtractWiki({textToSearch: 'Belgrado'} )
      .then((res: Array<IWikiExtractPage>) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error;
      });
  ```

### panelOrientations enum

Orientación del Panel resultado:

```bash
export enum panelOrientations { landscape, portrait, auto }
```

- landscape: Foto a la izquierda, texto a la derecha.
- portrait: Foto arriba, texto abajo.
- auto: en función del tamaño de la imágen:
  - landscape si la foto es mas alta que ancha.
  - portrait si la foto es mas ancha que alta.

### ISearchWikiProps interface

Hereda de [`IWikiExtractPage`](#iwikiextractpage-interface), a la que añade las siguientes `props` visuales:

| Name                   | Type        | Default Value |  Description  |
| -----------------------| ----------- | ------------- | ------------- |
| fixedSize  | `number`  | 250 | Tamaño del panel: se aplica al Alto o Ancho del panel en función de la orientación.  |
| panelOrientation  | [`panelOrientations`](#panelOrientations-enum)  | `landscape` | Orientación del panel.  |
| rootStyle   | `React.CSSProperties`  |  | Estilo a aplicar en el contenedor principal. |
| textLinkWiki  | `string`  |  | Si se informa, se pinta este texto debajo del extracto, como enlace a la página de la Wikipedia, con icono de Wikipedia incluido. |
| onWikiError  | `(textErr: string) => void`  |  | Callback que se invocará si la consulta a wikipedia devuelve un error. Si no se proporciona se muestra el texto del error en el panel resultado. Es útil si en vez de mostrar el error se quiere, por ejemplo, cerrar otro componente como un Panel o un Modal. |
