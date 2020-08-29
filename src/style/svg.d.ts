/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 *
 * Including this file in a package allows for the use of import statements
 * with SVG files. Example: `import xSvg from 'path/xSvg.svg'`
 *
 * For use with raw-loader in Webpack.
 * The SVG will be imported as a raw string.
 */

declare module '*.svg' {
  const value: string;
  export default value;
}
