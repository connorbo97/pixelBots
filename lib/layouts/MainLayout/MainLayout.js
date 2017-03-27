/**
 * Imports
 */

import {Avatar, Block, Icon, Box, Text} from 'vdux-ui'
import {component, element} from 'vdux'

/**
 * <Main Layout/>
 */

export default component({
  render ({props, children}) {
    const {
      title,
      titleImg,
      titleActions,
      navigation = [],
      leftAction,
      titleProps,
      bodyProps
    } = props

    return (
      <Block column wide tall>
        <Box relative wide color='#767676' fontWeight='800' h='90px'>
          <Block p='20px' align='start center' {...titleProps}>
            {leftAction || <Block ml='1em' />}
            {titleImg && <Avatar boxShadow='0 0 1px 2px rgba(0,0,0,0.2)' h='60px' w='60px' src={titleImg} />}
            <Block align='start center' flex relative ml='1em'>
              {navigation.filter((nav) => !!nav).map(({category, title, onClick}, i, arr) => (
                <Block align='start center'>
                  <Block
                    onClick={!!onClick && onClick}
                    cursor={onClick ? 'pointer' : 'default'}
                    column
                    align='start start'>
                    {
                      category && <Text
                        display='block'
                        fontWeight='300'
                        fs='xs'>{category.toUpperCase()}
                      </Text>
                    }
                    <Text
                      display='block'
                      fontWeight='500'
                      fs='l'>
                      {title}
                    </Text>
                  </Block>
                  {i < arr.length - 1 && <Icon fs='l' mx='1em' name='keyboard_arrow_right' />}
                </Block>
              ))}
            </Block>
            {titleActions}
          </Block>
        </Box>
        <Box flex wide py='1em' {...bodyProps}>
          {children}
        </Box>
      </Block>
    )
  }
})