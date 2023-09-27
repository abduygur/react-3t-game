import "./App.css";
import Menu from "./components/Menu";
import Modal from "./components/Modal";
import Footer from "./components/Footer";
import { Player } from "./types";
import classNames from "classnames";
import { useLocalStorage } from "./useLocalStorage";
import { deriveGame, deriveStats } from "./utils";

export default function App() {
  const [state, setState] = useLocalStorage("game-state-key", {
    currentGameMoves: [],
    history: {
      currentRoundGames: [],
      allGames: [],
    },
  });

  function resetGame(isNewRound: boolean) {
    setState((prev: any) => {
      const stateClone = structuredClone(prev);
      const { status, moves } = game;

      if (status.isComplete) {
        stateClone.history.currentRoundGames.push({
          moves,
          status,
        });
      }

      stateClone.currentGameMoves = [];
      if (isNewRound) {
        stateClone.history.allGames.push(
          ...stateClone.history.currentRoundGames
        );
        stateClone.history.currentRoundGames = [];
      }
      return stateClone;
    });
  }

  const game = deriveGame(state);
  const stats = deriveStats(state);

  function handlePlayerMove(squareId: number, player: Player) {
    setState((prev: any) => {
      const stateClone = structuredClone(prev);

      stateClone.currentGameMoves.push({
        squareId,
        player,
      });

      return stateClone;
    });
  }

  return (
    <>
      <main>
        <div className="grid">
          <div className="turn">
            <i
              // className="fa-solid fa-x yellow"
              className={classNames(
                "fa-solid",
                game.currentPlayer.iconClass,
                game.currentPlayer.colorClass
              )}
            ></i>
            <p className={game.currentPlayer.colorClass}>
              {game.currentPlayer.name}, you're up!
            </p>
          </div>

          <Menu onAction={(action) => resetGame(action === "new-round")} />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((squareId) => {
            const existingMove = game.moves.find(
              (move) => move.squareId === squareId
            );

            return (
              <div
                key={squareId}
                className="square shadow"
                onClick={() => {
                  if (existingMove) return;

                  handlePlayerMove(squareId, game.currentPlayer);
                }}
              >
                {existingMove && (
                  <i
                    className={classNames(
                      "fa-solid",
                      existingMove.player.colorClass,
                      existingMove.player.iconClass
                    )}
                  ></i>
                )}
              </div>
            );
          })}

          <div
            className="score shadow"
            style={{ backgroundColor: "var(--yellow)" }}
          >
            <p>Player 1</p>
            <span>{stats.playerWithStats[0].wins} Wins</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--light-gray)" }}
          >
            <p>Ties</p>
            <span>{stats.ties}</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--turqoise)" }}
          >
            <p>Player 2</p>
            <span>{stats.playerWithStats[1].wins} Wins</span>
          </div>
        </div>
      </main>

      <Footer />
      {game.status.isComplete && (
        <Modal
          message={
            game.status.winner ? `${game.status.winner.name} wins!` : "Tie!"
          }
          onClick={() => resetGame(false)}
        />
      )}
    </>
  );
}
