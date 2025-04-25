const typescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const { visualizer } = require('rollup-plugin-visualizer');
const fs = require('fs');

const analyze = process.env.ANALYZE === 'true';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Custom plugin to handle UMD modules that refer to 'this'
const handleUmdThis = {
  name: 'handle-umd-this',
  transform(code, id) {
    if (id.includes('whatwg-fetch')) {
      // Replace references to 'this' with 'globalThis' which works in all contexts
      return code.replace(/\}\(this,/, '}(globalThis || self || window || global,');
    }
    return null;
  }
};

// Shared plugins for all builds
const plugins = [
  typescript({
    typescript: require('typescript'),
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: true,
      },
    },
  }),
  handleUmdThis,
  terser({
    format: {
      comments: false,
    },
  }),
  analyze && visualizer({
    filename: 'bundle-analysis.html',
    gzipSize: true,
    brotliSize: true,
    open: false,
  }),
].filter(Boolean);

// Create config for each entry point
const createConfig = (input, output) => {
  return [
    // CommonJS build
    {
      input,
      output: {
        file: output.replace('.esm.js', '.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        globals: {
          'whatwg-fetch': 'WHATWGFetch'
        }
      },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins,
    },
    // ES module build
    {
      input,
      output: {
        file: output,
        format: 'es',
        exports: 'named',
        sourcemap: true,
        globals: {
          'whatwg-fetch': 'WHATWGFetch'
        }
      },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins,
    },
  ];
};

module.exports = [
  // Main SDK
  ...createConfig('src/index.ts', 'dist/index.esm.js'),
  // App subpackage
  ...createConfig('src/app/index.ts', 'dist/app/index.esm.js'),
  // Plugin subpackage
  ...createConfig('src/plugin/index.ts', 'dist/plugin/index.esm.js'),
  // Agent subpackage
  ...createConfig('src/agent/index.ts', 'dist/agent/index.esm.js'),
  // Core (common) utilities
  ...createConfig('src/core/index.ts', 'dist/core/index.esm.js'),
]; 