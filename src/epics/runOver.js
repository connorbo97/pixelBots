import { endRun, setModalMessage } from '../actions'
import { Observable } from 'rxjs'
import diff from 'deep-diff'

const loseMessage = {
  header: 'Try again',
  body: 'The paintings don\'t quite match up.'
}

const winMessage = {
  header: 'Congratulations',
  body: 'You have successfully painted the picture.'
}

export default function runOver (action$, store) {
  return action$.ofType(endRun.type)
    .map(() => store.getState().game)
    .switchMap((game) =>
      Observable.timer(800)
        .map((obs) => [
          game.painted,
          game.targetPainted
        ])
        .map((sets) => diff(sets[0], sets[1]))
        .map((diffObj) => {
          if (game.targetPainted) {
            if (!diffObj) {
              return setModalMessage(winMessage)
            }
          }
        })
    )
}