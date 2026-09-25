import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ id, children, disabled = false }: { id: string; children: React.ReactNode; disabled?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: disabled ? "auto" : "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default SortableItem;