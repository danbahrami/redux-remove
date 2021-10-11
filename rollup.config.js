import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

const packageJson = require("./package.json");

export default {
  input: packageJson.source,
  output: [
    {
      file: packageJson.main,
      format: "cjs",
    },
    {
      file: packageJson.module,
      format: "esm",
    }
  ],
  plugins: [
    external(),
    resolve(),
    babel({ babelHelpers: 'bundled' }),
  ],
  external: Object.keys(packageJson.peerDependencies || {}),
};