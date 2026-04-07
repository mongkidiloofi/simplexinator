// Simplex algorithm implementation

export function parseTableau(input) {
  const rows = input.trim().split(';').map(row => row.trim().split(',').map(val => parseFloat(val.trim())));
  return rows;
}

export function simplexStep(tableau, basicVars) {
  const m = tableau.length - 1; // number of constraints
  const n = tableau[0].length - 1; // number of variables

  const obj = tableau[m];
  let entering = -1;
  let minVal = 0;
  for (let j = 0; j < n; j++) {
    if (obj[j] < minVal) {
      minVal = obj[j];
      entering = j;
    }
  }

  if (entering === -1) {
    return { status: 'optimal', tableau: [...tableau.map(row => [...row])], entering: -1, leaving: -1, basicVars: [...basicVars] };
  }

  // find leaving
  let leaving = -1;
  let minRatio = Infinity;
  for (let i = 0; i < m; i++) {
    if (tableau[i][entering] > 0) {
      const ratio = tableau[i][n] / tableau[i][entering];
      if (ratio < minRatio) {
        minRatio = ratio;
        leaving = i;
      }
    }
  }

  if (leaving === -1) {
    return { status: 'unbounded', tableau: [...tableau.map(row => [...row])], entering, leaving: -1, basicVars: [...basicVars] };
  }

  // pivot
  const newTableau = pivot(tableau, leaving, entering);
  const newBasicVars = [...basicVars];
  newBasicVars[leaving] = entering;

  return { status: 'continue', tableau: newTableau, entering, leaving, basicVars: newBasicVars };
}

function pivot(tableau, row, col) {
  const newTableau = tableau.map(r => [...r]);
  const pivotVal = newTableau[row][col];

  // divide pivot row
  for (let j = 0; j < newTableau[row].length; j++) {
    newTableau[row][j] /= pivotVal;
  }

  // eliminate other rows
  for (let i = 0; i < newTableau.length; i++) {
    if (i !== row) {
      const factor = newTableau[i][col];
      for (let j = 0; j < newTableau[i].length; j++) {
        newTableau[i][j] -= factor * newTableau[row][j];
      }
    }
  }

  return newTableau;
}

export function solveSimplex(initialTableau, initialBasicVars) {
  let tableau = initialTableau.map(row => [...row]);
  let basicVars = [...initialBasicVars];
  const steps = [{ tableau: tableau.map(row => [...row]), entering: -1, leaving: -1, status: 'start', basicVars: [...basicVars] }];
  while (true) {
    const result = simplexStep(tableau, basicVars);
    steps.push({ 
      tableau: result.tableau.map(row => [...row]), 
      entering: result.entering, 
      leaving: result.leaving,
      status: result.status,
      basicVars: [...result.basicVars]
    });
    if (result.status !== 'continue') {
      return { status: result.status, steps };
    }
    tableau = result.tableau;
    basicVars = result.basicVars;
  }
}