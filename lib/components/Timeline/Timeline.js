/**
 * Imports
 */

import {Button, CSSContainer, wrap} from 'vdux-containers'
import {component, element, stopPropagation} from 'vdux'
import {Block, Icon} from 'vdux-ui'
import times from '@f/times'

/**
 * <Timeline/>
 */

export default component({
  render ({props}) {
  	const numBlocks = 10
  	const {frameNumber} = props
		const offset = Math.max(0, frameNumber - numBlocks + 2)

    return (
    	<Block 
    		boxShadow='inset 0 0 6px rgba(black, .1)' 
    		border='1px solid divider' 
    		borderRightWidth={0}
    		align='start stretch' 
    		bgColor='#EEE' 
    		h={50}>
    		{
    			times(numBlocks, (i) => <Frame i={i} offset={offset} numBlocks={numBlocks} {...props} />)
    		}
    	</Block>
    )
  }
})


const Frame = wrap(CSSContainer, {
	hoverProps: {
		hovering: true
	}
})(component({
	render ({props}) {
		const {
			correctness, 
			frameNumber, 
			numBlocks, 
			hovering, 
			onClick, 
			remove, 
			frames, 
			offset,
			i 
		} = props
		
		const cur = i + offset
		const isWrong = correctness 
			&& correctness[cur] !== undefined 
			&& !correctness[cur]
		const isCurrent = cur === frameNumber
		const curProps = isCurrent
			? {
					bgColor: isWrong ? 'red': 'blue',
					borderColor: 'transparent',
					transform: 'scale(1.2)',
					boxShadow: '0 0 2px rgba(black, .3)',
					color: 'white',
					z: '1'
				}
			: {}
		const isActive = cur < frames.length

		return(
			<Block 
				bgColor={isActive ? 'white' : 'transparent'}
				borderRight='1px solid divider' 
				borderColor={isWrong && isActive ? '#f98b8b' : 'divider'}
				boxShadow={
					isWrong && isActive 
						? 'inset 0 0 0 9999px rgba(red, .6)'
						: ''
				}
				onClick={isActive && onClick(cur)}
				align='center end'
				userSelect='none'
				cursor='default'
				minWidth={16} 
				relative
				flex
				fs='12'
				pb='s'
				{...curProps}>
				<Button 
					onClick={[remove, stopPropagation]} 
					boxShadow='0 0 3px rgba(0,0,0,.2)'
					border='1px solid white'
					hide={!isCurrent || !hovering} 
					circle={16} 
					absolute 
					mr={-8} 
					mt={-5}
					right
					top>
						<Icon name='close' fs='10' />
				</Button>
				{isActive ? cur + 1 : ''}
				</Block>
			)
	}
}))


