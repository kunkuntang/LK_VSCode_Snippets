import React from "react";
import ReactDOM from "react-dom";
import SideBar from "./SideBarPanel.jsx";

console.log("React", React);
console.log("ReactDOM", ReactDOM);

setTimeout(() => {
  main();
}, 100);

function main() {
  ReactDOM.render(<SideBar />, document.getElementById("app1"));
}
