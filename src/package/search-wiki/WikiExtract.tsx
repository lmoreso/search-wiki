import * as React from 'react';
import { IWikiExtractProps } from "./WikiExtractProps";
import * as Iconos from './iconos';
import { fetchStates, ISearchWikiStates, panelOrientations } from './ExtractWiki';


export class WikiExtract extends React.Component<IWikiExtractProps, ISearchWikiStates> {

  public constructor(props: IWikiExtractProps) {
    super(props);

    this.state = {
      fetchState: fetchStates.loading,
    };

    this._onChangePage = this._onChangePage.bind(this);
    this._renderTitle = this._renderTitle.bind(this);
  }

  private _setFetchState() {
    if (this.props.hidden) this.setState({fetchState: fetchStates.nothing});

  }

  public componentDidMount() {
    this._setFetchState();
  }

  public componentWillUnmount() {
  }

  public componentDidUpdate(prevProps: IWikiExtractProps) {
    this._setFetchState();
  }

  private _onChangePage(newValue: any): void {
    let newIndex = Number(newValue);
    newIndex = (newIndex || newIndex == 0) ?
      (newIndex >= this.props.pages.length) ?
        0
        :
        (newIndex < 0) ?
          this.props.pages.length - 1
          :
          newIndex
      :
      0;
    this.setState({ pageIndex: newIndex });
  }

  private _renderTitle(props: { titulo: string; hidden?: boolean; numPages?: number; style?: React.CSSProperties; }): JSX.Element {
    let height = '28px';
    if (props.hidden)
      return (null as any);
    else if (!props.numPages || props.numPages <= 1)
      return (
        <div style={{ ...props.style, height: height, overflow: 'hidden', textAlign: 'center' }}>
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center' }}>{props.titulo}</span>
        </div>
      );

    else
      return (
        <div style={{
          ...props.style, height: height, overflow: 'hidden',
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
        }}
        >
          <span onClick={(ev) => { this._onChangePage(this.state.pageIndex! - 1); }} style={{ cursor: 'pointer' }}>
            <Iconos.ChevronLeft />
          </span>
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center', ...props.style, height: height }}>{props.titulo}</span>
          <span onClick={(ev) => { this._onChangePage(this.state.pageIndex! + 1); }} style={{ cursor: 'pointer' }}>
            <Iconos.ChevronRight />
          </span>
        </div>
      );
  }

  public render(): JSX.Element {
    // Estilos para Depuración
    let divsBorder: string | undefined = (this.props.isDevelopMode) ? '1px solid red' : undefined;

    // Estilos root por defecto 
    const divRootCSSConst: React.CSSProperties = {
      overflow: 'hidden',
      ...this.props.rootStyle,
      border: (divsBorder) ? divsBorder : (this.props.rootStyle && this.props.rootStyle.border) ? this.props.rootStyle.border as string : undefined,
    };
    const divRootPadding: number = 2;
    let divRootCSS: React.CSSProperties = {
      ...divRootCSSConst,
      padding: divRootPadding * 2,
      alignItems: 'center',
    };
    if (this.props.panelOrientation !== panelOrientations.landscape) {
      // Orientación Vertical
      divRootCSS.width = `${this.props.fixedSize}px`;
      divRootCSS.minHeight = `${Math.round(this.props.fixedSize * 0.5)}px`;
    } else {
      // Orientación Horizontal
      divRootCSS.height = `${this.props.fixedSize}px`;
      divRootCSS.maxWidth = `${Math.round(this.props.fixedSize * 1.5)}px`;
      divRootCSS.minWidth = `${this.props.fixedSize}px`;
    }

    if (this.state.fetchState === fetchStates.nothing) {
      return (null as any);
    } else if (this.state.fetchState === fetchStates.loadedErr) {
      return (
        <div style={{ ...divRootCSS }}>
          <label>{this.props.txtError}</label>
        </div>
      );
    } else if (this.state.fetchState === fetchStates.loading) {
      return (
        <div style={{ ...divRootCSS, textAlign: 'center' }}>
          <Iconos.IconoSpinner />
        </div>
      );
    } else {
      // Determinar orientación
      let thePage = this.props.pages[this.state.pageIndex!];
      let htmlOrText = thePage.textOrHtml;
      let titulo = thePage.title;
      let enlace = thePage.link;
      let imagenUrl = (thePage.image) ? thePage.image.url : undefined;
      let imagenWidth = (thePage.image) ? thePage.image.width : undefined;
      let imagenHeight = (thePage.image) ? thePage.image.height : undefined;
      let aspectRatio = (thePage.image) ? imagenWidth! / imagenHeight! : 0;
      let landscape = false;
      if (this.props.panelOrientation === panelOrientations.landscape)
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
      };

      let divTextCSS: React.CSSProperties = {
        margin: `${divMargin}px`,
        border: divsBorder,
      };

      let divsBorderCSS: React.CSSProperties = {
        border: divsBorder,
      };

      divRootCSS = {
        ...divRootCSSConst,
        padding: divRootPadding,
      };

      if (landscape) {
        divRootCSS.maxWidth = `${this.props.fixedSize * 4}px`;
        divRootCSS.height = `${this.props.fixedSize}px`;
        divRootCSS.width = undefined;
        divImagenWidth = (aspectRatio) ? Math.round(this.props.fixedSize * aspectRatio! - divRootPadding * 2) : 0;
        if (divImagenWidth > this.props.fixedSize * 1.9)
          divImagenWidth = Math.round(this.props.fixedSize * 1.9);
        divTextWidth = this.props.fixedSize - divMargin * 2;
        divImageCSS.height = `${this.props.fixedSize - divMargin * 2 - divRootPadding * 2 - 2}px`;
      } else {
        divRootCSS.width = `${this.props.fixedSize}px`;
        divRootCSS.maxHeight = `1000px`;
        divRootCSS.height = undefined;
        divTextWidth = this.props.fixedSize - divMargin * 2 - divRootPadding * 2 - 2;
        divImagenWidth = (aspectRatio) ? divTextWidth : 0;
        divImageCSS.maxHeight = `${this.props.fixedSize}px`;
      }
      divImageCSS.width = `${divImagenWidth}px`;
      divTextCSS.width = `${divTextWidth}px`;

      return (
        <div style={{ ...divRootCSS, display: 'flex', flexDirection: (landscape) ? 'row' : 'column' }}>
          <this._renderTitle titulo={titulo} hidden={landscape} numPages={this.props.pages.length} style={divsBorderCSS} />
          <div style={divImageCSS} hidden={!imagenUrl}>
            <img
              src={imagenUrl}
              height={(landscape) ? '100%' : undefined}
              width={(!landscape) ? '100%' : undefined} />
          </div>
          <div style={divTextCSS}>
            <this._renderTitle titulo={titulo} hidden={!landscape} numPages={this.props.pages.length} style={divsBorderCSS} />
            {(!this.props.isHtml) ?
              <div style={{ textAlign: 'justify', border: divsBorder }}>{htmlOrText}</div>
              :
              <div style={{ textAlign: 'justify', border: divsBorder }} dangerouslySetInnerHTML={{ __html: htmlOrText }} />}
            <a
              hidden={(!this.props.textLinkWiki || this.props.textLinkWiki.length == 0)}
              href={enlace}
              target='_blank'
              style={{ marginTop: '2px', border: divsBorder, textAlign: 'center' }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <img src={`${this.props.rootUrl}/favicon.ico`} width='25px' height='25px' />
                {this.props.textLinkWiki}
              </div>
            </a>
          </div>
          <div style={{ margin: (landscape) ? undefined : '10px', border: divsBorder }} />
        </div>
      );
    }
  }
}
