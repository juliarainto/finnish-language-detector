require("isomorphic-unfetch");
const { send } = require("micro");
const { parse } = require("url");
const cors = require("micro-cors")();

const route = async (req, res) => {
  const { query } = parse(req.url, true);
  const { url, token } = query;

  try {
    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status >= 400) {
      throw { message: `Error: ${await response.text()}` };
    }

    const data = await response.json()

    return send(res, 200, {
      success: true,
      bullshits: data.bullshits
    });
  } catch (e) {
    console.log(e);
    return send(res, 400, {success: false, message: e.message.toString() || e.toString()});
  }
};

module.exports = cors(route);
