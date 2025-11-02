const style1 = {
  backgroundColor: "red",
};
export default function App() {
  const style2 = {
    backgroundColor: "green",
  };

  const color = "green";
  let style = "";

  if (color === "green") {
    style = style1;
  } else {
    style = style2;
  }

  return (
    <>
    
    <ul style={style}>
        <li style={{ color: "red"}}>Improve the videophone</li>
      <li>Prepare aeronautics lectures</li>
      <li>Work on the alcohol-fuelled engine</li>
    </ul>
    </>
  );
}
