/**
 * Imports
 */

import { component, element } from 'vdux'
import palette from 'utils/palette'
import { Block } from 'vdux-ui'

/**
 * <Pixel Gradient/>
 */

export default component({
  initialState ({ props }) {
    if (props.colors) return { colors: props.colors }

    const color1 = randColor()
    let color2 = randColor()
    while (color2 === color1) {
      color2 = randColor()
    }

    return { colors: [color1, color2] }
  },
  render ({ props, children, state }) {
    const { colors } = state

    return (
      <Block
        backgroundImage={`url(/images/pixelTrans.png), linear-gradient(33deg, ${colors[0]}, ${colors[1]})`}
        animation={props.animate ? 'pixel-bg 22s linear infinite' : ''}
        align='center center'
        color='white'
        relative
        h={320}
        column
        mb='l'
        p='l'
        {...props}>
        {children}
      </Block>
    )
  }
})

/**
 * Helpers
 */

function randColor () {
  const blackList = ['white', 'black', 'grey', 'brown', 'blueGrey']
  let color = palette[Math.floor(Math.random() * palette.length)]

  while (blackList.indexOf(color.name) !== -1) {
    color = palette[Math.floor(Math.random() * palette.length)]
  }

  return color.value
}
