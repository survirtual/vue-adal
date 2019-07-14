import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/bundle.js',
    format: 'cjs'
  },
  external: [
    'adal-angular'
  ],
  plugins: [
    commonjs(),
    resolve(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      'presets': [['@babel/preset-env', {
        'modules': false,
        'targets': [
          'Chrome >= 52',
          'FireFox >= 44',
          'Safari >= 7',
          'Explorer 11',
          'last 4 Edge versions'
        ]
      }]
      ],
      'plugins': [
        ['module-resolver', {
          'root': ['./src'],
          'alias': {
            '@': './src/',
            '@test': './test'
          }
        }]
      ],
      'sourceMaps': false,
      'retainLines': false
    }),
    replace({
      ' const ': ' var ',
      delimiters: ['', '']
    })
  ]
}
