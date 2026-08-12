export const layouts = {
  monolith: {
    columns: [1],
    rows: [1],
    areas: [
      ["a"],
    ],
  },

  twoColumns: {
    columns: [0.5, 0.5],
    rows: [1],
    areas: [
      ["a", "b"],
    ],
  },

  twoRows: {
    columns: [1],
    rows: [0.5, 0.5],
    areas: [
      ["a"],
      ["b"],
    ],
  },

  fourGrid: {
    columns: [0.5, 0.5],
    rows: [0.5, 0.5],
    areas: [
      ["a", "b"],
      ["c", "d"],
    ],
  },

  triangle: {
    columns: [0.5, 0.5],
    rows: [0.5, 0.5],
    areas: [
      ["a", "b"],
      ["c", "c"],
    ],
  },

  flippedTriangle: {
    columns: [0.5, 0.5],
    rows: [0.5, 0.5],
    areas: [
      ["a", "a"],
      ["b", "c"],
    ],
  },
};