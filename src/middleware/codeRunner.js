import createAction from '@f/create-action'
import getIterator from '../getIterator.js'
import animalApis from '../animalApis'
import Runner from '../runner'
import {
  throwError,
  moveError,
  startRun,
  stopRun,
  reset
} from '../actions'

const runCode = createAction('RUN_CODE')
const abortRun = createAction('ABORT_RUN')
const stepForward = createAction('STEP_FORWARD')
const pauseRun = createAction('PAUSE_RUN')
const incrementSteps = createAction('INCREMENT_STEPS')
const resume = createAction('RESUME')

let runner
let steps = 0

function codeRunner () {
  return ({getState, dispatch}) => {
    return (next) => (action) => {
      let state = getState()
      if (action.type === runCode.type && !state.running) {
        const {animals} = state.game
        for (var id in animals) {
          const api = animalApis[animals[id].type].default(id, getState)
          let code = getIterator(animals[id], api, id)
          if (code.error) {
            return dispatch(
              throwError(code.error.name, (code.error.loc.line) - 1)
            )
          }
          dispatch(startRun(code))
        }
      }
      if (action.type === abortRun.type || action.type === moveError.type || action.type === reset.type) {
        runner.stop()
        runner.removeAllListeners('step')
      }
      if (action.type === startRun.type) {
        runner = new Runner(action.payload, dispatch, getState)
        runner.on('step', () => dispatch(incrementSteps()))
        runner.startRun()
      }
      if (action.type === pauseRun.type) {
        dispatch(stopRun())
        runner.pause()
      }
      if (action.type === resume.type) {
        runner.startRun()
      }
      if (action.type === stepForward.type) {
        runner.stepForward()
      }
      return next(action)
    }
  }
}

export default codeRunner
export {
  resume,
  runCode,
  abortRun,
  pauseRun,
  stepForward,
  incrementSteps,
  throwError
}
