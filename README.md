# Trie dictionary

A Trie dictionary with the full list of Bulgarian words. It can search for specific words, but it can also suggest words depending on provided arguments.

## To use:

### Load the dictionary

```typescript
const trie = new Trie();

async function readWords() {
  // Populate the words from the dictionary
  // into the trie
  await Gaddag.readWords(trie);

  // use the trie functionalities after
  trie.startsWith("опа");
  //...other...
}

function addSingleWord() {
  Gaddag.generateFromWord("тетрис").forEach((word) => trie.addWord(word));
}
```

### Trie functions

```typescript
// All

// startsWith
trie.startsWith("миш"); // All words starting with the provided string
trie.startsWith("миш", 5); // All words starting with the provided stringwith MAX LENGTH = 5

// endsWith
trie.endsWith("нис"); // All words ending with provided string
trie.endsWith("миш", 5); // All words ending with the provided string with MAX LENGTH = 5

// contains
trie.contains("нис"); // All word containing the string

// searchWord
trie.searchWord("мишка"); // True or false, depending if word is found in the tree
```
