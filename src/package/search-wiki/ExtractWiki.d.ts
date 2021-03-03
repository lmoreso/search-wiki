
/**
 * Versión del API ExtractWiki  
 */
export declare const EXTRACT_WIKI_VERSION: string;

export enum fetchStates { loading, loadedOk, loadedErr, nothing }

export interface ISearchWikiStates {
  fetchState: fetchStates;
  pageIndex?: number;
}

/**
 * Orientación del Panel resultado:
 * - landscape: 
 *        horizontal (foto a la izquierda, texto a la derecha).
 * - portrait: 
 *        vertical (foto arriba, texto abajo).
 * - auto: 
 *        vertical si la foto es mas ancha que alta.
 *        horizontal si la foto es mas alta que ancha.
 */
export enum panelOrientations { landscape, portrait, auto }

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
    /** Vuelca trazas en la consola, como la URL final y los resultados de la llamada al API. */
    debugMode?: boolean
}

/** Valores por defecto para la llamada a la Wiki */
export declare const EXTRACT_WIKI_DEFAULTS: IExtractWikiProps;

/** 
 * Tipo de dato con los resultados de la llamada a la Wiki.
 * ExtractWiki devuelve un array con tantas instancias como páginas encontradas.
 */
export interface IWikiExtractPage {
    key: string | number;
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
    image?: {
        /** Url de la imágen. */
        url: string;
        /** width de la imágen. */
        width: number;
        /** height de la imágen. */
        height: number;
    };
}

export interface IWikiExtractPages {
    pages: IWikiExtractPage[];
    rootUrl: string;
    isHtml?: boolean;
    txtError?: string;
}

/**
 * Recupera el extracto de uno o mas artículos de Wikipedia
 * @param props (IExtractWikiProps): paraḿetro obligatorio que sólo requiere el texto a buscar 'textToSearch'.
 * @param abortSignal (AbortSignal?): parámetro optativo.
 * @return Promise<IWikiExtractPage[]> Promesa de un array de IWikiExtractPage.
 */
export declare function ExtractWiki(props: IExtractWikiProps, abortSignal?: AbortSignal): Promise<IWikiExtractPages>; 
