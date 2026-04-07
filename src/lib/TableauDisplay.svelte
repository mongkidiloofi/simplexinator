<script>
  let { tableau = [], entering = -1, leaving = -1, basicVars = [] } = $props();

  function isPivotRow(rowIndex) {
    return rowIndex === leaving;
  }

  function isPivotCol(colIndex) {
    return colIndex === entering;
  }

  function isPivotElement(rowIndex, colIndex) {
    return rowIndex === leaving && colIndex === entering;
  }
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th class="empty"></th>
        {#if tableau.length > 0}
          {#each tableau[0] as _, j}
            <th>{j === tableau[0].length - 1 ? '' : `x${j + 1}`}</th>
          {/each}
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each tableau as row, i}
        <tr class:obj-row={i === tableau.length - 1}>
          <td class="row-label">
            {#if i < tableau.length - 1}
              {basicVars[i] !== undefined ? `x${basicVars[i] + 1}` : ''}
            {/if}
          </td>
          {#each row as cell, j}
            <td 
              class:pivot-col={isPivotCol(j)} 
              class:pivot-row={isPivotRow(i)}
              class:pivot-cell={isPivotElement(i, j)}
              class:rhs-col={j === row.length - 1}
            >
              {Number.isInteger(cell) ? cell : cell.toFixed(2)}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow-x: auto;
    margin: 1rem 0;
    display: flex;
    justify-content: center;
  }
  table {
    border-collapse: collapse;
    font-family: 'Times New Roman', serif;
    font-size: 1.1rem;
  }
  th, td {
    border: 1px solid #999;
    padding: 10px 15px;
    text-align: center;
    min-width: 40px;
  }
  th {
    border-top: none;
    border-left: none;
    border-right: none;
    font-weight: normal;
    font-style: italic;
  }
  th.empty {
    border: none;
  }
  .row-label {
    border-top: none;
    border-bottom: none;
    border-left: none;
    font-style: italic;
    padding-right: 15px;
  }
  .rhs-col {
    border-left: 2px solid #555;
  }
  .obj-row td {
    border-top: 2px solid #555;
  }
  .obj-row .row-label {
    border-top: none;
  }

  /* Pivot Highlighting (Keep it subtle or remove if user wants EXACT match) */
  .pivot-row {
    background-color: #fff9c4;
  }
  .pivot-col {
    background-color: #e3f2fd;
  }
  .pivot-cell {
    background-color: #c8e6c9 !important;
    font-weight: bold;
  }
</style>
