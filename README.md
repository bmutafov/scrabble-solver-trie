# Trie dictionary

A Trie dictionary with the full list of Bulgarian words. It can search for specific words, but it can also suggest words depending on provided arguments.

## To use:

### Load the dictionary

```typescript
const trie = new Trie();

async function readWords() {
  const allWordsTxt = await fs.promises.readFile("./parser/output.txt");
  const _rawWords = allWordsTxt.toString().split("\r\n");

  _rawWords.forEach((word) => {
    if (word.length > 1) {
      trie.addWord(word);
    }
  });
}
```

### Search for word

```typescript
trie.searchWord("мишка"); // -> true
trie.searchWord("фалкандеш"); // -> false
```

### Starts with

```typescript
// All
trie.startsWith("миш"); // ->
/**
[
  'миша',         'мишата',      'мишелов',     'мишелова',    'мишеловата',
  'мишеловец',    'мишеловеца',  'мишеловецо',  'мишеловецът', 'мишелови',
  'мишеловите',   'мишеловия',   'мишеловият',  'мишеловка',   'мишеловката',
  'мишеловки',    'мишеловките', 'мишелово',    'мишеловото',  'мишеловци',
  'мишеловците',  'мишеморка',   'мишеморката', 'мишеморки',   'мишеморките',
  'мишена',       'мишената',    'мишени',      'мишените',    'миши',
  'мишина',       'мишината',    'мишини',      'мишините',    'мишите',
  'мишия',        'мишият',      'мишка',       'мишката',     'мишки',
  'мишките',      'мишкува',     'мишкувай',    'мишкувайки',  'мишкувайте',
  'мишкувал',     'мишкувала',   'мишкувалата', 'мишкували',   'мишкувалите',
  'мишкувалия',   'мишкувалият', 'мишкувало',   'мишкувалото', 'мишкувам',
  'мишкуваме',    'мишкуван',    'мишкувана',   'мишкуваната', 'мишкуване',
  'мишкуването',  'мишкувани',   'мишкуваните', 'мишкувания',  'мишкуваният',
  'мишкуванията', 'мишкувано',   'мишкуваното', 'мишкуват',    'мишкувате',
  'мишкувах',     'мишкуваха',   'мишкувахме',  'мишкувахте',  'мишкуваш',
  'мишкуваше',    'мишкуващ',    'мишкуваща',   'мишкуващата', 'мишкуващи',
  'мишкуващите',  'мишкуващия',  'мишкуващият', 'мишкуващо',   'мишкуващото',
  'мишле',        'мишлета',     'мишлетата',   'мишлето',     'мишница',
  'мишницата',    'мишници',     'мишниците',   'мишо',        'мишок',
  'мишока',       'мишокът',     'мишото',      'мишоци',      'мишоците',
  ... 4 more items
]
*/

// With search depth
// Searches all words with length <5
trie.startsWith("миш", 5); // ->
/**
 * 
[
  'миша',  'миши', 
  'мишия', 'мишка',
  'мишки', 'мишле',
  'мишо',  'мишок',
  'мишца', 'мишци' 
]
*/

// With specific letters on indexes
// Searches for word starting with "миш" and having "е" on position 5 (i: 4)
trie.startsWith("миш", null, [[], [], [], [], ["е"]]); // -> [ 'миша', 'миши', 'мишле', 'мишлета', 'мишлетата', 'мишлето', 'мишо' ]
```

### Pattern

```typescript
//search for a pattern
//use * as a wildcard
trie.pattern("**шка"); // ->
/**
 * 
[
  'башка', 'вишка', 'въшка',
  'гушка', 'душка', 'лашка',
  'люшка', 'мишка', 'мушка',
  'нишка', 'пешка', 'пишка',
  'пушка', 'пъшка', 'чашка',
  'чешка', 'чушка', 'шашка',
  'шушка'
]
*/
```