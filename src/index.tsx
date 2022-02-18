import React from 'react';
import ReactDOM from 'react-dom'
import fs from 'fs'

ReactDOM.render(
  (<p>{fs.readFileSync('README.md', 'utf-8')}</p>),
  document.getElementById('root')
)