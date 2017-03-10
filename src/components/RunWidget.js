/** @jsx element */

import {runCode, abortRun, pauseRun, resume} from '../middleware/codeRunner'
import {checkDrawing} from '../middleware/checkCompleted'
import {immediateSave} from '../middleware/saveCode'
import {Card, Block, Icon} from 'vdux-ui'
import StepperWidget from './StepperWidget'
import SpeedDisplay from './Speed'
import element from 'vdux/element'
import {reset} from '../actions'
import Button from './Button'
import sleep from '@f/sleep'

function render ({props}) {
  const {hasRun, onRun = () => {}, speed, sequence, running, canRun, steps = 0, completedRun} = props
  const current = getSymbols(canRun, running)

  return (
    <Block bgColor='white' border='1px solid #e6e6e6' mt='0.5em' wide p='10px'>
      <Block column align='space-between center'>
        <Button
          tall
          flex
          wide
          m='1px'
          bgColor='green'
          h='60px'
          fs='l'
          color='white'
          onClick={handleClick}>
          <Icon ml='-4px' mr='10px' name={current.icon} />
          {current.text.toUpperCase()}
        </Button>
        {canRun && <Block mt='1em' wide align='space-around center'>
          <SpeedDisplay speed={speed} />
          <StepperWidget sequence={sequence} steps={steps} />
        </Block>}
      </Block>
    </Block>
  )

  function * handleClick () {
    if (!canRun) {
      return yield checkDrawing()
    }
    if (!hasRun && sequence.length > 0) {
      yield runCode()
      yield immediateSave()
      yield onRun(sequence)
    } else if (running) {
      yield pauseRun()
    } else if (completedRun) {
      yield reset()
      yield sleep(500)
      yield immediateSave()
      yield runCode()
      yield onRun(sequence)
    } else {
      yield resume()
    }
  }
}

function getSymbols (canRun, running) {
  if (!canRun) {
    return {
      icon: 'done',
      text: 'check'
    }
  }
  if (running) {
    return {
      icon: 'pause',
      text: 'pause'
    }
  }
  return {
    icon: 'play_arrow',
    text: 'run'
  }
}

export default {
  render
}
