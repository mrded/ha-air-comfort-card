import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/air-comfort-card.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: 'air-comfort-card.js',
    chunkFileNames: '[name]-[hash].js'
  },
  plugins: [
    resolve(),
    typescript(),
    terser({
      format: {
        comments: false
      }
    })
  ]
};
