import "./utils/config.env.util.js";
import app from "./config/app.js";
import connect from "./config/connect.js";

let port = process.env.PORT || 8080;

(async function () {
  try {
    app.listen(port, () => {
      console.log(`Server fired up : http://localhost:${port}/api/v1`);
    });
    await connect();
    // console.log(process.env.PORT,process.env.MAIL_USER)
  } catch (err) {
    console.error(`Error connecting to anything: ${err}`);
  }
})();
