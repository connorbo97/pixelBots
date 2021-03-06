/**
 * Imports
 */

import IndeterminateProgress from 'components/IndeterminateProgress'
import PlaylistGameLoader from 'components/PlaylistGameLoader'
import PlaylistOptions from 'components/PlaylistOptions'
import Description from 'components/Description'
import EmptyState from 'components/EmptyState'
import LinkModal from 'components/LinkModal'
import {Block, Menu, Image} from 'vdux-ui'
import {component, element} from 'vdux'
import Layout from 'layouts/MainLayout'
import Button from 'components/Button'
import findIndex from '@f/find-index'
import splice from '@f/splice'
import fire from 'vdux-fire'

/**
 * <Playlist View/>
 */

export default fire((props) => ({
  playlist: `/playlists/${props.playlistRef}`,
  myProgress: {
    ref: `/playlistsByUser/${props.uid}/byPlaylistRef/${props.playlistRef}`,
    join: {
      ref: `/playlistInstances`,
      child: 'progressValue',
      childRef: 'instanceRef'
    }
  }
}))(component({
  initialState: {
    target: null,
    dragTarget: null
  },

  render ({props, context, actions, state}) {
    const {playlist, playlistRef, userProfile, myProgress} = props
    const {value: myProgressValue, loading: myProgressLoading} = myProgress
    const {target, dragTarget} = state
    const {uid} = context
    const editable = props.editable === 'edit'

    if (playlist.loading || myProgressLoading) {
      return <IndeterminateProgress />
    }

    const {progressValue = {current: 0}} = (myProgressValue || {})
    const {current, completedChallenges = []} = progressValue

    const {
      sequence = [],
      name,
      followedBy = [],
      creatorID,
      imageUrl,
      creatorUsername,
      shortLink,
      description
    } = playlist.value

    const percent = (completedChallenges.length / sequence.length * 100) + '%'
    const mine = uid === creatorID
    const followed = followedBy[props.username]
    const modalFooter = (
      <Block>
        <Button ml='m' onClick={context.closeModal}>Done</Button>
      </Block>
    )

    const titleActions = (
      <PlaylistOptions
        mine={mine && editable}
        creatorID={creatorID}
        creatorUsername={creatorUsername}
        followed={followed}
        myLists={userProfile && userProfile.lists}
        play={actions.play(current)}
        name={name}
        playable={sequence && sequence.length > 0}
        shortLink={shortLink}
        description={description}
        activeKey={playlistRef}
        setModal={context.openModal(() => <LinkModal
          header='Share Code'
          code={shortLink}
          footer={modalFooter} />)} />
    )

    return (
      <Layout
        bodyProps={{maxWidth: 980, mx: 'auto', mb: 'l'}}>
        <Block mx='20px'>
          <Block align='start' mb='l'>
            <Image
              src={imageUrl || '/animalImages/teacherBot.png'}
              border='1px solid divider'
              sq={150}
              mr='l' />
            <Block column align='space-around' h={150} overflowY='auto' flex mr='l'>
              <Block fs='l'>{name}</Block>
              <Description wide content={description} />
              <Block pill bgColor='#DADADA' relative h={23} overflow='hidden' w='66%' align='center center'>
                <Block absolute tall left bgColor='blue' w={percent} />
                <Block relative bold color='white'>
                  { completedChallenges.length } / { sequence.length }
                </Block>
              </Block>
            </Block>
            <Block column align='start end'>
              {titleActions}
            </Block>
          </Block>
        </Block>
        {
          sequence.length
            ? <Menu mx='20px' column>
                <PlaylistGameLoader
                  completed={completedChallenges}
                  myLists={userProfile && userProfile.lists}
                  dragTarget={dragTarget}
                  dropTarget={target}
                  instanceRef={props.instanceRef}
                  listActions={actions}
                  activeKey={playlistRef}
                  mine={mine && editable}
                  uid={uid}
                  savedRefs={progressValue.savedChallenges}
                  creatorID={creatorID}
                  sequence={sequence} />
              </Menu>
           :  <EmptyState title='Empty Playlist' description={'This playlist doesn\'t have any challenges in it yet.'} />
        }
      </Layout>
    )
  },

  * onUpdate (prev, {actions, props}) {
    if (props.update) {
      const {myProgress} = props
      if (prev.props.myProgress.loading && !myProgress.loading) {
        const {value = []} = myProgress
        const current = value.length
          ? value[0].current
          : 0

        yield actions.play(current)
      }
    }
  },

  controller: {
    * drop ({props, context, state, actions}, idx) {
      const {sequence} = props.playlist.value
      const {dragTarget} = state
      const {playlistRef} = props
      const removeIdx = findIndex(sequence, (val) => val === dragTarget)

      if (sequence.length === 1) {
        yield actions.handleDrop()
      } else {
        yield context.firebaseTransaction(`/playlists/${playlistRef}/sequence`, (seq) => {
          return seq
            ? splice(splice(seq, removeIdx, 1), removeIdx > idx ? idx : idx - 1, 0, dragTarget)
            : 0
        })
        yield actions.handleDrop()
      }
    },

    * copyChallenge ({props, context, actions}, ref) {
      const {playlistRef, playlist = {}} = props
      const {sequence = []} = playlist.value || {}
      const insertIdx = sequence.indexOf(ref) + 1
      const snap = yield context.firebaseOnce(`/games/${ref}`)
      const {key} = yield context.firebasePush('/games', snap.val())
      yield context.firebaseSet(`/playlists/${playlistRef}/sequence`, splice(sequence, insertIdx, 0, key))
    },

    * play ({props, context}, current = 0) {
      const {update, playlistRef, myProgress} = props

      var instanceRef = (myProgress.value || {}).instanceRef

      if (!myProgress.value) {
        const res = yield context.firebasePush(
          `/playlistInstances`,
          initPlaylist(playlistRef, context.uid, update)
        )
        instanceRef = res.key
      }

      yield context.setUrl(`/playlist/${playlistRef}/play/${instanceRef}/${current}`)
    },

    * removeChallenge ({props, context}, gameRef) {
      yield context.firebaseTransaction(
        `/playlists/${props.playlistRef}/sequence`,
        (val) => val.filter((ref) => ref !== gameRef)
      )
    }
  },
  reducer: {
    handleDragEnd: (state) => ({target: null, dragTarget: null}),
    handleDrop: (state) => ({target: null, dragTarget: null}),
    handleDragStart: (state, dragTarget) => ({dragTarget}),
    handleDragEnter: (state, target) => ({target})
  }
}))

const initPlaylist = (ref, uid, update = null) => ({
  completedChallenges: [],
  lastEdited: Date.now(),
  savedChallenges: {},
  assigned: false,
  playlist: ref,
  current: 0,
  update,
  uid
})
