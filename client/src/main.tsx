import Didact, { useState } from "didact";
import "./index.css";

const Element = (
  <div>
    <h1 onClick={() => console.log("clicked deno")}>订单信息组件: {name}</h1>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <p>商品主图：</p>
      <img
        className="img"
        src="https://p26-piu.byteimg.com/tos-cn-i-8jisjyls3a/6810e418e90e4bc2936c36b722af78e0~tplv-8jisjyls3a-2:0:0:q75.image"
      />
    </div>
    <a href="https://vite.dev" target="_blank">
      link
    </a>
  </div>
);

const App = (props: { name: JSX.Element }) => {
  const { name } = props;
  const [counter, setCounter] = useState<number>(0);

  console.log(counter);

  return (
    <div>
      <h1 onClick={() => console.log("clicked deno")}>订单信息组件: {name}</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <p>商品主图：</p>
        <img
          className="img"
          src="https://p26-piu.byteimg.com/tos-cn-i-8jisjyls3a/6810e418e90e4bc2936c36b722af78e0~tplv-8jisjyls3a-2:0:0:q75.image"
        />
      </div>
      <a href="https://vite.dev" target="_blank">
        link
      </a>
      <div style={{
        backgroundColor: "#ccc",
        borderRadius: "4px",
        padding: "4px",
        margin: "4px",
        cursor: "pointer",
        color: "#fff",
        width: "100px",
        textAlign: "center",
      }} onClick={() => setCounter(c => c + 1)}>{`Sku Nums: ${counter}`}</div>
    </div>
  );
};

Didact.render(<App name={<span style={{ color: "#666" }}>deno</span>} />, document.getElementById("root")!);
// Didact.render(Element, document.getElementById("root")!);
