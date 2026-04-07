<script>
  import { parseTableau, simplexStep, solveSimplex } from '$lib/simplex.js';
  import TableauDisplay from '$lib/TableauDisplay.svelte';

  let input = $state('1,2,1,0,0,4; 2,1,0,1,0,5; -3,-2,0,0,1,0');
  let steps = $state([]);
  let currentStepIndex = $state(-1);
  let error = $state('');

  function findInitialBasicVars(tableau) {
    const m = tableau.length - 1;
    const n = tableau[0].length - 1;
    const basicVars = [];
    for (let i = 0; i < m; i++) {
      let found = -1;
      for (let j = 0; j < n; j++) {
        // Check if column j is a unit vector for row i
        let isUnit = true;
        for (let r = 0; r < tableau.length; r++) {
          if (r === i) {
            if (Math.abs(tableau[r][j] - 1) > 1e-9) isUnit = false;
          } else {
            if (Math.abs(tableau[r][j]) > 1e-9) isUnit = false;
          }
        }
        if (isUnit) {
          found = j;
          break;
        }
      }
      basicVars.push(found);
    }
    return basicVars;
  }

  function loadTableau() {
    try {
      error = '';
      const initialTableau = parseTableau(input);
      const basicVars = findInitialBasicVars(initialTableau);
      steps = [{ 
        tableau: initialTableau.map(row => [...row]), 
        entering: -1, 
        leaving: -1, 
        status: 'initial',
        basicVars: basicVars
      }];
      currentStepIndex = 0;
      calculateNextPivot(0);
    } catch (e) {
      error = 'Invalid input format. Use semicolon for rows and comma for columns.';
    }
  }

  function calculateNextPivot(index) {
    const current = steps[index];
    if (current.status === 'optimal' || current.status === 'unbounded') return;

    // We use simplexStep to find what the NEXT pivot would be
    const result = simplexStep(current.tableau, current.basicVars);
    steps[index] = {
      ...current,
      entering: result.entering,
      leaving: result.leaving,
      nextTableau: result.tableau,
      nextStatus: result.status,
      nextBasicVars: result.basicVars
    };
  }

  function nextStep() {
    const current = steps[currentStepIndex];
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      return;
    }

    if (current.nextStatus === 'continue') {
      const newStep = {
        tableau: current.nextTableau,
        entering: -1,
        leaving: -1,
        status: 'continue',
        basicVars: current.nextBasicVars
      };
      steps.push(newStep);
      currentStepIndex++;
      calculateNextPivot(currentStepIndex);
    } else if (current.nextStatus) {
       const finalStep = {
        tableau: current.nextTableau,
        entering: -1,
        leaving: -1,
        status: current.nextStatus,
        basicVars: current.nextBasicVars
      };
      steps.push(finalStep);
      currentStepIndex++;
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
    }
  }

  function solveAll() {
    if (steps.length === 0) return;
    const initialTableau = steps[0].tableau;
    const initialBasicVars = steps[0].basicVars;
    
    // Re-calculating to match our step-by-step logic which shows pivot on current table
    let allSteps = [{ 
        tableau: initialTableau.map(row => [...row]), 
        entering: -1, 
        leaving: -1, 
        status: 'initial',
        basicVars: initialBasicVars
    }];
    
    let currentIdx = 0;
    while (true) {
        const curr = allSteps[currentIdx];
        const res = simplexStep(curr.tableau, curr.basicVars);
        allSteps[currentIdx].entering = res.entering;
        allSteps[currentIdx].leaving = res.leaving;
        allSteps[currentIdx].nextStatus = res.status;
        allSteps[currentIdx].nextTableau = res.tableau;
        allSteps[currentIdx].nextBasicVars = res.basicVars;

        if (res.status === 'continue') {
            allSteps.push({
                tableau: res.tableau,
                entering: -1,
                leaving: -1,
                status: 'continue',
                basicVars: res.basicVars
            });
            currentIdx++;
        } else {
            allSteps.push({
                tableau: res.tableau,
                entering: -1,
                leaving: -1,
                status: res.status,
                basicVars: res.basicVars
            });
            break;
        }
    }
    steps = allSteps;
    currentStepIndex = steps.length - 1;
  }

  const currentStep = $derived(steps[currentStepIndex]);
</script>

<main>
  <header>
    <h1>Simplexinator</h1>
    <p>Step-by-step Simplex Method Visualization</p>
  </header>

  <section class="input-section">
    <div class="card">
      <h2>Initial Canonical Form</h2>
      <p class="help-text">Enter rows separated by <code>;</code> and values by <code>,</code>. Last column is RHS. Last row is Objective Function.</p>
      <div class="input-group">
        <textarea bind:value={input} placeholder="1,2,1,0,0,4; 2,1,0,1,0,5; -3,-2,0,0,1,0"></textarea>
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <button class="primary" onclick={loadTableau}>Initialize Solver</button>
      </div>
    </div>
  </section>

  {#if currentStep}
    <section class="solver-section">
      <div class="card">
        <div class="step-header">
          <h2>Step {currentStepIndex} 
            <span class="badge {currentStep.status}">
              {currentStep.status.toUpperCase()}
            </span>
          </h2>
          <div class="controls">
            <button onclick={prevStep} disabled={currentStepIndex <= 0}>Previous</button>
            <button class="primary" onclick={nextStep} disabled={currentStep.status === 'optimal' || currentStep.status === 'unbounded'}>Next Step</button>
            <button onclick={solveAll} disabled={currentStep.status === 'optimal' || currentStep.status === 'unbounded'}>Solve All</button>
          </div>
        </div>

        <TableauDisplay 
          tableau={currentStep.tableau} 
          entering={currentStep.entering} 
          leaving={currentStep.leaving} 
          basicVars={currentStep.basicVars}
        />

        <div class="step-info">
          {#if currentStep.status === 'optimal'}
            <div class="alert success">
              <strong>Optimal solution found!</strong> The objective function cannot be improved further.
            </div>
          {:else if currentStep.status === 'unbounded'}
            <div class="alert danger">
              <strong>Problem is unbounded!</strong> The objective function can be increased indefinitely.
            </div>
          {:else if currentStep.entering !== -1}
            <p>
              <strong>Pivot Analysis:</strong><br>
              Entering Variable: <code>x{currentStep.entering + 1}</code> (column {currentStep.entering + 1})<br>
              Leaving Row: <code>Row {currentStep.leaving + 1}</code>
            </p>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <footer>
    <p>Simplexinator &copy; 2026</p>
  </footer>
</main>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    background-color: #f0f2f5;
    color: #1c1e21;
    margin: 0;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    color: #1a73e8;
  }

  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .help-text {
    font-size: 0.9rem;
    color: #606770;
    margin-bottom: 1rem;
  }

  textarea {
    width: 100%;
    height: 100px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  button {
    cursor: pointer;
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    font-weight: 500;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: #f0f2f5;
  }

  button.primary {
    background: #1a73e8;
    color: white;
    border-color: #1a73e8;
  }

  button.primary:hover:not(:disabled) {
    background: #1557b0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #d93025;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step-header h2 {
    margin: 0;
  }

  .badge {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    vertical-align: middle;
    margin-left: 0.5rem;
  }

  .badge.initial { background: #e8f0fe; color: #1a73e8; }
  .badge.continue { background: #fff7e0; color: #b06000; }
  .badge.optimal { background: #e6f4ea; color: #1e8e3e; }
  .badge.unbounded { background: #fce8e6; color: #d93025; }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .step-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .alert {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .alert.success { background: #e6f4ea; color: #1e8e3e; border: 1px solid #ceead6; }
  .alert.danger { background: #fce8e6; color: #d93025; border: 1px solid #fad2cf; }

  footer {
    text-align: center;
    color: #606770;
    margin-top: 2rem;
    font-size: 0.8rem;
  }
</style>
