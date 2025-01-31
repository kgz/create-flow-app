const assert = require('node:assert').strict;
const test = require('node:test');

test('synchronous passing test', (t) => {
	// This test passes because it does not throw an exception.
	assert.strictEqual(1, 1);
});

test('', function () {
	const result = ();
	expect(result).toEqual();
});
