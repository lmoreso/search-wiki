import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { ExtractWiki, IExtractWikiProps, IWikiExtractPage, } from './ExtractWiki';

export enum panelOrientations { landscape, portrait, auto }

export interface ISearchWikiProps extends IExtractWikiProps {
  fixedSize: number;
  panelOrientation?: panelOrientations;
  rootStyle?: React.CSSProperties;
  textLinkWiki?: string;
  onWikiError?: (textErr: string) => void
}

enum fetchResults { loading, loadedOk, loadedErr, nothing }

interface ISearchWikiStates {
  fetchResult: fetchResults;
  pageIndex?: number;
}

export class SearchWiki extends React.Component<ISearchWikiProps, ISearchWikiStates> {
  private _txtError: string;
  private _wikiRes: Array<IWikiExtractPage>;

  public constructor(props: ISearchWikiProps) {
    super(props);

    this.state = {
      fetchResult: fetchResults.loading,
    }

    this.onChangePage = this.onChangePage.bind(this);
    this._renderTitle = this._renderTitle.bind(this);
    // this._renderTitle = this._renderTitle.bind(this);
  }

  private _searchWiki() {
    if (this.props.onWikiError) {
      this.setState({ fetchResult: fetchResults.nothing });
    } else {
      this.setState({ fetchResult: fetchResults.loading });
    }

    ExtractWiki(this.props)
      .then((res: Array<IWikiExtractPage>) => {
        this._wikiRes = res;
        this.setState({ fetchResult: fetchResults.loadedOk, pageIndex: 0, })
      })
      .catch((error) => {
        this._txtError = error.toString();
        if (this.props.onWikiError) {
          this.props.onWikiError(error);
        } else {
          this.setState({ fetchResult: fetchResults.loadedErr, pageIndex: undefined })
        }
      });
  }

  public componentDidMount() {
    this._searchWiki();
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
    let height = '22px';
    if (props.hidden)
      return (null as any);
    else if (!props.numPages || props.numPages <= 1)
      return (
        <Stack verticalAlign='start' style={{ ...props.style, height: height, overflow: 'hidden' }}>
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center' }} >{props.titulo}</span>
        </Stack>
      )
    else
      return (
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' style={{ ...props.style, height: height, overflow: 'hidden' }}>
          <IconButton
            iconProps={{ iconName: 'ChevronLeft' }}
            onClick={(ev) => { this.onChangePage(this.state.pageIndex! - 1) }}
            style={{ ...props.style, height: height }}
          />
          <span style={{ fontSize: 'medium', fontWeight: 'lighter', textAlign: 'center', ...props.style, height: height }} >{props.titulo}</span>
          <IconButton
            iconProps={{ iconName: 'ChevronRight' }}
            onClick={(ev) => { this.onChangePage(this.state.pageIndex! + 1) }}
            style={{ ...props.style, height: height }}
          />
        </Stack>
      );
  }

  public render(): JSX.Element {
    if (this.state.fetchResult === fetchResults.nothing) {
      return (null as any);
    } else if (this.state.fetchResult === fetchResults.loadedErr) {
      return (
        <div style={{ width: `${this.props.fixedSize}px` }}>
          <Label>{'ERROR'}</Label>
          <Label>{this._txtError}</Label>
        </div>
      )
    } else if (this.state.fetchResult === fetchResults.loading) {
      return (
        <div style={{ width: `${this.props.fixedSize}px` }}>
          <Spinner
            size={SpinnerSize.large}
          />
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
      if (this.props.panelOrientation === panelOrientations.landscape)
        landscape = true;
      else if (this.props.panelOrientation === panelOrientations.auto && (imagenWidth) && (imagenHeight) && imagenHeight > imagenWidth) {
        landscape = true;
      }

      // Estilos para Depuración
      let divsBorder: string | undefined = (this.props.debugMode) ? '1px solid red' : undefined;

      // Estilos según orientación
      const divMargin: number = 2;
      let divImagenWidth: number;
      let divTextWidth: number;

      const divRootPadding: number = 2;
      let divRootCSS: React.CSSProperties = {
        overflow: 'hidden',
        ...this.props.rootStyle,
        padding: divRootPadding,
      }
      if (landscape) {
        divRootCSS.maxWidth = `${this.props.fixedSize * 3}px`;
        divRootCSS.height = `${this.props.fixedSize}px`;
      } else {
        divRootCSS.width = `${this.props.fixedSize}px`;
        divRootCSS.maxHeight = `1000px`;
      }
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

      if (landscape) {
        divRootCSS.height = `${this.props.fixedSize}px`;
        divRootCSS.width = undefined;
        divRootCSS.maxWidth = `${this.props.fixedSize * 4}px`;
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
        divImageCSS.maxHeight = `${this.props.fixedSize}px`
      }
      divImageCSS.width = `${divImagenWidth}px`
      divTextCSS.width = `${divTextWidth}px`

      return (
        <Stack horizontal={landscape} style={divRootCSS} >
          <this._renderTitle titulo={titulo} hidden={landscape} numPages={this._wikiRes.length} style={divsBorderCSS} />
          <div style={divImageCSS}>
            <Image
              src={imagenUrl}
              height={(landscape) ? '100%' : undefined}
              width={(!landscape) ? '100%' : undefined}
            />
          </div>
          <Stack style={divTextCSS} >
            <this._renderTitle titulo={titulo} hidden={!landscape} numPages={this._wikiRes.length} style={divsBorderCSS} />
            {(this.props.plainText) ?
              <div style={{ textAlign: 'justify', border: divsBorder }} >{htmlOrText}</div>
              :
              <div style={{ textAlign: 'justify', border: divsBorder }} dangerouslySetInnerHTML={{ __html: htmlOrText }} />
            }
            <Link
              hidden={(!this.props.textLinkWiki || this.props.textLinkWiki.length == 0)}
              href={enlace}
              target='_blank'
              styles={{ root: { marginTop: '2px', border: divsBorder, textAlign: 'center' } }}
            >
              <Stack horizontal horizontalAlign='center' verticalAlign='center'>
                <Image src={`${this.props.rootUrl}/favicon.ico`} width='25px' height='25px' />
                {this.props.textLinkWiki}
              </Stack>
            </Link>
          </Stack>
          <div style={{ margin: (landscape) ? undefined : '10px', border: divsBorder }} />
        </Stack>
      )
    }


  }

}
