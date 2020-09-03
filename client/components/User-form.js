import React from 'react'
import {Link} from 'react-router-dom'

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
      <Link to='/play'>
        <button>Play</button>
      </Link>
    </div>
  )
}

export default UserForm
