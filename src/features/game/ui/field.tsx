"use client";
import { GameDomain } from "@/entities/game";
import { cn } from "@/shared/lib/utils";

export function GameField({
  game,
  onCellClick,
}: {
  game: GameDomain.GameEntity;
  onCellClick?: (index: number) => void;
}) {
  const winPositions = game.status === "gameOver" ? game.winPositions ?? [] : [];

  return (
    <div className="grid grid-cols-3">
      {game.field.map((sybmol, index) => (
        <button
          onClick={() => onCellClick?.(index)}
          key={index}
          className={cn(
            "border border-primary w-10 h-10 flex justify-center items-center",
            winPositions.includes(index) && "bg-[#ff00001a]"
          )}
        >
          {sybmol ?? ""}
        </button>
      ))}
    </div>
  );
}
