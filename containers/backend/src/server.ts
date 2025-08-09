const PORT = parseInt(process.env.PORT || "1234", 10);

console.log("Starting server...");

const state = {
  pods: [],
  ovens: [],
};

setInterval(() => {
  // fetch running pods
}, 5 * 1000);

// start web socket server at port XXXX

// provide
// - ws endpoint to put a new pizza in any available oven

// push changes of ovens to frontend, provide information about how long pizza is in the oven
