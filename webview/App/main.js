import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";

console.log("React", React);
console.log("ReactDOM", ReactDOM);
main();

function main() {
  ReactDOM.render(<App />, document.getElementById("app"));
}
