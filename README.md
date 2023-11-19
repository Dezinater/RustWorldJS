# RustWorldJS

## Getting Started

Install the RustWorldJS package into your project
```
npm install rustworld
```


## Usage

```javascript
import * as rustWorld from "rustworld";

import * as fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

fs.readFile(__dirname + '/../../test/test.map', function (err, fileContents) {
    let world = rustWorld.readMap(fileContents);

    rustWorld.writeMap(world).then(bytes => {
        // write bytes to file
    });
});
```

The package comes with Typescript definitions so if you are using Typescript you will be able to see every method and class available to use. To get started take a look at the examples for some code samples.

 - [get-map-size](https://github.com/Dezinater/RustWorldJS/tree/master/test/examples/get-map-size.js)
 - [get-terrainmap-info](https://github.com/Dezinater/RustWorldJS/tree/master/test/examples/get-terrainmap-info.js)
 - [generate-circle-plots](https://github.com/Dezinater/RustWorldJS/tree/master/test/examples/generate-circle-plots.js)
 - [ice-walls](https://github.com/Dezinater/RustWorldJS/tree/master/test/examples/ice-walls.js)


## LZ4 Compression

The original [Rust.World SDK](https://github.com/Facepunch/Rust.World) and the game itself uses LZ4 compression for map reading and writing. They use a library called [lz4net](https://github.com/MiloszKrajewski/lz4net) which is now outdated and has a custom implementation of LZ4. RustWorldJS recreates and uses that same custom implementation of LZ4. 

This custom LZ4 format is a header for LZ4 data which means any LZ4 library can be used to read and write Rust maps if it can read and write the header. To recreate this custom LZ4 format in another language take a look at [LZ4Reader.ts](https://github.com/Dezinater/RustWorldJS/blob/master/src/LZ4Reader.ts#L52) and [worker.cts](https://github.com/Dezinater/RustWorldJS/blob/master/src/worker.cts#L30) for an example on how the header is used.

The LZ4 library used in RustWorldJS is [lz4js](https://github.com/Benzinga/lz4js) but modified to use a hashing method from [lz4net](https://github.com/MiloszKrajewski/lz4net)