import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

// Extract pdf url and search string from url params
const urlParams = new URLSearchParams(window.location.search)
const url = urlParams.get('url')
const search = urlParams.get('search')

ReactDOM.render(
  url != null ? (
    <App url={url} search={search} />
  ) : (
    <p>You must submit a URL to use this function</p>
  ),
  document.getElementById('root'),
)
