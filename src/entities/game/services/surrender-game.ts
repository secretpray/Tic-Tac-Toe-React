import { GameId } from "@/kernel/ids";
import { PlayerEntity } from "../domain";
import { gameRepository } from "../repositories/game";
import { left, right } from "@/shared/lib/either";
import { gameEvents } from "./game-events";

// Вспомогательная функция для вычисления победных позиций
function calculateWinnerPositions(field: Array<string | null>): number[] {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
  for (const [a, b, c] of lines) {
    if (field[a] && field[a] === field[b] && field[a] === field[c]) {
      return [a, b, c];
    }
  }
  
  return [];
}

export async function surrenderGame(gameId: GameId, player: PlayerEntity) {
  const game = await gameRepository.getGame({ id: gameId });
  if (!game) {
    return left("game-not-found" as const);
  }

  if (game.status !== "inProgress") {
    return left("game-is-not-in-progress" as const);
  }

  if (!game.players.some((p) => p.id === player.id)) {
    return left("player-is-not-in-game" as const);
  }

  // При сдаче - не обязательно есть выигрышная позиция,
  // поэтому используем пустой массив по умолчанию
  const winPositions = calculateWinnerPositions(game.field) || [];

  const newGame = await gameRepository.saveGame({
    ...game,
    status: "gameOver",
    winner: game.players.find((p) => p.id !== player.id)!,
    winPositions
  });
  await gameEvents.emit({
    type: "game-changed",
    data: newGame,
  });

  return right(newGame);
}
