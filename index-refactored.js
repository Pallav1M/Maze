const { Engine, Render, Runner, World, Bodies, Body, MouseConstraint, Mouse, Events } = Matter;

const cellsHorizontals = 10;
const cellsVerticals = 12;

const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontals;
const unitLengthY = height / cellsVerticals;

const engine = Engine.create();
// To disable gravity
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        // wireframes will add colors to the shapes
        wireframes: false,
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
const grid = Array(cellsVerticals)
    .fill(null)
    .map(() => Array(cellsHorizontals).fill(false));

const verticals = Array(cellsVerticals)
    .fill(null)
    .map(() =>
        Array(cellsHorizontals - 1).fill(false));

const horizontals = Array(cellsVerticals - 1)
    .fill(null)
    .map(() =>
        Array(cellsHorizontals).fill(false));

// console.log(horizontals);
const startRow = Math.floor(Math.random() * cellsVerticals);
const startColumn = Math.floor(Math.random() * cellsHorizontals);

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
        if (nextRow < 0 || nextRow >= cellsVerticals || nextColumn < 0 || nextColumn >= cellsHorizontals) {
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
            columnIndex * unitLengthX + unitLengthX / 2,
            // y index
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render:
                {
                    fillStyle: 'red'
                }
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
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render:
                {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

// Drawing the goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render:
        {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Drawing the Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    // radius
    ballRadius, {
    label: 'ball',
    render:
    {
        fillStyle: 'blue'
    }
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