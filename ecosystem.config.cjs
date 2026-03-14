module.exports = {
  apps: [
    {
      name: "clawdex",
      script: "npm",
      args: "run start",
      cwd: "/var/www/clawdex/current",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
