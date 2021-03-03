import * as React from 'react';

import { ExtractWiki, IWikiExtractPage, IWikiExtractPages, fetchStates, ISearchWikiStates, } from './ExtractWiki';
import { ISearchWikiProps,  } from './SearchWikiProps';
import { WikiExtract } from './WikiExtract';



export class SearchWiki extends React.Component<ISearchWikiProps, ISearchWikiStates> {
  private _wikiExtractPages: IWikiExtractPages;
  private _abortController = new AbortController();

  public constructor(props: ISearchWikiProps) {
    super(props);

    this.state = {
      fetchState: fetchStates.loading,
    }

    this.onChangePage = this.onChangePage.bind(this);
    // this._renderTitle = this._renderTitle.bind(this);
  }

  private _searchWiki() {
    if (this.props.onWikiError) {
      this.setState({ fetchState: fetchStates.nothing });
    } else {
      this.setState({ fetchState: fetchStates.loading });
    }

    ExtractWiki(this.props, this._abortController.signal)
      .then((res: IWikiExtractPages) => {
        this._wikiExtractPages = res;
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

   public render(): JSX.Element {

      return (
        <WikiExtract
          fetchState={this.state.fetchState}
          pages={this.}
        
        
        />
      )
    }
  }
}
