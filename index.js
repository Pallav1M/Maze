const { Engine, Render, Runner, World, Bodies, Body, MouseConstraint, Mouse, Events } = Matter;

const cells = 3;

const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();
// To disable gravity
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        // wireframes will add colors to the shapes
        // wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Adding the mouse contraint (this will enable us to click and throw the shape within the wall)
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// const shape = Bodies.rectangle(200, 200, 50, 50, {
//     // If I remove the isStatic line, then by default, the shape will tend to fall downward, which means gravity is by default enabled
//     isStatic: true
// });
// World.add(world, shape);

// Walls for the maze 
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// Maze Generation
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};
// Refer to the notes from April 28th for details on how it works
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() =>
        Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() =>
        Array(cells).fill(false));

// console.log(horizontals);
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    // If I have visited the cell at [row,column], then return
    if (grid[row][column]) {
        return;
    }
    // Mark this cell as being visited
    grid[row][column] = true;
    // Assemble randomly ordered list of neighbors
    // Comment out either left or right/top and bottom to see how the array value changes as you move.
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    // console.log(neighbors);
    // For each neighbor
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue;
        }
        // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        // Remove a wall from either horizontals or verticals 
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
    // Visit that next cell
};
// the follwoing will be used for testing purposes. Otherwise, use the default one with generalized startRow and startColumn
// stepThroughCell(1, 1);
stepThroughCell(startRow, startColumn);

// Iterating over horizontals
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            // Refer to the notes from May 2nd, 2021.
            // x index
            columnIndex * unitLength + unitLength / 2,
            // y index
            rowIndex * unitLength + unitLength,
            unitLength,
            5,
            {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });

    // console.log(grid);
});

// Iterating over vertical segments
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            5,
            unitLength,
            {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

// Drawing the goal
const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.7,
    unitLength * 0.7,
    {
        label: 'goal',
        isStatic: true
    }
);
World.add(world, goal);

// Drawing the Ball
const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    // radius
    unitLength / 4, {
    label: 'ball'
}
);
World.add(world, ball);

// Handling Keypress
// Refer to http://keycode.info
// Add anywhere on the screen, then press the keys. Open console top see the changes 
document.addEventListener('keydown', event => {
    // press w to see the values
    const { x, y } = ball.velocity;
    // console.log(x, y);
    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 5 })
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y })
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 })
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y })
    }
    // console.log(event);
})

// Win conditions
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});