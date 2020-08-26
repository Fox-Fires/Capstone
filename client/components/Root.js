import React from 'react';
import UserForm from './User-form';
import PlayGame from './PlayGame';
import { database } from '../../Firebase/main';

export default class Root extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      playing: false,
      timer: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleQuit = this.handleQuit.bind(this);
  }

  componentDidMount() {
    //Load data if repeat visitor
    const loadedData = JSON.parse(localStorage.getItem('User-form'));
    this.setState(loadedData);
    database.ref('games/testgame').on('value', function (snap) {
      console.log(snap);
    });
  }

  componentDidUpdate() {
    const loadedData = JSON.parse(localStorage.getItem('User-form'));
    if (this.state !== loadedData) {
      //Save user-settings to local storage
      localStorage.setItem('User-form', JSON.stringify(this.state));
    }
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handlePlay() {
    this.setState({
      playing: true,
    });
  }

  handleQuit() {
    this.setState({
      playing: false,
    });
  }

  render() {
    return (
      <div>
        <h1>Tentative Golf Title</h1>
        <h3>{`timer: ${this.state.timer}`}</h3>
        {this.state.playing !== true ? (
          <UserForm
            {...this.state}
            handleChange={this.handleChange}
            handlePlay={this.handlePlay}
          />
        ) : (
          <div>
            <PlayGame handleQuit={this.handleQuit} />
          </div>
        )}
      </div>
    );
  }
}
