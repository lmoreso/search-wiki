import { IExtractWikiProps } from "./ExtractWiki";

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
 * Hereda las propiedades de @IExtractWikiProps y añade propiedades visuales
 */
export interface ISearchWikiProps extends IExtractWikiProps {
  /** 
   * Tamaño del panel: 
   *  - Se aplica al Ancho del panel resultado cuando la orientación es Vertical.
   *  - Se aplica al Alto del panel resultado cuando la orientación es Horizontal.
   */
  fixedSize?: number;
  /** 
   * Orientación del panel resultado 
   * - ver @panelOrientations.
   */
  panelOrientation?: panelOrientations;
  /**
   * Estilo a aplicar en el contenedor principal
   */
  rootStyle?: React.CSSProperties;
  /**
   * Si se informa, se pinta este texto debajo del extracto, como enlace a la página de la Wikipedia, con icono de Wikipedia incluido.
   */
  textLinkWiki?: string;
  /**
   * callback que se invocará si la consulta a wikipedia devuelve un error.
   * - si no se proporciona se muestra el texto del error en el panel resultado.
   * - útil si en vez de mostrar el error se quiere, por ejemplo, cerrar otro componente como un Panel o un Modal.
   */
  onWikiError?: (textErr: string) => void;
  /**
   * Si se activa, se pintan los bordes de todos los elementos en color rojo.
   */
  isDevelopMode?: boolean;
}


