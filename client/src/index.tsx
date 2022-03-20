import React from "react";
import ReactDOM from "react-dom";
import {
  generateNewURLWithGameKey,
  getGameKeyFromURL,
  loadUserFromLocalStorage,
} from "./browser/BrowserAPI";
import { MainComponent } from "./component/MainComponent";

window.onload = () => {
  const gameKey = getGameKeyFromURL();

  if (gameKey) {
    const mainContainer = document.querySelector("#mainContainer");
    ReactDOM.render(
      <MainComponent gameKey={gameKey} user={loadUserFromLocalStorage()} />,
      mainContainer
    );
  } else {
    window.location.assign(generateNewURLWithGameKey());
  }
};
