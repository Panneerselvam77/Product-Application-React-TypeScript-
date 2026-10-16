import Spinner from "react-bootstrap/Spinner";

export default function SpinningLoader() {
  return (
    <div
      className=""
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Spinner animation="border" variant="primary" />
    </div>
  );
}
