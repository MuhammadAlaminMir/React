import Card from "./3_lastComponent";

export default function Avatar({ name, imageId, size }) {
  // props is an object: { person: { name: '...', imageId: '...' }, size: 100 }
  return (
    <>
      <img
        className="avatar"
        src={imageId}
        alt={name}
        width={size}
        height={size}
      />
      <Card>
        <h2>{name}</h2>
        <img className="avatar" src={imageId} />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure soluta
          tenetur aliquam autem, quisquam modi molestiae nemo tempora
          consectetur reiciendis sapiente laudantium accusamus nulla animi
          quidem necessitatibus ipsa, eaque aperiam?
        </p>
      </Card>
    </>
  );
}
