import firebase from 'firebase'
import createAction from '@f/create-action'
import {refMethod} from 'vdux-fire'

const setUserId = createAction('SET_USER_ID')
const setUsername = createAction('SET_USERNAME')
const signInWithProvider = createAction('SIGN_IN_WITH_PROVIDER')
const signOut = createAction('SIGN_OUT')

const providers = {
  google: () => new firebase.auth.GoogleAuthProvider(),
  facebook: () => new firebase.auth.FacebookAuthProvider()
}



export default ({getState, dispatch}) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      dispatch(setUserId(null))
      return firebase.auth().signInAnonymously()
    }
    if (user && !user.isAnonymous) {
      const username = user.providerData[0].email.split('@')[0]
      dispatch(refMethod({ref: `/users/${username}`, updates: {method: 'once', value: 'value'}})).then((userSnap) => {
        if(!userSnap.exists()) {
          dispatch(refMethod({
            ref: `/users/${username}`,
            updates: {
              method: 'set',
              value: {
                uid: user.uid,
                displayName: user.displayName || user.providerData[0].displayName,
                photoURL: user.photoURL || user.providerData[0].photoURL
              }
            }
          }))
        }
      })
      dispatch(setUsername(username))
    }
  return dispatch(setUserId(user))
  })
  return (next) => (action) => {
  	if (action.type === signInWithProvider.type) {
  		var provider = providers[action.payload]()
			firebase.auth().signInWithPopup(provider).then(function(result) {
				console.log(result)
			}).catch(function(error) {
				if (error.code === 'auth/credential-already-in-use') {
					return firebase.auth().signInWithCredential(error.credential)
				}
			})
  	}
  	if (action.type === signOut.type) {
  		firebase.auth().signOut()
  	}
  	return next(action)
  }
}

export {
	signInWithProvider,
  setUsername,
	setUserId,
	signOut
}