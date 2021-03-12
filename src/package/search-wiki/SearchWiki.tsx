import * as React from 'react';

import { ExtractWiki, IWikiExtractPage, } from './ExtractWiki';
import { ISearchWikiProps, panelOrientations } from './SearchWikiProps';
import * as Iconos from './iconos';

enum fetchStates { loading, loadedOk, loadedErr, nothing }

interface ISearchWikiStates {
  fetchState: fetchStates;
  pageIndex?: number;
}

export class SearchWiki extends React.Component<ISearchWikiProps, ISearchWikiStates> {
  private _txtError: string;
  private _wikiRes: Array<IWikiExtractPage>;
  private _abortController = new AbortController();

  public constructor(props: ISearchWikiProps) {
    super(props);

    this.state = {
      fetchState: fetchStates.loading,
    }

    this.onChangePage = this.onChangePage.bind(this);
    this._renderTitle = this._renderTitle.bind(this);
    // this._renderTitle = this._renderTitle.bind(this);
  }

  private _searchWiki() {
    if (this.props.onWikiError) {
      this.setState({ fetchState: fetchStates.nothing });
    } else {
      this.setState({ fetchState: fetchStates.loading });
    }

    ExtractWiki(this.props, this._abortController.signal)
      .then((res: Array<IWikiExtractPage>) => {
        this._wikiRes = res;
        this.setState({ fetchState: fetchStates.loadedOk, pageIndex: 0, })
      })
      .catch((error) => {
        this._txtError = error.toString();
        if (this.props.onWikiError) {
          this.props.onWikiError(error);
        } else {
          this.setState({ fetchState: fetchStates.loadedErr, pageIndex: undefined })
        }
      });
  }

  public componentDidMount() {
    this._searchWiki();
  }

  public componentWillUnmount() {
    this._abortController.abort();
  }

  public componentDidUpdate(prevProps: ISearchWikiProps) {
    if (this.props.textToSearch !== prevProps.textToSearch
      || this.props.rootUrl !== prevProps.rootUrl
      || this.props.numChars !== prevProps.numChars
      || this.props.plainText !== prevProps.plainText
      || this.props.numSentences !== prevProps.numSentences
      || this.props.imageSize !== prevProps.imageSize
      || this.props.numPagesToSearch !== prevProps.numPagesToSearch
      || this.props.debugMode !== prevProps.debugMode
      || (this.props.onWikiError == undefined && prevProps.onWikiError != undefined)
      || (this.props.onWikiError != undefined && prevProps.onWikiError == undefined)
    ) {
      this._searchWiki();
    }
  }

  private onChangePage(newValue: any): void {
    let newIndex = Number(newValue);
    newIndex = (newIndex || newIndex == 0) ?
      (newIndex >= this._wikiRes.length) ?
        0
        :
        (newIndex < 0) ?
          this._wikiRes.length - 1
          :
          newIndex
      :
      0;
    this.setState({ pageIndex: newIndex })
  }

  private _renderTitle(props: { titulo: string; hidden?: boolean; numPages?: number; style?: React.CSSProperties }): JSX.Element {
    let height = '28px';
    if (props.hidden)
      return (null as any);
    else if (!props.numPages || props.numPages <= 1)
      return (
        <div style={{ ...props.style, height: height, overflow: 'hidden', textAlign: 'center'  }}>
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center' }} >{props.titulo}</span>
        </div>
      )
    else
      return (
        <div style={{ ...props.style, height: height, overflow: 'hidden',
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <span onClick={(ev) => { this.onChangePage(this.state.pageIndex! - 1) }} style={{cursor: 'pointer'}}>
            <Iconos.ChevronLeft
              // style={{ ...props.style, height: height }}
            />
          </span>
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center', ...props.style, height: height }} >{props.titulo}</span>
          <span onClick={(ev) => { this.onChangePage(this.state.pageIndex! + 1) }} style={{cursor: 'pointer'}}>
            <Iconos.ChevronRight
              // style={{ ...props.style, height: height }}
            />
          </span>
        </div>
      );
  }

  public render(): JSX.Element {
    // Tamaño del Panel
    let fixedSize = (this.props.fixedSize) ? this.props.fixedSize : 250;

    // Estilos para Depuración
    let divsBorder: string | undefined = (this.props.isDevelopMode) ? '1px solid red' : undefined;

    // Estilos root por defecto 
    const divRootCSSConst: React.CSSProperties = {
      overflow: 'hidden',
      ...this.props.rootStyle,
      border: (divsBorder) ? divsBorder : (this.props.rootStyle && this.props.rootStyle.border) ? this.props.rootStyle.border as string : undefined,
    }
    const divRootPadding: number = 2;
    let divRootCSS: React.CSSProperties = {
      ...divRootCSSConst,
      padding: divRootPadding * 2,
      alignItems: 'center',
    }
    if (this.props.panelOrientation !== panelOrientations.landscape) {
      // Orientación Vertical
      divRootCSS.width = `${fixedSize}px`;
      divRootCSS.minHeight = `${Math.round(fixedSize * 0.5)}px`;
    } else {
      // Orientación Horizontal
      divRootCSS.height = `${fixedSize}px`;
      divRootCSS.maxWidth = `${Math.round(fixedSize * 1.5)}px`;
      divRootCSS.minWidth = `${fixedSize}px`;
    }

    if (this.state.fetchState === fetchStates.nothing) {
      return (null as any);
    } else if (this.state.fetchState === fetchStates.loadedErr) {
      return (
        <div style={{ ...divRootCSS }}>
          <label>{this._txtError}</label>
        </div>
      )
    } else if (this.state.fetchState === fetchStates.loading) {
      return (
        <div style={{ ...divRootCSS, textAlign: 'center' }}>
          <Iconos.IconoSpinner />
        </div>
      )
    } else {
      // Determinar orientación
      let thePage = this._wikiRes[this.state.pageIndex!];
      let htmlOrText = thePage.textOrHtml;
      let titulo = thePage.title;
      let enlace = thePage.link;
      let imagenUrl = (thePage.image) ? thePage.image.url : undefined;
      let imagenWidth = (thePage.image) ? thePage.image.width : undefined;
      let imagenHeight = (thePage.image) ? thePage.image.height : undefined;
      let aspectRatio = (thePage.image) ? imagenWidth! / imagenHeight! : 0;
      let landscape = false;
      if (this.props.panelOrientation == undefined || this.props.panelOrientation === panelOrientations.landscape)
        landscape = true;
      else if (this.props.panelOrientation === panelOrientations.auto && (imagenWidth) && (imagenHeight) && imagenHeight > imagenWidth) {
        landscape = true;
      }

      // Estilos según orientación
      const divMargin: number = 2;
      let divImagenWidth: number;
      let divTextWidth: number;

      let divImageCSS: React.CSSProperties = {
        margin: `${divMargin}px`,
        overflow: 'hidden',
        border: divsBorder,
      }

      let divTextCSS: React.CSSProperties = {
        margin: `${divMargin}px`,
        border: divsBorder,
      }

      let divsBorderCSS: React.CSSProperties = {
        border: divsBorder,
      }

      divRootCSS = {
        ...divRootCSSConst,
        padding: divRootPadding,
      }

      if (landscape) {
        divRootCSS.maxWidth = `${fixedSize * 4}px`;
        divRootCSS.height = `${fixedSize}px`;
        divRootCSS.width = undefined;
        divImagenWidth = (aspectRatio) ? Math.round(fixedSize * aspectRatio! - divRootPadding * 2) : 0;
        if (divImagenWidth > fixedSize * 1.9)
          divImagenWidth = Math.round(fixedSize * 1.9);
        divTextWidth = fixedSize - divMargin * 2;
        divImageCSS.height = `${fixedSize - divMargin * 2 - divRootPadding * 2 - 2}px`;
      } else {
        divRootCSS.width = `${fixedSize}px`;
        divRootCSS.maxHeight = `1000px`;
        divRootCSS.height = undefined;
        divTextWidth = fixedSize - divMargin * 2 - divRootPadding * 2 - 2;
        divImagenWidth = (aspectRatio) ? divTextWidth : 0;
        divImageCSS.maxHeight = `${fixedSize}px`
      }
      divImageCSS.width = `${divImagenWidth}px`
      divTextCSS.width = `${divTextWidth}px`

      return (
        <div style={{...divRootCSS, display: 'flex', flexDirection: (landscape)? 'row' : 'column'}} >
          <this._renderTitle titulo={titulo} hidden={landscape} numPages={this._wikiRes.length} style={divsBorderCSS} />
          <div style={divImageCSS} hidden={!imagenUrl}>
            <img
              src={imagenUrl}
              height={(landscape) ? '100%' : undefined}
              width={(!landscape) ? '100%' : undefined}
            />
          </div>
          <div style={divTextCSS} >
            <this._renderTitle titulo={titulo} hidden={!landscape} numPages={this._wikiRes.length} style={divsBorderCSS} />
            {(this.props.plainText) ?
              <div style={{ textAlign: 'justify', border: divsBorder }} >{htmlOrText}</div>
              :
              <div style={{ textAlign: 'justify', border: divsBorder }} dangerouslySetInnerHTML={{ __html: htmlOrText }} />
            }
            <a
              hidden={(!this.props.textLinkWiki || this.props.textLinkWiki.length == 0)}
              href={enlace}
              target='_blank'
              style={{ marginTop: '2px', border: divsBorder, textAlign: 'center' }}
            >
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}} >
                <img src={`${this.props.rootUrl}/favicon.ico`} width='25px' height='25px' />
                {this.props.textLinkWiki}
              </div>
            </a>
          </div>
          <div style={{ margin: (landscape) ? undefined : '10px', border: divsBorder }} />
        </div>
      )
    }
  }
}
