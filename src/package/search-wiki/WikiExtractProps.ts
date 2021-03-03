import { IWikiExtractPages, fetchStates, panelOrientations, } from "./ExtractWiki";

/**
 *
 */
export interface IWikiExtractProps extends IWikiExtractPages {
    fetchState: fetchStates;
    /**
     *
     */
    hidden?: boolean;
    /**
     * Tamaño del panel:
     *  - Se aplica al Ancho del panel resultado cuando la orientación es Vertical.
     *  - Se aplica al Alto del panel resultado cuando la orientación es Horizontal.
     */
    fixedSize: number;
    /**
     * Orientación del panel resultado
     * - ver @panelOrientations.
     */
    panelOrientation?: panelOrientations;
    /**
     * Estilo a aplicar en el contenedor de SearchWiki
     */
    rootStyle?: React.CSSProperties;
    /**
     * Si se informa, se pinta este texto debajo del extracto, como enlace a la página de la Wikipedia, con icono de Wikipedia incluido.
     */
    textLinkWiki?: string;
    /**
     * Si se activa, se pintan los bordes de todos los elementos en color rojo.
     */
    isDevelopMode?: boolean;
}
