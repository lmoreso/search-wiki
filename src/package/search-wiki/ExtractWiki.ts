export const SEARCH_WIKI_VERSION = '0.1.3';

export interface IExtractWikiProps {
    textToSearch: string;
    rootUrl?: string;
    numPagesToSearch?: number;
    plainText?: boolean;
    numChars?: number;
    numSentences?: number,
    imageSize?: number,
    debugMode?: boolean
}

export const EXTRACT_WIKI_DEFAULTS: IExtractWikiProps = {
    textToSearch: 'Belgrado', //'Guernica, pintura de Picasso',
    rootUrl: 'https://es.wikipedia.org',
    numPagesToSearch: 1,
    plainText: true,
    numChars: 300,
    numSentences: 0,
    imageSize: 250
}

export interface IWikiExtractPage {
    pageId: string;
    index: number;
    textOrHtml: string;
    title: string;
    link: string;
    image?: {
        url: string;
        width: number;
        height: number;
    };
}

export async function ExtractWiki(props: IExtractWikiProps, abortSignal: AbortSignal): Promise<IWikiExtractPage[]> {
    let parWiki: IExtractWikiProps = {
        ...props
    };
    if (!props.rootUrl)
        parWiki.rootUrl = EXTRACT_WIKI_DEFAULTS.rootUrl;
    if (!props.numPagesToSearch)
        parWiki.numPagesToSearch = EXTRACT_WIKI_DEFAULTS.numPagesToSearch;
    if (!props.imageSize || props.imageSize <= 50)
        parWiki.imageSize = EXTRACT_WIKI_DEFAULTS.imageSize;

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
            // Pedimos extraxto y foto principal, así como el formato de salida, todo a piñón: 
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
        let restResponse: Response;
        try {
            restResponse = await fetch(queryUrl, {signal: abortSignal});
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
            let extractPages = new Array<IWikiExtractPage>();
            let pagesId = Object.keys(dataWiki.query.pages);
            pagesId.forEach((aPageId) => {
                let thePage: IWikiExtractPage = {
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
            extractPages = extractPages.sort((a: IWikiExtractPage, b: IWikiExtractPage) => (a.index > b.index) ? 1 : -1);
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
