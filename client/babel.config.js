// babel.config.js

module.exports = {
    presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }], // Environment preset for Node.js
    ['@babel/preset-react', { runtime: 'automatic' }] // React preset with automatic JSX runtime
    ],
    plugins: [
    'babel-plugin-styled-components', // Enables styled-components support
    '@babel/plugin-proposal-class-properties' // Enables modern class properties
    ]
};


