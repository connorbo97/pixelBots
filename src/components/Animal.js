/** @jsx element */

import element from 'vdux/element'
import {Block} from 'vdux-ui'
import {setActive} from '../actions'
import animalApis from '../animalApis'

function render ({props}) {
  let {animal, active, id, cellSize, editMode, running, animationSpeed} = props

  if (Object.keys(animal.current).length < 1) {
    return (<div/>)
  }

  let {rot} = animal.current

  const thisAnimal = animalApis[animal.type]
  let animalSize = parseFloat(cellSize) / 2 + 'px'
  let pos = getPosition()
  const border = animal.type !== 'star' ? active === id : ''
  const boxShadow = animal.type !== 'star' ? '0 0 1px 2px rgba(0,0,0,0.2)' : ''

  return (
    <Block
      absolute
      onClick={() => setActive(id)}
      border={border}
      borderColor={'red'}
      transform={`rotate(${rot}deg) translate(${pos.left}px, ${pos.top}px)`}
      transition={(!editMode) && `all ${animationSpeed}s ease-in-out`}
      boxShadow={boxShadow}
      h={animalSize}
      w={animalSize}
      top='0'
      left='0'
      bgColor='green'
      background={`url(${thisAnimal.imageURL})`}
      backgroundSize='cover'/>
  )

  function getPosition () {
    const MULT = parseFloat(cellSize)
    const OFFSET = (MULT - parseFloat(animalSize)) / 2
    return {
      top: animal.current.location[0] * MULT + OFFSET,
      left: animal.current.location[1] * MULT + OFFSET
    }
  }
}

export default {
  render
}
