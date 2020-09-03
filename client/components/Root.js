import React from "react";
import UserForm from "./User-form";
import GameIdForm from "./GameIdForm";
export default class Root extends React.Component {
  constructor() {
    super();
    this.state = {
      name: "",
      gameId: "",
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    //Load data if repeat visitor
    const loadedData = JSON.parse(localStorage.getItem("User-form"));
    this.setState(loadedData);
  }

  componentDidUpdate() {
    const loadedData = JSON.parse(localStorage.getItem("User-form"));

    if (this.state !== loadedData) {
      //Save user-settings to local storage
      localStorage.setItem("User-form", JSON.stringify(this.state));
    }
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  render() {
    return (
      <div>
        <h1>Tentative Golf Title</h1>
        <UserForm {...this.state.name} handleChange={this.handleChange} />
        <GameIdForm handleChange={this.handleChange} />
      </div>
    );
  }
}
