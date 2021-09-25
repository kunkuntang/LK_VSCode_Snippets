import React from "react";

export default class SideBar extends React.Component {
  componentDidMount() {
    console.log("iiii", tsvscode);
    tsvscode.postMessage({ command: "checkSettings", value: "info message" });
  }

  handleSetPersonalAccessToken() {
    tsvscode.postMessage({ command: "onInfo", value: "info message" });
  }

  render() {
    return (
      <div>
        <h1>链卡开发助手</h1>
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#636363",
            marginTop: "10px",
          }}
        ></div>

        <h3 style={{ marginTop: "30px" }}>
          请设置 gitlab 的 personal accessToken{" "}
        </h3>
        <div style={{ margin: "15px 0" }}>
          <button onClick={this.handleSetPersonalAccessToken.bind(this)}>
            设置
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <a href="https://www.baidu.com">参考链接</a>
          <a href="https://www.baidu.com">gitlab设置</a>
        </div>
      </div>
    );
  }
}
