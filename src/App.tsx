// connect-4 project with minimax algorithm
import React from 'react';
// enums
import { motion } from 'framer-motion';
import cn from 'classnames';
import Confetti from 'react-confetti';
import { CellType } from './enums';

interface AppState {
	board: string[][];
	turn: CellType;
	winner: CellType | null;
	difficulty: 'normal' | 'hard';
	winningCells: number[][];
}

interface AppProps {}

export class App extends React.Component<AppProps, AppState> {
	private rows: number = 6;
	private cols: number = 7;
	private AI_DELAY: number = 700;

	constructor(props: AppProps) {
		super(props);

		this.state = {
			board: [],
			turn: CellType.player,
			winner: null,
			difficulty: 'hard',
			winningCells: [],
		};

		this.dropPiece = this.dropPiece.bind(this);
		this.resetGame = this.resetGame.bind(this);
		this.getBestMove = this.getBestMove.bind(this);
		this.checkWinner = this.checkWinner.bind(this);
		this.evaluateMove = this.evaluateMove.bind(this);
		this.countThreats = this.countThreats.bind(this);
		this.generateBoard = this.generateBoard.bind(this);
		this.evaluateBoard = this.evaluateBoard.bind(this);
	}

	generateBoard(): string[][] {
		const board: string[][] = [];
		for (let i = 0; i < this.rows; i++) {
			const row: string[] = [];
			for (let j = 0; j < this.cols; j++) {
				row.push(CellType.empty);
			}
			board.push(row);
		}
		return board;
	}

	componentDidMount(): void {
		this.setState({ board: this.generateBoard() });
	}

	dropPiece(col: number): void {
		if (this.state.winner) return;

		const newBoard = [...this.state.board.map((row) => [...row])];
		for (let row = this.rows - 1; row >= 0; row--) {
			if (newBoard[row][col] === CellType.empty) {
				newBoard[row][col] = this.state.turn;
				this.setState({ board: newBoard }, () => {
					const winner = this.checkWinner(newBoard);
					if (winner) {
						this.setState({ winner });
						return;
					}
					if (this.state.turn === CellType.player) {
						this.setState({ turn: CellType.ai }, () => {
							setTimeout(() => this.aiMove(), this.AI_DELAY);
						});
					} else {
						this.setState({ turn: CellType.player });
					}
				});
				break;
			}
		}
	}

	resetGame(): void {
		this.setState({
			board: this.generateBoard(),
			turn: CellType.player,
			winner: null,
			winningCells: [],
		});
	}

	aiMove(): void {
		const bestMove = this.getBestMove();
		console.log('Best move: ', bestMove);
		if (bestMove !== -1) {
			this.dropPiece(bestMove);
		}
	}

	evaluateMove(board: string[][]): number {
		const playerThreats = this.countThreats(board, CellType.player);
		const aiThreats = this.countThreats(board, CellType.ai);
		const winningMove = this.checkWinner(board);
		if (winningMove === CellType.ai) return 1000;
		if (winningMove === CellType.player) return -1000;
		return aiThreats * 10 - playerThreats * 12;
	}

	getBestMove(): number {
		const availableCols = this.state.board[0]
			.map((_, colIndex) => colIndex)
			.filter((col) => this.state.board[0][col] === CellType.empty);

		// 1. Check if the AI can win in the next turn
		for (let col of availableCols) {
			const newBoard = this.state.board.map((row) => [...row]);
			for (let row = this.rows - 1; row >= 0; row--) {
				if (newBoard[row][col] === CellType.empty) {
					newBoard[row][col] = CellType.ai;
					if (this.checkWinner(newBoard) === CellType.ai) return col;
					break;
				}
			}
		}

		// 2. Block the player if he is about to win in the next turn
		for (let col of availableCols) {
			const newBoard = this.state.board.map((row) => [...row]);
			for (let row = this.rows - 1; row >= 0; row--) {
				if (newBoard[row][col] === CellType.empty) {
					newBoard[row][col] = CellType.player;
					if (this.checkWinner(newBoard) === CellType.player)
						return col;
					break;
				}
			}
		}

		// 3. Evaluate the best move based on threats and opportunities
		let bestMove = -1;
		let bestScore = -Infinity;
		for (let col of availableCols) {
			const newBoard = this.state.board.map((row) => [...row]);
			for (let row = this.rows - 1; row >= 0; row--) {
				if (newBoard[row][col] === CellType.empty) {
					newBoard[row][col] = CellType.ai;
					const score = this.evaluateMove(newBoard);
					if (score > bestScore) {
						bestScore = score;
						bestMove = col;
					}
					break;
				}
			}
		}
		return bestMove;
	}

	evaluateBoard(board: string[][]): number {
		let score = 0;

		const directions = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1],
		];

		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				const cell = board[row][col];
				if (cell === CellType.empty) continue;

				for (const [dx, dy] of directions) {
					let count = 1;
					for (let step = 1; step < 4; step++) {
						const newRow = row + dx * step;
						const newCol = col + dy * step;
						if (
							newRow >= 0 &&
							newRow < this.rows &&
							newCol >= 0 &&
							newCol < this.cols &&
							board[newRow][newCol] === cell
						) {
							count++;
						} else {
							break;
						}
					}

					if (count === 4) return cell === CellType.ai ? 1000 : -1000;
					if (count === 3) score += cell === CellType.ai ? 100 : -100;
					if (count === 2) score += cell === CellType.ai ? 10 : -10;
				}
			}
		}
		return score;
	}

	checkWinner(board: string[][]): CellType | null {
		const directions = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1],
		];
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				const cell = board[row][col];
				if (cell === CellType.empty) continue;
				for (const [dx, dy] of directions) {
					let count = 1;
					const winningCells = [[row, col]];
					for (let step = 1; step < 4; step++) {
						const newRow = row + dx * step;
						const newCol = col + dy * step;
						if (
							newRow >= 0 &&
							newRow < this.rows &&
							newCol >= 0 &&
							newCol < this.cols &&
							board[newRow][newCol] === cell
						) {
							count++;
							winningCells.push([newRow, newCol]);
						} else {
							break;
						}
					}
					if (count === 4) {
						return cell as CellType.ai | CellType.player;
					}
				}
			}
		}
		// If no winner is found, return an empty object
		return null;
	}

	countThreats(board: string[][], player: CellType): number {
		let threats = 0;
		const directions = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1],
		];
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				if (board[row][col] === player) {
					for (const [dx, dy] of directions) {
						let count = 1,
							emptyCount = 0;
						for (let step = 1; step < 4; step++) {
							const newRow = row + dx * step;
							const newCol = col + dy * step;
							if (
								newRow >= 0 &&
								newRow < this.rows &&
								newCol >= 0 &&
								newCol < this.cols
							) {
								if (board[newRow][newCol] === player) {
									count++;
								} else if (
									board[newRow][newCol] === CellType.empty
								) {
									emptyCount++;
								}
							} else {
								break;
							}
						}
						if (count === 3 && emptyCount === 1)
							threats += 3; // Alta amenaza
						else if (count === 2 && emptyCount === 2) threats += 1; // Potencial amenaza
					}
				}
			}
		}
		return threats;
	}

	render(): React.ReactNode {
		return (
			<div className="relative w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-[#242424] text-white">
				{this.state.winner && <Confetti />}
				<h1 className="text-4xl font-bold mb-4">Connect 4</h1>
				{this.state.winner ? (
					<h2 className="text-2xl font-bold text-green-400">
						Winner:{' '}
						{this.state.winner === CellType.player ? '😁' : '🤖'}
					</h2>
				) : (
					<h2 className="text-2xl font-bold text-gray-400">
						Turn of:{' '}
						{this.state.turn === CellType.player ? '😁' : '🤖'}
					</h2>
				)}
				<motion.div
					className="grid grid-cols-7 gap-1 border-4 border-blue-500 bg-blue-400 p-4 rounded-lg shadow-lg"
					exit={{ opacity: 0 }}
				>
					{this.state.board.flatMap((row, rowIndex) =>
						row.map((cell, colIndex) => (
							<motion.div
								key={`${rowIndex}-${colIndex}`}
								className={cn(
									'w-16 h-16 flex items-center justify-center bg-blue-300 rounded-full border-2 border-blue-500 cursor-pointer',
									this.state.winningCells.some(
										([r, c]) =>
											r === rowIndex && c === colIndex
									) && 'bg-green-400'
								)}
								onClick={() => this.dropPiece(colIndex)}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', stiffness: 120 }}
							>
								<motion.div
									className={cn(
										'w-12 h-12 rounded-full transition-all',
										cell === CellType.player &&
											'bg-red-500',
										cell === CellType.ai && 'bg-yellow-500'
									)}
									initial={{ y: -50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										type: 'spring',
										stiffness: 100,
									}}
								></motion.div>
							</motion.div>
						))
					)}
				</motion.div>
				{this.state.winner && (
					<button
						onClick={this.resetGame}
						className="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-100 text-white text-lg rounded-md shadow-lg"
					>
						Play Again
					</button>
				)}
			</div>
		);
	}
}

export default App;
