import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'
import Viewer from './Viewer.js'
import Toolbar from './Toolbar.js'
import pdfjsLib from 'pdfjs-dist/webpack'

class App extends Component {
  componentDidMount() {
    let loadingTask
    if (this.props.url.includes('http')) {
      loadingTask = pdfjsLib.getDocument({
        url: `https://proxy.cors.sh/${this.props.url}`,
        httpHeaders: {
          'x-cors-api-key': process.env.REACT_APP_CORSH,
        },
      })
    } else {
      loadingTask = pdfjsLib.getDocument(this.props.url)
    }
    loadingTask.promise.then(
      doc => {
        console.log(`Document ${this.props.url} loaded ${doc.numPages} page(s)`)
        this.viewer.setState({
          doc,
          search: this.props.search || null,
        })
      },
      reason => {
        console.error(`Error during ${this.props.url} loading: ${reason}`)
      },
    )
  }
  zoomIn(e) {
    this.viewer.setState({
      scale: this.viewer.state.scale * 1.1,
    })
  }
  zoomOut(e) {
    this.viewer.setState({
      scale: this.viewer.state.scale / 1.1,
    })
  }
  displayScaleChanged(e) {
    this.toolbar.setState({
      scale: e.scale,
    })
  }

  render() {
    return (
      <div className="App">
        <Toolbar
          ref={ref => (this.toolbar = ref)}
          onZoomIn={e => this.zoomIn(e)}
          onZoomOut={e => this.zoomOut(e)}></Toolbar>
        <div className="App-body">
          <Viewer
            ref={ref => (this.viewer = ref)}
            onScaleChanged={e => this.displayScaleChanged(e)}></Viewer>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  url: PropTypes.string,
}

export default App
