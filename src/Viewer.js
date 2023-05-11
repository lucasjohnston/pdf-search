import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { PDFJS as PDFJSViewer } from 'pdfjs-dist/web/pdf_viewer.js'
import './Viewer.css'
import 'pdfjs-dist/web/pdf_viewer.css'
import { OpenAIApi, Configuration } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OAI,
})
const openai = new OpenAIApi(configuration)

class Viewer extends Component {
  constructor(props) {
    super(props)
    this.initEventBus()
    this.state = {
      doc: null,
      scale: undefined,
      search: null,
    }
  }
  initEventBus() {
    let eventBus = new PDFJSViewer.EventBus()
    eventBus.on('pagesinit', e => {
      this.setState({
        scale: this._pdfViewer.currentScale,
      })
      if (this.props.onInit) {
        this.props.onInit({})
      }
      if (this.props.onScaleChanged) {
        this.props.onScaleChanged({ scale: this.state.scale })
      }
      if (this.state.search != null && this._findController != null) {
        this.search(true, this.state.search)
      }
    })
    eventBus.on('scalechange', e => {
      if (this.props.onScaleChanged) {
        this.props.onScaleChanged({ scale: e.scale })
      }
    })
    this._eventBus = eventBus
  }
  componentDidMount() {
    let viewerContainer = ReactDOM.findDOMNode(this)
    this._pdfViewer = new PDFJSViewer.PDFViewer({
      container: viewerContainer,
      eventBus: this._eventBus,
    })
    this._findController = new PDFJSViewer.PDFFindController({
      pdfViewer: this._pdfViewer,
    })
    this._pdfViewer.setFindController(this._findController)
  }
  componentWillUpdate(nextProps, nextState) {
    if (this.state.doc !== nextState.doc) {
      this._pdfViewer.setDocument(nextState.doc)
    }
    if (this.state.scale !== nextState.scale) {
      this._pdfViewer.currentScale = nextState.scale
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.doc !== nextState.doc ||
      this.state.scale !== nextState.scale ||
      this.state.search !== nextState.search
    ) {
      return true
    }
    return false
  }
  async search(init, str) {
    if (str == null || str === '') {
      return
    }

    // Normalize searching
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Please extract the first sentence from the following searching. Remove any document formatting like section numbers (e.g. \"1.3.5\") and footnotes (e.g. \"footnote 21\"). However, the sentence you generate must still be contained within the input searching – do not manipulate the output. You must only output a single sentence.\n\nInput: 4.2.9 According to the same report, ‘There are approximately 20 officially recognised Christian churches in Iran.’[footnote 46]\n\n4.2.10 The USSD IRF Report 2021 noted that Christians were among the 3 largest non-Muslim minorities, alongside Baha’is and Yarsanis.’[footnote 47]\n\n4.2.11 The 2016 Iran census identified 130,158 Christians[footnote 48], which, according to UN data, comprised of 69,075 males and 61,083 females.\n\nOutput: According to the same report, ‘There are approximately 20 officially recognised Christian churches in Iran.\n\nInput: ${str}\n\nOutput:`,
      temperature: 0,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    let search = ''
    if (response.data.choices[0].text != null) {
      // Remove char from start if exists
      search = response.data.choices[0].text
      if (
        search[0] === '\n' ||
        search[0] === '\r' ||
        search[0] === '\r\n' ||
        search[0] === '\n\r' ||
        search[0] === ' '
      ) {
        console.log('removing char from start')
        search = search.slice(1)
      }

      // Remove char from end if exists
      if (
        search[search.length - 1] === '.' ||
        search[search.length - 1] === ' ' ||
        search[search.length - 1] === '\n' ||
        search[search.length - 1] === '\r' ||
        search[search.length - 1] === '\r\n' ||
        search[search.length - 1] === '\n\r'
      ) {
        console.log('removing char from end')
        search = search.slice(0, -1)
      }

      console.log('OPENAI: ' + search)
    }

    // Retry search
    this._findController.executeCommand('find', {
      query: search,
      phraseSearch: true,
      caseSensitive: false,
      highlightAll: true,
    })
    if (init === true) {
      this.setState({
        scale: this._pdfViewer.currentScale * 1.4,
      })
    }
  }
  render() {
    return (
      <div className="Viewer">
        <div className="pdfViewer"></div>
      </div>
    )
  }
}

Viewer.propTypes = {
  onInit: PropTypes.func,
  onScaleChanged: PropTypes.func,
}

export default Viewer
