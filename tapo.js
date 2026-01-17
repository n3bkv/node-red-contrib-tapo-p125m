"use strict";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = function (RED) {
  const { loginDeviceByIp } = require("tp-link-tapo-connect");

  function getCreds(node, config) {
    // Prefer node credentials (stored in flows_cred.json, not exported)
    const emailCred = (node.credentials?.email || "").trim();
    const passCred  = (node.credentials?.password || "").trim();
    if (emailCred && passCred) return { email: emailCred, password: passCred };

    // Optional fallback to env vars if checkbox enabled
    if (config.useEnv) {
      const emailEnv = (process.env.TAPO_EMAIL || "").trim();
      const passEnv  = (process.env.TAPO_PASSWORD || "").trim();
      return { email: emailEnv, password: passEnv };
    }

    return { email: "", password: "" };
  }

  async function getInfo(device) {
    const info = await device.getDeviceInfo();
    const deviceOn = info?.result?.device_on ?? info?.device_on ?? null;
    const model = info?.result?.model ?? info?.model ?? null;
    return { info, deviceOn, model };
  }

  function makeNodeType(fixedCmd) {
    return function TapoFixedCmdNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;

      node.on("input", async (msg, send, done) => {
        send = send || ((...args) => node.send(...args));
        const ip = String(config.ip || "").trim();

        const retries = Math.max(0, parseInt(config.retries ?? 1, 10) || 0);
        const postDelayMs = Math.max(0, parseInt(config.postDelayMs ?? 0, 10) || 0);

        try {
          const { email, password } = getCreds(node, config);
          if (!email || !password) {
            throw new Error("Missing credentials. Enter Email/Password in the node (credentials) or enable env vars.");
          }
          if (!ip) throw new Error("Missing IP in node config");

          let lastErr;
          for (let i = 0; i <= retries; i++) {
            try {
              node.status({ fill: "blue", shape: "dot", text: `connecting ${ip}` });
              const device = await loginDeviceByIp(email, password, ip);

              if (fixedCmd === "on") await device.turnOn();
              if (fixedCmd === "off") await device.turnOff();
              if (fixedCmd === "on" || fixedCmd === "off") {
                if (postDelayMs) await sleep(postDelayMs);
              }

              const post = await getInfo(device);

              node.status({
                fill: post.deviceOn ? "green" : "red",
                shape: "dot",
                text: post.deviceOn ? "on" : "off"
              });

              msg.payload = {
                ok: true,
                cmd: fixedCmd,
                ip,
                device_on: post.deviceOn,
                model: post.model,
                ...(config.emitRaw ? { raw: post.info } : {})
              };

              send(msg);
              return done();
            } catch (e) {
              lastErr = e;
              if (i < retries) await sleep(200 + i * 200);
            }
          }
          throw lastErr;
        } catch (err) {
          node.status({ fill: "grey", shape: "ring", text: "error" });

