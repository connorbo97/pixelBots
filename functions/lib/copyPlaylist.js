const functions = require('firebase-functions')
const cors = require('cors')({origin: true})
const admin = require('firebase-admin')
const express = require('express')
const createCode = require('../utils/createShortCode')

const router = new express.Router()

const playlistsRef = admin.database().ref('/playlists')
const gamesRef = admin.database().ref('/games')
const linksRef = admin.database().ref('/links')

router.use(cors)
router.get('*', (req, res) => {
  return res.send('Can not GET')
})
router.post('/', (req, res) => {
  res.set({'Cache-Control': 'no-cache'})
  const {creatorID, playlistRef, creatorUsername} = req.body
  return playlistsRef.child(playlistRef).once('value')
    .then(snap => Promise.all([Promise.resolve(snap.val()), createCode()]))
    .then(([playlist, code]) => {
      return Promise.all(playlist.sequence.map(gameRef => gamesRef.child(gameRef).once('value')))
        .then(snaps => snaps.map(snap => snap.val()))
        .then(games => Promise.all(games.map(game => gamesRef.push(game))))
        .then(snaps => snaps.map(s => s.key))
        .then(keys => playlistsRef.push(Object.assign({}, playlist, {
          sequence: keys,
          shortLink: code,
          creatorID,
          creatorUsername,
          lastEdited: Date.now(),
          followedBy: {[creatorUsername]: true}
        })))
        .then(({key}) => linksRef.child(code).set({
          type: 'playlist',
          payload: key
        }).then(() => key))
    })
    .then(({key}) => res.status(200).send({status: 'success', playlistKey: key}))
    .catch(e => {
      console.error('error', e)
      return res.status(200).send({status: 'failed', error: e})
    })
})

module.exports = functions.https.onRequest((req, res) => {
  req.url = req.path ? req.url : `/${req.url}`
  return router(req, res)
})
