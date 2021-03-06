/**
 * Imports
 */

import ModalMessage from 'components/ModalMessage'
import { Block, Icon, Toast, Text } from 'vdux-ui'
import Loading from 'components/Loading'
import Transition from 'vdux-transition'
import { component, element } from 'vdux'
import Router from 'components/Router'
import fire from 'vdux-fire'
import omit from '@f/omit'

/**
 * <App/>
 */

export default fire(props => ({
  userProfile: {
    ref: `/users/${props.uid}#bindAs=object`
  }
}))(
  component({
    initialState: {
      ready: false
    },

    render ({ props, context, state }) {
      const { toast, modal, userProfile, connected = true } = props
      const userProfileValue = userProfile.value || undefined
      return (
        <Block tall relative>
          <Block>
            <Transition>{toast && createToast(toast)}</Transition>
            {modal && createModal(modal)}
          </Block>
          <Block tall>
            {state.ready && context.uid ? (
              <Router
                {...omit(['modal', 'toast'], props)}
                userProfile={userProfileValue}
                {...state} />
            ) : (
              <Loading />
            )}
            {!connected &&
              process.env.NODE_ENV !== 'dev' && (
                <Transition>
                  <Toast
                    key='a'
                    bg='red'
                    color='white'
                    align='center center'
                    w={520}>
                    <Block align='center center'>
                      <Icon name='error' fs='m' mr />
                      <Text fw='bolder' mr>
                        CONNECTION LOST:
                      </Text>
                      <Text fw='lighter'>
                        Please check your internet connection. Refreshing right
                        now will lose progress.
                      </Text>
                    </Block>
                  </Toast>
                </Transition>
              )}
          </Block>
        </Block>
      )
    },

    * onUpdate (prev, next) {
      const { props, actions, state } = next
      const { userProfile = {} } = props

      if (state.ready && prev.props.uid !== next.props.uid) {
        return yield actions.changeUsers()
      }

      if (!state.ready && (!userProfile.loading || userProfile.error)) {
        yield actions.appDidInitialize()
      }
    },

    reducer: {
      appDidInitialize: () => ({ ready: true }),
      changeUsers: () => ({ ready: false })
    }
  })
)

function createToast (message) {
  return (
    <Toast
      fixed
      minHeight='none'
      w='200px'
      textAlign='center'
      bgColor='#333'
      color='white'
      top='8px'
      bottom='none'
      key='toast'>
      <Text>{message}</Text>
    </Toast>
  )
}

function createModal (modal) {
  return typeof modal === 'function' ? (
    modal()
  ) : (
    <ModalMessage
      dismiss={modal.dismiss}
      type={modal.type}
      header={modal.header}
      animals={modal.animals}
      body={modal.body} />
  )
}
