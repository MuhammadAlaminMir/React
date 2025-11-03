// ParentComponent.jsx
import Avatar from "./2_MiddleComponent";

export default function ParentComponent() {
  const user = { name: "Lin Lanying", imageId: "1bX5QH6" };

  return (
    <div>
      {/* Passing an object prop and a number prop */}
      <Avatar person={user} size={100} />
    </div>
  );
}
