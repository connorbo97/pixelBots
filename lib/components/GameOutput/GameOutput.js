/**
 * Imports
 */

import { up, down, left, right, forward } from 'utils/frameReducer'
import { Block, Icon, Button, Toggle } from 'vdux-containers'
import ConfirmResetModal from 'components/ConfirmResetModal'
import ResetBoardButton from 'components/ResetBoardButton'
import GridBlock from 'components/GridOptions/GridBlock'
import PixelInspector from 'components/PixelInspector'
import GameController from 'components/GameController'
import EditGridModal from 'components/EditGridModal'
import TurnSelector from 'components/TurnSelector'
import ErrorTracker from 'components/ErrorTracker'
import ColorPicker from 'components/ColorPicker'
import PaintButton from 'components/PaintButton'
import LineCounts from 'components/LineCounts'
import DebugStats from 'components/DebugStats'
import RunWidget from 'components/RunWidget'
import { component, element } from 'vdux'
import { throttle } from 'redux-timing'
import Canvas from 'components/Canvas'
import marked from 'marked'
import omit from '@f/omit'

/**
 * <Game Output/>
 */

export default component({
  initialState ({ props }) {
    const { type } = props
    const isRead = type === 'read'

    return {
      paintColor: 'black',
      inspectMode: false,
      view: isRead ? 'read' : 'grid'
    }
  },
  render ({ props, state, actions, context }) {
    const {
      targetPainted,
      errorMessage,
      invalidCount,
      capabilities,
      gameActions,
      description,
      userAnimal,
      savedGame,
      levelSize,
      isProject,
      completed,
      errorLog,
      readOnly,
      canPaint,
      palette,
      animals,
      invalid,
      running,
      painted,
      hasRun,
      active,
      paint,
      steps,
      speed,
      size,
      type,
      initialPainted
    } = props

    const isRead = type === 'read'
    const {
      opacity,
      paintColor,
      mode,
      view,
      inspectorData,
      inspectMode
    } = state
    const html = description ? marked(description) : ''
    const gridBlockActions = { ...gameActions, ...actions }

    return (
      <Block mr='10px'>
        <Block relative pt='0' align='top' height='100%' mb>
          <Block
            column
            align='stretch center'
            border='1px solid divider'
            mr={12}
            bg='white'
            relative
            w={200}>
            <Block
              h={46}
              minHeight='46px'
              wide
              align='space-around center'
              px='20'
              borderBottom='1px solid divider'>
              <IconTab
                icon='info_outline'
                name='read'
                setView={actions.setView}
                current={view}
                color='green'
                hide={type !== 'read'} />
              <IconTab
                icon='grid_on'
                name='grid'
                setView={actions.setView}
                current={view}
                color='green'
                hide={type === 'read'} />
              <IconTab
                icon='description'
                name='info'
                setView={actions.setView}
                current={view}
                color='blue' />
              <IconTab
                icon='bug_report'
                name='debugStats'
                setView={actions.setView}
                current={view}
                color='red' />
            </Block>
            <Block overflowY='auto' p sq='100%'>
              <Block align='start center' tall column hide={view !== 'read'}>
                {
                  <Block
                    align='center center'
                    wide
                    border='1px solid divider'
                    borderBottomWidth='0'
                    p='s'>
                    <LineCounts
                      hard={false}
                      limit={3}
                      name='Error'
                      value={invalidCount}
                      color='black' />
                  </Block>
                }
                <Block
                  border='1px solid divider'
                  h={257}
                  wide
                  overflowY='auto'
                  p='s'
                  fs='xs'>
                  {errorLog && errorLog.length ? (
                    errorLog
                      .slice()
                      .reverse()
                      .map((error, i) => (
                        <Block
                          py='s'
                          key={Date.now() + '.' + i}
                          borderTop={i ? '1px solid divider' : ''}
                          align='start center'>
                          <Block
                            circle={20}
                            color='white'
                            bg='red'
                            fs='xxs'
                            align='center center'
                            mr={16}>
                            {errorLog.length - i}
                          </Block>
                          <Block>Wrong {error}</Block>
                        </Block>
                      ))
                  ) : (
                    <Block lh='1.5em' color='#666' p='s'>
                      Click on the grid to follow the code and paint the
                      resulting picture.
                    </Block>
                  )}
                </Block>
                <Block>
                  {Object.keys(initialPainted).length ? (
                    <Toggle
                      mt
                      label='Inspect Pixels'
                      onChange={actions.toggleInspectMode}
                      checked={state.inspectMode} />
                  ) : null}
                  <PixelInspector
                    mt
                    inspectMode={inspectMode}
                    data={inspectorData} />
                </Block>
              </Block>
              <Block hide={view !== 'grid'}>
                <Block mt='-6' pb='s' align='space-between center'>
                  <Block fs='xs'>GOAL:</Block>
                  {type === 'project' && (
                    <Button
                      bgColor='blue'
                      fs='xs'
                      py='xs'
                      px='s'
                      onClick={context.openModal(() => (
                        <EditGridModal
                          {...gridBlockActions}
                          painted={targetPainted}
                          levelSize={levelSize}
                          paintColor={paintColor}
                          palette={palette}
                          animals={animals} />
                      ))}>
                      <Icon name='brush' mr='xs' fs='s' />
                      Edit Goal
                    </Button>
                  )}
                </Block>
                <Canvas
                  id='miniTarget'
                  h={166}
                  w={166}
                  palette={palette}
                  setCanvasContext={props.setCanvasContext}
                  painted={targetPainted}
                  numRows={levelSize[0]}
                  numColumns={levelSize[1]} />
                <Toggle
                  mt
                  label='Layover'
                  userSelect='none'
                  onChange={actions.toggleLayover}
                  checked={!!opacity} />
                <PixelInspector
                  mt
                  inspectMode={inspectMode}
                  data={inspectorData} />
              </Block>
              <Block hide={view !== 'info'} innerHTML={html} lh='1.4em' />
              <DebugStats
                type={type}
                game={savedGame}
                hide={view !== 'debugStats'} />
            </Block>
          </Block>
          <Block>
            <Block relative zIndex='10'>
              <Block relative h={parseInt(size, 10)} w={size}>
                <GridBlock
                  {...gridBlockActions}
                  gridState={{
                    mode,
                    color: paintColor,
                    painted: targetPainted
                  }}
                  id='target'
                  animals={null}
                  userAnimal={userAnimal}
                  enableMove={false}
                  enableSize={false}
                  paintColor={paintColor}
                  mode={mode}
                  painted={targetPainted}
                  size='350px'
                  palette={palette}
                  capabilities={capabilities}
                  isProject={false}
                  enableColorTips={!isRead}
                  setCanvasContext={props.setCanvasContext}
                  active={active}
                  speed={speed}
                  onClick={inspectMode && actions.inspectPixel}
                  levelSize={levelSize}
                  numRows={levelSize[0]}
                  numColumns={levelSize[1]} />
              </Block>
              <Block absolute top left z={999} pointerEvents='none'>
                <Canvas
                  id='solution'
                  type={type}
                  turn={actions.animalTurn(active)}
                  mode='read'
                  opacity={1 - opacity}
                  name='solution'
                  userAnimal={userAnimal}
                  animals={animals}
                  hasRun={hasRun}
                  running={running}
                  palette={palette}
                  invalid={invalid}
                  active={active}
                  setCanvasContext={props.setCanvasContext}
                  painted={painted}
                  h={350}
                  w={350}
                  speed={speed}
                  levelSize={size}
                  numRows={levelSize[0]}
                  numColumns={levelSize[1]} />
              </Block>
              {canPaint && (
                <Block
                  bgColor='white'
                  border='1px solid divider'
                  mt='0.5em'
                  wide
                  py={12}
                  px={10}
                  align='space-between center'>
                  {capabilities.forward ? (
                    <TurnSelector
                      clickHandler={actions.animalTurn(active)}
                      rotation={animals[active].current.rot}
                      fwd={props.controllerMove(forward)}
                      btnProps={btnProps('#945AC1')}
                      w={128} />
                  ) : (
                    <GameController
                      up={props.controllerMove(up)}
                      down={props.controllerMove(down)}
                      left={props.controllerMove(left)}
                      right={props.controllerMove(right)}
                      turn={actions.animalTurn(active)}
                      rotation={animals[active].current.rot}
                      btnProps={btnProps('#945AC1')}
                      h={86}
                      w={128}
                      mb={-4} />
                  )}
                  <Block align='center center'>
                    <PaintButton
                      onClick={paint(active, paintColor)}
                      {...btnProps('green')}
                      borderRadius='3px 0 0 3px'
                      borderColor='rgba(black, .1)'
                      borderWidth='0 1px 0 0'
                      w={42} />
                    <ColorPicker
                      clickHandler={actions.setColor('')}
                      colors={palette}
                      paintColor={paintColor}
                      {...btnProps('green')}
                      borderRadius='0 3px 3px 0'
                      w={42}
                      swatchSize={23} />
                  </Block>
                  <ResetBoardButton
                    {...btnProps('red')}
                    w={48}
                    onClick={
                      isRead
                        ? context.openModal(() => (
                          <ConfirmResetModal onSubmit={props.reset} />
                        ))
                        : props.reset
                    }
                    borderWidth='1' />
                  <Button
                    {...btnProps('blue')}
                    w={48}
                    onClick={props.onComplete()}>
                    <Icon name='check' />
                  </Button>
                </Block>
              )}
              {readOnly || (
                <RunWidget
                  {...omit('painted', props)}
                  steps={steps}
                  running={running}
                  isProject={isProject}
                  completed={completed}
                  hasRun={hasRun}
                  hasCode={
                    animals[active].sequence &&
                    animals[active].sequence.length > 0
                  }
                  canRun={!canPaint}
                  speed={speed} />
              )}
            </Block>
          </Block>
        </Block>
        <Block my relative minHeight={24} hide={!readOnly}>
          <ErrorTracker invalid={invalidCount} errorMessage={errorMessage} />
        </Block>
      </Block>
    )
  },
  middleware: [throttle('inspectPixel', 100)],
  controller: {
    * animalTurn ({ props }, active, turn) {
      const nextTurn = -props.animals[active].current.rot + turn
      yield props.animalTurn(active, nextTurn)
    },
    * setPainted ({ props, state }, grid, coordinates) {
      const { paintColor } = state

      yield props.gameActions.setPainted(
        'targetPainted',
        coordinates,
        paintColor
      )
    },
    * erase ({ props }, grid, coordinates) {
      yield props.gameActions.setPainted('targetPainted', coordinates, 'white')
    },
    * clearInspection ({ props }) {
      const { targetCanvas, solutionCanvas } = props
      targetCanvas.clearSelection()
      solutionCanvas.clearSelection()
    },
    * toggleInspectMode ({ props, state, actions }, inspectMode) {
      if (inspectMode === 'undefined') {
        inspectMode = !state.inspectMode
      }

      if (inspectMode) {
        yield actions.inspectPixel([0, 0])
      }

      yield actions.clearInspection()
      yield actions.setInspectorData(null)
      yield actions.setInspectMode(inspectMode)
    },
    * inspectPixel ({ props, actions }, coordinates) {
      const { targetCanvas, solutionCanvas, levelSize } = props
      targetCanvas.select(coordinates.slice().reverse())
      solutionCanvas.select(coordinates.slice().reverse())
      if (coordinates) {
        yield actions.setInspectorData({
          current: props.painted[coordinates] || 'white',
          target: props.targetPainted[coordinates] || 'white',
          coordinates: [coordinates[1], levelSize[0] - 1 - coordinates[0]]
        })
      }
    },
    * toggleLayover ({ props, actions, state }) {
      const showLayover = !state.opacity
      yield actions.setOpacity(!showLayover ? 0 : 0.25)
      yield actions.toggleInspectMode(showLayover)
    }
  },
  reducer: {
    setOpacity: (state, opacity) => ({ opacity }),
    setMode: (state, grid, mode) => ({ mode }),
    setColor: (state, grid, paintColor) => ({ paintColor }),
    setView: (state, view) => ({ view }),
    turn: (state, turn) => console.log('turn'),
    setSize: () => console.log('set size'),
    setInspectorData: (state, inspectorData) => ({ inspectorData }),
    setInspectMode: (state, inspectMode) => ({ inspectMode })
  }
})

function btnProps (color) {
  return {
    boxShadow: `0 4px rgba(black, .3), 0 4px rgba(${color}, 1)`,
    borderWidth: 0,
    color: 'white',
    bgColor: color,
    fs: 'l',
    w: 49,
    h: 43,
    mb: 4
  }
}

const IconTab = component({
  render ({ props, context }) {
    const { icon, name, setView, current, color = 'blue', ...rest } = props
    const active = name === current

    return (
      <Icon
        p='10'
        userSelect='none'
        color={active ? color : '#BBB'}
        onClick={setView(name)}
        name={icon}
        pointer
        fs='23px'
        {...rest} />
    )
  }
})
