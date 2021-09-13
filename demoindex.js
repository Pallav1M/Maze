const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

const width = 800;
const height = 600;

const engine = Engine.create();
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
    Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
    Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
    Bodies.rectangle(800, 300, 40, 600, { isStatic: true })
];
World.add(world, walls);

// Random Shapes
for (let i = 0; i < 20; i++) {
    if (Math.random() > 0.5) {
        // The following code creates a rectangle that falls down but stops at the border
        World.add
            (world,
                Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
            );
    } else {
        World.add(
            world,
            Bodies.circle(Math.random() * width, Math.random() * height, 35)
        );
    }
}




