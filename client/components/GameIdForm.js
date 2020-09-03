import React from "react";

const GameIdForm = (props) => {
  return (
    <div className="gameId">
      <label htmlFor="gameId">Enter an Existing Game</label>
      <input
        id="id"
        type="text"
        value={props.gameId}
        onChange={props.handleChange}
      />
    </div>
  );
};

export default GameIdForm;
