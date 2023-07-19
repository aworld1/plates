# Plates.js - A Lightweight, Smart Stack Tracker

Plates.js is a simple and intelligent stack tracker that allows you to save space while providing version control functionality for your data. It offers a smart way to keep track of changes to objects by storing only the differences between versions, thus minimizing memory consumption.

## Data Storage in the Plates Library

The "plates" library optimizes data storage with the `Data` and `Change` classes, ensuring space efficiency, data integrity, and version control functionality.

### Data Storage Efficiency

The `Data` internal class stores raw data for large changes, eliminating overhead and optimizing space usage. This class is used for larger changes or new data.

The `Change` internal class stores differences between objects, minimizing the stored data and reducing storage requirements. This class is used for incremental changes or large datasets.

By combining these classes, the "plates" library achieves efficient data management, striking a balance between space optimization and data preservation.

## Installation

```bash
npm install platesjs
```

## Usage

### Constructor

To create a new instance of Plates and initialize it with the first value:

```javascript
import { Plates } from 'plates';

const initialData = { name: 'John Doe', age: 30 };
const plates = new Plates(initialData);
```

### Push

Add an object to the stack:

```javascript
const newData = { name: 'Jane Smith', age: 28, occupation: 'Engineer' };
plates.push(newData);
```

### Get

Retrieve the current top of the stack:

```javascript
const currentData = plates.get();
console.log(currentData);
```

### Undo

Move the stack pointer backward:

```javascript
plates.undo();
```

### Redo

Move the stack pointer forward:

```javascript
plates.redo();
```

## Example

```javascript
import { Plates } from 'plates';

// Create a new instance of Plates and initialize it with the first value
const initialData = { name: 'John Doe', age: 30 };
const plates = new Plates(initialData);

// Push new data to the stack
const newData = { name: 'Jane Smith', age: 28, occupation: 'Engineer' };
plates.push(newData);

// Retrieve the current top of the stack
const currentData = plates.get();
console.log('Current Data:', currentData); // Output: { name: 'Jane Smith', age: 28, occupation: 'Engineer' }

// Perform undo and check the data
plates.undo();
const undoData = plates.get();
console.log('Undo Data:', undoData); // Output: { name: 'John Doe', age: 30 }

// Perform redo and check the data
plates.redo();
const redoData = plates.get();
console.log('Redo Data:', redoData); // Output: { name: 'Jane Smith', age: 28, occupation: 'Engineer' }
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/aworld1/plates).

## License

Plates.js is licensed under the [MIT License](https://opensource.org/licenses/MIT).
