# Rudimentary Inngest clone

At present, this is just an extremely dumbed-down clone of the automated API setup applications like Innjest use. Currently, running `node src/InngestClone.js` will build a simple express app in this directory with endpoints and functions defined by the mock data at the end of that file. They can be freely edited to create a dynamic API. Each endpoint is the same as the path to its respective file, beginning in the `routes` directory--eg, `/routes/api/example/function.js` can be accessed at `http://localhost:3000/api/example/function`.

The app is in rough state with little to no refractoring. Additionally, there is a lot currently missing, including error handling, differentiation between events and functions, integration with asyncronous architecture like message queues and cron jobs, and so on.
