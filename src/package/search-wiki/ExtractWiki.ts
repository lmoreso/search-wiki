/**
 * Versión del API ExtractWiki  
 */
export const EXTRACT_WIKI_VERSION: string = '0.1.4';

/**
 * props para la llamada a ExtractWiki.
 * - Sólo es obligatorio el texto a buscar, aunque puede estar vacío.
 * - El resto de parámetros, si no se proporcionan, cogen el valor de @EXTRACT_WIKI_DEFAULTS.  
 */
export interface IExtractWikiProps {
    /** Texto a buscar en la Wiki. */
    textToSearch: string;
    /** URL de la Wiki (por defecto 'https://es.wikipedia.org'). */
    rootUrl?: string;
    /** Nº de artículos a recuperar (por defecto 1).*/
    numPagesToSearch?: number;
    /** 
     * - Por defecto se solicita a la Wiki texto plano (true).
     * - La misma Wikipedia desaconseja solicitar html (false).
     */
    plainText?: boolean;
    /** 
     * Nº de caracteres a recuperar. 
     * - Es incompatible con la propiedad 'numSentences', sobre la cual tiene preferencia.
     * - El valor por defecto es 300. 
     */
    numChars?: number;
    /** 
     * Nº de sentencias o frases a recuperar. 
     * - Es incompatible con la propiedad 'numChars' la cual tiene preferencia sobre esta.
     * - El valor por defecto es 0. 
     */
    numSentences?: number,
    /** 
     * Tamaño de la imagen.
     * - Valor por defecto 250.
     * - [Consulta la API de wikimedia para saber mas sobre este parámetro](https://www.mediawiki.org/wiki/API:Search).
     */
    imageSize?: number,
    /** 
     * Vuelca trazas en la consola, como la URL final y los resultados de la llamada al API. 
     * 
     */
    debugMode?: boolean
}


/** 
 * Valores por defecto para la llamada a ExtractWiki:
 * - textToSearch: 'Belgrado', 
 * - rootUrl: 'https://es.wikipedia.org',
 * - numPagesToSearch: 1,
 * - plainText: true,
 * - numChars: 300,
 * - numSentences: 0,
 * - imageSize: 250
 */
export const EXTRACT_WIKI_DEFAULTS: IExtractWikiProps = {
    textToSearch: 'Belgrado', //'Guernica, pintura de Picasso',
    rootUrl: 'https://es.wikipedia.org',
    numPagesToSearch: 1,
    plainText: true,
    numChars: 300,
    numSentences: 0,
    imageSize: 250,
    debugMode: false,
}

/** 
 * Objeto con los resultados de la llamada a la Wiki relativos a la imágen descargada.
 */
export interface IWikiExtractPageImage {
    /** Url de la imágen. */
    url: string;
    /** width de la imágen. */
    width: number;
    /** height de la imágen. */
    height: number;
}

/** 
 * Objeto con los resultados de la llamada a la Wiki.
 */
export interface IWikiExtractPage {
    /** Id. de la página devuelto por la API. */
    pageId: string;
    /** Cuando se solicita mas de una página, refleja la relevancia del resultado. La ocurrencia mas parecida al texto buscado viene con index = 1. */
    index: number;
    /** Extracto del artículo devuelto por la API. */
    textOrHtml: string;
    /** Título del artículo o página encontrado. */
    title: string;
    /** Link para llamar a la página (es la URL raiz mas el título de la página o artículo). */
    link: string;
    /** Imagen devuelta. Puede ser undefined, ya que no todos los artículos o páginas devuelven una Foto principal. */
    image?: IWikiExtractPageImage;
}

/**
 * Recupera el extracto de uno o mas artículos de Wikipedia
 * @param props (IExtractWikiProps): Objeto que sólo requiere el texto a buscar 'textToSearch' (ver EXTRACT_WIKI_DEFAULTS).
 * @param abortSignal (AbortSignal?): Aconsejable si se usa esta funcionalidad desde un Tooltip, por ejemplo, para evitar errores en la consola.
 * @return Promise<IWikiExtractPage[]>: Promesa de un array de IWikiExtractPage.
 */
export async function ExtractWiki(props: IExtractWikiProps, abortSignal?: AbortSignal): Promise<IWikiExtractPage[]> {
    let parWiki = {
        ...props
    };
    if (!props.rootUrl)
        parWiki.rootUrl = EXTRACT_WIKI_DEFAULTS.rootUrl;
    if (!props.numPagesToSearch)
        parWiki.numPagesToSearch = EXTRACT_WIKI_DEFAULTS.numPagesToSearch;
    if (!props.imageSize || props.imageSize <= 50)
        parWiki.imageSize = EXTRACT_WIKI_DEFAULTS.imageSize;
    if (props.plainText == undefined)
        parWiki.plainText = EXTRACT_WIKI_DEFAULTS.plainText;

    if (props.debugMode) {
        console.log('* ExtractWiki props');
        console.log(parWiki);
    }

    if (!props.textToSearch || props.textToSearch.length <= 0) {
        let textError = 'No text to search Wikipedia provided.';
        console.log(textError);
        return (Promise.reject(textError));
    } else {
        // Componer la query
        let queryUrl =
            // URL de la wiki
            `${parWiki.rootUrl}/w/api.php?action=query&generator=search`
            // Nº de páginas a extraer 
            + `&gsrlimit=${parWiki.numPagesToSearch}`
            // Buscar títulos parecidos, no título exacto
            + `&gsrsearch=${parWiki.textToSearch}`
            // Pedimos extracto y foto principal, así como el formato de salida: 
            + `&prop=extracts|pageimages&format=json`
            // Tamaño de la imagen 
            + `&exintro=&pithumbsize=${parWiki.imageSize}`

        // Nº de caracteres o nº de frases a recuperar.
        if (parWiki.numChars && parWiki.numChars > 0)
            queryUrl += `&exchars=${parWiki.numChars}`;
        else if (parWiki.numSentences && parWiki.numSentences > 0)
            queryUrl += `&exsentences=${parWiki.numSentences}`;
        else
            queryUrl += `&exchars=${EXTRACT_WIKI_DEFAULTS.numChars}`;

        // Texto Plano o HTML
        if (parWiki.plainText)
            queryUrl += `&explaintext=`;

        // Evitar error de dominio cruzado
        queryUrl += `&origin=*`;

        if (props.debugMode) {
            console.log('* Query URL:');
            console.log(queryUrl);
        }

        // Realizar la Query
        let restResponse;
        try {
            restResponse = await fetch(queryUrl, { signal: abortSignal });
        } catch (error) {
            let textError = `The call to Wikipedia returned an error: ${error}`;
            console.log(textError);
            if (!props.debugMode && !(error instanceof DOMException)) {
                console.log('* ExtractWiki props');
                console.log(parWiki);
                console.log('* Query URL:');
                console.log(queryUrl);
            }
            return (Promise.reject(textError));
        }

        if (props.debugMode) {
            console.log('* Fetch Response');
            console.log(restResponse);
        }

        // Procesar la respuesta
        let dataWiki: any;
        try {
            dataWiki = await restResponse.json();
            if (props.debugMode) {
                console.log('* Response');
                console.log(dataWiki);
            }
        } catch (error) {
            let textError = `The call to Wikipedia returned an invalid Object: ${error}`;
            console.log(textError);
            if (!props.debugMode) {
                console.log('* ExtractWiki props');
                console.log(parWiki);
                console.log('* Query URL:');
                console.log(queryUrl);
                console.log('* Fetch Response');
                console.log(restResponse);
            }
            return (Promise.reject(textError));
        }

        // Comprobamos que la respuesta tenga contenido
        if (!dataWiki.query || dataWiki.query.length == 0 || !dataWiki.query.pages) {
            let textError = `Wikipedia found no pages searching for '${parWiki.textToSearch}'`;
            console.log(textError);
            if (!props.debugMode) {
                // console.log('* ExtractWiki props');
                // console.log(parWiki);
                console.log('* Query URL:');
                console.log(queryUrl);
                console.log('* Response');
                console.log(dataWiki);
            }
            return (Promise.reject(textError));
        }

        // Convertir la respuesta en array de páginas
        try {
            let extractPages = new Array();
            let pagesId = Object.keys(dataWiki.query.pages);
            pagesId.forEach((aPageId) => {
                let thePage = {
                    pageId: aPageId,
                    textOrHtml: dataWiki.query.pages[aPageId].extract,
                    title: dataWiki.query.pages[aPageId].title,
                    link: `${props.rootUrl}/wiki/${dataWiki.query.pages[aPageId].title}`,
                    index: dataWiki.query.pages[aPageId].index,
                    image: (!dataWiki.query.pages[aPageId].thumbnail)
                        ? undefined
                        : {
                            url: dataWiki.query.pages[aPageId].thumbnail.source,
                            height: dataWiki.query.pages[aPageId].thumbnail.height,
                            width: dataWiki.query.pages[aPageId].thumbnail.width
                        }
                }
                extractPages.push(thePage);
            });
            // Ordenar el array de páginas por relevancia (En el JSON no vienen ordenados)
            extractPages = extractPages.sort((a, b) => (a.index > b.index) ? 1 : -1);
            if (props.debugMode) {
                console.log('* Array of Pages');
                console.log(extractPages);
            }
            return (Promise.resolve(extractPages));
        } catch (error) {
            let textError = `There was an error processing the data returned by Wikipedia: ${error}`;
            console.log(textError);
            if (!props.debugMode) {
                console.log('* ExtractWiki props');
                console.log(parWiki);
                console.log('* Query URL:');
                console.log(queryUrl);
                console.log('* Response');
                console.log(dataWiki);
            }
            return (Promise.reject(textError));
        }

    }

}
