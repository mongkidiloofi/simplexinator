# Simplexinator

A web app built with SvelteKit that implements the Simplex method for solving linear programming problems.

## Features

- Input initial simplex tableau in canonical form
- Step through the simplex algorithm one iteration at a time
- Solve the entire problem automatically
- Navigate through solution steps
- Detect optimal solutions or unbounded problems

## Usage

1. Enter the initial simplex tableau as a string with rows separated by semicolons and columns by commas.
   Example: `1,2,1,0,0,4; 2,1,0,1,0,5; -3,-2,0,0,1,0`

2. Click "Load Tableau" to initialize.

3. Use "Next Step" to perform one simplex iteration, or "Solve All" to compute the full solution.

4. Navigate through steps with Previous/Next buttons.

## Development

```sh
npm run dev
```

## Building for Production

```sh
npm run build
```

## Deployment

This app is configured for deployment on Vercel using `@sveltejs/adapter-vercel`.
