import React from 'react';
import Phaser from 'phaser';
import Game from '../gameScenes/game';
import GameOver from '../gameScenes/gameOver';
import { Link } from 'react-router-dom';

export default class PlayGame extends React.Component {
  componentDidMount() {
    //Create game when component mounts
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-view',
      'dom.createContainer': true,
      backgroundColor: '#cccccc',
      scene: [Game, GameOver],
    };
    const game = new Phaser.Game(config);
  }
  componentWillUnmount() {
    //Temporary method for removing the game
    document.getElementById('game-view').innerHTML = '';
  }
  render() {
    const { handleQuit } = this.props;
    return (
      <div>
        <h1>Tentative Golf Title</h1>
        <Link to="/">
          <button onClick={handleQuit}>Leave Game</button>
        </Link>
      </div>
    );
  }
}
