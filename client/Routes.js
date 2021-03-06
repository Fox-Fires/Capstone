import React, {Component} from 'react'
import {Route,Switch} from 'react-router-dom'
import {
  Root,
  PlayGame
} from './components/'


export class Routes extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Root} />
        <Route path="/play" component={PlayGame} />
      </Switch>
    )
  }
}
