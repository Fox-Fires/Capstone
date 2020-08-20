import React from 'react'

const UserForm = props => {
  return (
    <div className ="user-form">
      <label htmlFor="name">Pick a name!</label>
      <input
        name = "name"
        type = "text"
        value = {props.name}
        onChange = {props.handleChange}
      />
      <button onClick={props.handlePlay}>Play</button>
    </div>
  )
}

export default UserForm
