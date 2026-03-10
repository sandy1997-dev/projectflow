// src/components/board/CardDragOverlay.tsx
import { CardItem } from './CardItem'

export function CardDragOverlay({ card }: { card: any }) {
  return (
    <div className="rotate-3 opacity-90 shadow-2xl w-[270px]">
      <CardItem card={card} onClick={() => {}} />
    </div>
  )
}
