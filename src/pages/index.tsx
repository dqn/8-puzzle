import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { match } from "ts-pattern";

type Pos = {
  row: number;
  col: number;
};

function isSamePos(a: Pos, b: Pos) {
  return a.row === b.row && a.col === b.col;
}

function isSidePos(a: Pos, b: Pos) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

type Piece = {
  num: number;
  pos: Pos;
};

type PieceProps = {
  piece: Piece;
  onClick: (piece: Piece) => void;
};

const Piece: React.FC<PieceProps> = ({ piece, onClick }) => {
  if (piece.num === 9) {
    return null;
  }

  const { row, col } = piece.pos;

  return (
    <button
      className={clsx(
        "absolute h-24 w-24 border text-3xl font-bold duration-[40ms]",
        match(row)
          .with(0, () => "translate-y-0")
          .with(1, () => "translate-y-24")
          .with(2, () => "translate-y-48")
          .run(),
        match(col)
          .with(0, () => "translate-x-0")
          .with(1, () => "translate-x-24")
          .with(2, () => "translate-x-48")
          .run(),
      )}
      onClick={() => onClick(piece)}
    >
      {piece.num}
    </button>
  );
};

type PuzzleProps = {
  pieces: Piece[];
  onClick: (piece: Piece) => void;
};

const Puzzle: React.FC<PuzzleProps> = ({ pieces, onClick }) => {
  return (
    <div className="relative h-72 w-72 border">
      {pieces.map((piece, i) => (
        <Piece piece={piece} onClick={onClick} key={i} />
      ))}
    </div>
  );
};

function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

function shuffle<T>([...arr]: T[]): T[] {
  for (let i = arr.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }

  return arr;
}

function calcPosBySeed(seed: number): Pos {
  return {
    row: Math.floor(seed / 3),
    col: seed % 3,
  };
}

function getInitialPieces(): Piece[] {
  return [...range(0, 9)].map((i) => ({
    num: i + 1,
    pos: calcPosBySeed(i),
  }));
}

const Top: NextPage = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  const reset = useCallback(() => {
    let pieces = getInitialPieces();

    for (const _ of range(0, 100)) {
      const empty = pieces.find((p) => p.num === 9)!;
      const target = shuffle(pieces).find(
        (p) => p.pos.col === empty.pos.col || p.pos.row === empty.pos.row,
      )!;
      pieces = movePiece(pieces, target.pos);
    }

    setPieces(pieces);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const handlePieceClick = useCallback((piece: Piece) => {
    const piecePos = piece.pos;
    setPieces((pieces) => movePiece(pieces, piecePos));
  }, []);

  const movePiece = (pieces: Piece[], pos: Pos) => {
    const emptyPos = pieces.find(({ num }) => num === 9)!.pos;

    if (Math.abs(pos.row - emptyPos.row) === 2 && pos.col === emptyPos.col) {
      pieces = pieces.map((p) =>
        p.pos.col === emptyPos.col
          ? {
              ...p,
              pos: {
                row: (p.pos.row + (pos.row < emptyPos.row ? 1 : 2)) % 3,
                col: p.pos.col,
              },
            }
          : p,
      );
      return pieces;
    } else if (
      Math.abs(pos.col - emptyPos.col) === 2 &&
      pos.row === emptyPos.row
    ) {
      pieces = pieces.map((p) =>
        p.pos.row === emptyPos.row
          ? {
              ...p,
              pos: {
                row: p.pos.row,
                col: (p.pos.col + (pos.col < emptyPos.col ? 1 : 2)) % 3,
              },
            }
          : p,
      );
      return pieces;
    } else if (isSidePos(pos, emptyPos)) {
      pieces = pieces.map((piece) =>
        isSamePos(piece.pos, pos) ? { ...piece, pos: { ...emptyPos } } : piece,
      );
      emptyPos.row = pos.row;
      emptyPos.col = pos.col;
      return pieces;
    }

    return pieces;
  };

  useEffect(() => {
    if (
      pieces.every((piece) =>
        isSamePos(piece.pos, calcPosBySeed(piece.num - 1)),
      )
    ) {
      console.log("clear!");
    }
  }, [pieces]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 place-content-center overflow-x-hidden">
        <Puzzle pieces={pieces} onClick={handlePieceClick} />
      </main>
      <footer className="py-2 text-center text-xs">©︎ 2022 dqn</footer>
    </div>
  );
};

export default Top;
