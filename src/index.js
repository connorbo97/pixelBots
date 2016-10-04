/**
 * Imports
 */

import {createEpicMiddleware} from 'redux-observable'
import handleError from './middleware/handleError'
import codeRunner from './middleware/codeRunner'
import moveAnimal from './middleware/moveAnimal'
import location from 'redux-effects-location'
import addCode from './middleware/addCodeMW'
import scroll from './middleware/scroll'
import effects from 'redux-effects'
import domready from '@f/domready'
import reducer from './reducer'
import rootEpic from './epics'
import flow from 'redux-flo'
import * as fire from 'vdux-fire'
import vdux from 'vdux/dom'
import theme from './theme'

const epicMiddleware = createEpicMiddleware(rootEpic)
var app = require('./app').default

const palette = [
  'lightblue',
  'green',
  'red',
  'brown',
  'black'
]

const initialState = {
  url: '/',
  levelSize: [5, 5],
  painted: [],
  initialPainted: [],
  active: 1,
  inputType: 'code',
  selectedLine: 0,
  animals: {
    1: {
      initial: {
        location: [4, 0],
        dir: 0,
        rot: 0
      },
      type: 'zebra',
      current: {},
      sequence: []
    }
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyAj07kPi_C4eGAZBkV7ElSLEa_yg3sHoDc",
  authDomain: "artbot-26016.firebaseapp.com",
  databaseURL: "https://artbot-26016.firebaseio.com",
  storageBucket: "artbot-26016.appspot.com",
  messagingSenderId: "493804710533"
}

const {subscribe, render, replaceReducer} = vdux({
  reducer,
  initialState,
  middleware: [
    flow(),
    effects,
    location(),
    codeRunner(),
    moveAnimal(),
    handleError(),
    fire.middleware(firebaseConfig),
    epicMiddleware,
    scroll,
    addCode
  ]
})

domready(() => {
  subscribe((state) => {
    render(app(state), {uiTheme: theme, palette})
  })
})

if (module.hot) {
  module.hot.accept(['./app', './reducer'], () => {
    replaceReducer(require('./reducer').default)
    app = require('./app').default
  })
}
