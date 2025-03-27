/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** Zone.js kötelező az Angularhoz. */
import 'zone.js';  // Angular < 15
// VAGY (Angular 15+):
// import 'zone.js';  

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

/**
 * További polyfill-ek (opcionális, csak szükség esetén):
 */
// import 'core-js/es/array';      // Polyfill Array.prototype.includes stb.
// import 'core-js/es/object';     // Polyfill Object.assign stb.
// import 'core-js/es/promise';    // Polyfill Promise-okhoz
// import 'core-js/es/reflect';    // Szükséges lehet Reflect API-hoz
// import 'core-js/es/symbol';     // Symbol polyfill