const functions = require('firebase-functions')
const admin = require('firebase-admin')

const usersRef = admin.database().ref('/users')
const playlistRef = admin.database().ref('/playlistsByUser')

module.exports = functions.database.ref('/playlistInstances/{instanceRef}')
  .onWrite(evt => {
    return new Promise((resolve, reject) => {
      const {completed, uid, playlist} = evt.data.val()
      const {completed: prevCompleted} = evt.data.previous.val() || {}
      const {instanceRef} = evt.params
      const childRef = completed ? 'completed' : 'inProgress'
      playlistRef.child(uid).child(childRef).update({
        [instanceRef]: {
          lastEdited: Date.now(),
          playlistRef: playlist
        }
      })
        .then(() => playlistRef.child(uid).child('byPlaylistRef').update({
          [playlist]: {
            lastEdited: Date.now(),
            instanceRef
          }
        }))
        .then(() => {
          if (completed && !prevCompleted) {
            return [
              playlistRef.child(uid).child('inProgress').update({
                [instanceRef]: null
              }),
              usersRef
                .child(uid)
                .child('stats')
                .child('completedPlaylists')
                .transaction(val => (val || 0) + 1)
            ]
          } else return Promise.resolve()
        })
        .then(resolve)
        .catch(reject)
      })
  })
