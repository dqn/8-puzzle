import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
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

function getInitialPieces(): { pieces: Piece[]; emptyPos: Pos } {
  const seeds = shuffle([...range(0, 9)]);
  const emptyPosSeed = seeds.shift()!; // drop a piece

  return {
    pieces: seeds.map((seed, i) => ({
      num: i + 1,
      pos: calcPosBySeed(seed),
    })),
    emptyPos: calcPosBySeed(emptyPosSeed),
  };
}

const Top: NextPage = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const emptyPosRef = useRef<Pos>({ row: 0, col: 0 });

  const reset = useCallback(() => {
    const { pieces, emptyPos } = getInitialPieces();
    setPieces(pieces);
    emptyPosRef.current = emptyPos;
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const handlePieceClick = useCallback((piece: Piece) => {
    const piecePos = piece.pos;
    const emptyPos = emptyPosRef.current;

    if (
      Math.abs(piecePos.row - emptyPos.row) === 2 &&
      piecePos.col === emptyPos.col
    ) {
      setPieces((pieces) =>
        pieces.map((p) =>
          p.pos.col === emptyPos.col
            ? {
                ...p,
                pos: {
                  row: p.pos.row + (piecePos.row < emptyPos.row ? 1 : -1),
                  col: p.pos.col,
                },
              }
            : p,
        ),
      );
    } else if (
      Math.abs(piecePos.col - emptyPos.col) === 2 &&
      piecePos.row === emptyPos.row
    ) {
      setPieces((pieces) =>
        pieces.map((p) =>
          p.pos.row === emptyPos.row
            ? {
                ...p,
                pos: {
                  row: p.pos.row,
                  col: p.pos.col + (piecePos.col < emptyPos.col ? 1 : -1),
                },
              }
            : p,
        ),
      );
    } else if (isSidePos(piecePos, emptyPos)) {
      emptyPosRef.current = { ...piece.pos };
      setPieces((pieces) =>
        pieces.map((piece) =>
          isSamePos(piece.pos, piecePos)
            ? { ...piece, pos: { ...emptyPos } }
            : piece,
        ),
      );
    } else {
      return;
    }

    emptyPosRef.current = { ...piece.pos };
  }, []);

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
