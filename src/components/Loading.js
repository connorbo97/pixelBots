/**
 * Imports
 */

import {red, yellow, green, blue} from '../colors'
import element from 'vdux/element'
import {Block, Text} from 'vdux-ui'
import times from '@f/times'

/**
 * Constants
 */

const colors = [red, yellow, green, blue]

/**
 * Loading
 */

function render ({props}) {
  return (
    <Text absolute m='auto' w={200} h={100} textAlign='center' top={0} right={0} bottom={0} left={0}>
      <Block mt='m'>
        <Text lh='30px' fw='lighter'>Loading…</Text>
      </Block>
      <Block
        sq='80px'
        relative
        align='center center'
        animation='spin ease-in-out'
        animationDuration='6s'
        animationIterationCount='infinite'
        m='auto'>
        {
          times(4, (i) => {
            return (
              <Block
                my={0}
                absolute
                top='calc(50% - 7.5px)'
                left='calc(50% - 7.5px)'
                bgColor={colors[i]}
                circle='15'
                transform={getTransform(i)} />)
            })
        }
      </Block>
    </Text>
  )
}

function getTransform (i) {
  let size = 20
  let direction
  if (i % 2 === 0) {
    direction = 'Y'
  } else {
    direction = 'X'
  }
  if (i > 1) size *= -1
  return `translate${direction}(${size}px)`
}

export default {
  render
}
