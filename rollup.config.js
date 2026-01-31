import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/air-comfort-card.ts',
  output: {
    file: 'dist/air-comfort-card.js',
    format: 'es',
    sourcemap: true
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
