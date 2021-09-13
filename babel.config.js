// https://jestjs.io/docs/getting-started#using-typescript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: ['@babel/plugin-proposal-class-static-block']
}
